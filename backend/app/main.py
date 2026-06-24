import os
import json
import logging
from fastapi import FastAPI, Depends, UploadFile, File, Form, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.database import Base, engine, get_db
from app.models import User, ResumeAnalysis, AnalysisReport
from app.schemas import AnalysisResponse, DashboardReport
from app.services.document import extract_markdown_from_upload
from app.services.gemini import analyze_resume
from app.services.sheets import upsert_candidate_info
import asyncio

# Configure logging so fallback chain is visible in Render logs
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Resume Analyzer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to frontend domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    # Initialize DB tables (for dev only, use Alembic in production)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables initialized successfully.")

# ─── Health Check (Render pings this to confirm the server is alive) ───
@app.get("/")
async def health_check():
    return {"status": "ok", "service": "Resume Analyzer API"}

@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/api/upload", response_model=AnalysisResponse)
async def upload_resume(
    resume_file: UploadFile = File(...),
    jd_file: UploadFile = File(None),
    jd_text: str = Form(None),           # Accept pasted JD text from frontend
    target_role: str = Form(...),
    user_problems: str = Form(None),     # New: accept user challenges
    user_email: str = Form("guest@example.com"),
    user_name: str = Form("Guest User"),
    db: AsyncSession = Depends(get_db)
):
    try:
        logger.info(f"Upload received: resume='{resume_file.filename}', role='{target_role}', jd_file={'yes' if jd_file else 'no'}, jd_text={'yes' if jd_text else 'no'}, problems={'yes' if user_problems else 'no'}")

        # 1. Ensure user exists
        stmt = select(User).where(User.email == user_email)
        result = await db.execute(stmt)
        user = result.scalars().first()

        if not user:
            user = User(name=user_name, email=user_email)
            db.add(user)
            await db.commit()
            await db.refresh(user)

        # 2. Extract Markdown from Resume using the robust fallback chain
        logger.info("Extracting resume text...")
        resume_md = await extract_markdown_from_upload(resume_file)
        logger.info(f"Resume extracted successfully: {len(resume_md)} chars.")

        # 3. Handle JD — either uploaded file, pasted text, or nothing
        jd_md = None
        if jd_file and jd_file.filename:
            logger.info(f"Extracting JD from uploaded file: {jd_file.filename}")
            jd_md = await extract_markdown_from_upload(jd_file)
        elif jd_text and jd_text.strip():
            logger.info("Using pasted JD text.")
            jd_md = jd_text.strip()

        # 4. Create initial Analysis record
        analysis = ResumeAnalysis(
            user_id=user.id,
            target_role=target_role,
            resume_filename=resume_file.filename,
            jd_filename=jd_file.filename if (jd_file and jd_file.filename) else None,
            user_problems=user_problems
        )
        db.add(analysis)
        await db.commit()
        await db.refresh(analysis)

        # 5. Run Gemini Analysis
        logger.info("Sending to Gemini for analysis...")
        gemini_result = await analyze_resume(resume_md, target_role, jd_md, user_problems)
        logger.info(f"Gemini analysis complete. Employability Score: {gemini_result.employability_score}")

        # Export candidate info to Google Sheets in the background
        if hasattr(gemini_result, 'candidate_info') and gemini_result.candidate_info:
            logger.info("Triggering Google Sheets export...")
            loop = asyncio.get_event_loop()
            loop.run_in_executor(None, upsert_candidate_info, gemini_result.candidate_info)

        # 6. Update Analysis record with scores
        analysis.employability_score = gemini_result.employability_score
        analysis.ats_score = gemini_result.ats_score
        analysis.skill_score = gemini_result.skill_score
        analysis.project_score = gemini_result.project_score
        analysis.portfolio_score = gemini_result.portfolio_score
        analysis.interview_score = gemini_result.interview_score

        # 7. Save detailed Report
        report = AnalysisReport(
            analysis_id=analysis.id,
            strengths_json=gemini_result.strengths,
            weaknesses_json=gemini_result.weaknesses,
            missing_skills_json=gemini_result.missing_skills,
            recommendations_json={
                "skills": gemini_result.recommended_skills,
                "projects": gemini_result.recommended_projects,
                "certifications": gemini_result.recommended_certifications,
                "career_suggestions": gemini_result.career_suggestions,
                "top_rejection_reasons": gemini_result.top_rejection_reasons
            },
            improvement_plan_json=gemini_result.improvement_plan,
            alternative_roles_json=gemini_result.alternative_roles_suggested,
            skill_guide_json=gemini_result.skill_acquisition_guide,
            raw_llm_response=gemini_result.model_dump_json()
        )
        db.add(report)
        await db.commit()

        logger.info(f"Analysis #{analysis.id} saved successfully.")
        return {"analysis_id": analysis.id, "message": "Analysis completed successfully"}

    except Exception as e:
        await db.rollback()
        logger.error(f"Upload/analysis failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/report/{analysis_id}", response_model=DashboardReport)
async def get_report(analysis_id: int, db: AsyncSession = Depends(get_db)):
    # 1. Fetch Analysis & Report
    stmt = select(ResumeAnalysis).where(ResumeAnalysis.id == analysis_id)
    result = await db.execute(stmt)
    analysis = result.scalars().first()

    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")

    stmt_rep = select(AnalysisReport).where(AnalysisReport.analysis_id == analysis_id)
    res_rep = await db.execute(stmt_rep)
    report = res_rep.scalars().first()

    if not report:
        raise HTTPException(status_code=404, detail="Report details not found")

    raw_data = json.loads(report.raw_llm_response)

    return {
        "employability_score": analysis.employability_score,
        "ats_score": analysis.ats_score,
        "skill_score": analysis.skill_score,
        "project_score": analysis.project_score,
        "portfolio_score": analysis.portfolio_score,
        "interview_score": analysis.interview_score,
        "strengths": report.strengths_json or [],
        "weaknesses": report.weaknesses_json or [],
        "missing_skills": report.missing_skills_json or [],
        "recommendations": report.recommendations_json or {},
        "improvement_plan": report.improvement_plan_json or [],
        "alternative_roles_suggested": report.alternative_roles_json or [],
        "skill_acquisition_guide": report.skill_guide_json or [],
        "role_fit": raw_data.get("role_fit_score", 0),
        "estimated_improved_score": raw_data.get("estimated_improved_score", 0)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

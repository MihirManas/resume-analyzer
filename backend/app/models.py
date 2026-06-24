from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    phone = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    analyses = relationship("ResumeAnalysis", back_populates="user")

class ResumeAnalysis(Base):
    __tablename__ = "resume_analyses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    target_role = Column(String, index=True)
    resume_filename = Column(String)
    jd_filename = Column(String, nullable=True)
    user_problems = Column(String, nullable=True)
    
    # Overview Scores
    employability_score = Column(Float, nullable=True)
    ats_score = Column(Float, nullable=True)
    skill_score = Column(Float, nullable=True)
    project_score = Column(Float, nullable=True)
    portfolio_score = Column(Float, nullable=True)
    interview_score = Column(Float, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="analyses")
    report = relationship("AnalysisReport", back_populates="analysis", uselist=False)

class AnalysisReport(Base):
    __tablename__ = "analysis_reports"

    id = Column(Integer, primary_key=True, index=True)
    analysis_id = Column(Integer, ForeignKey("resume_analyses.id"), unique=True)
    
    # Detailed JSON chunks for the dashboard
    strengths_json = Column(JSON, nullable=True)
    weaknesses_json = Column(JSON, nullable=True)
    missing_skills_json = Column(JSON, nullable=True)
    recommendations_json = Column(JSON, nullable=True)
    improvement_plan_json = Column(JSON, nullable=True)
    alternative_roles_json = Column(JSON, nullable=True)
    skill_guide_json = Column(JSON, nullable=True)
    
    # Store the raw text just in case
    raw_llm_response = Column(String, nullable=True)

    analysis = relationship("ResumeAnalysis", back_populates="report")

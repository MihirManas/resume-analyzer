import os
import json
import asyncio
import logging
from google import genai
from google.genai import types
from app.schemas import GeminiOutputFormat
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

# ─── Model Configuration (Precision Focus) ───
# gemini-2.5-flash is PRIMARY for maximum deep reasoning and precision.
# gemini-2.0-flash is FALLBACK.
PRIMARY_MODEL = "gemini-2.5-flash"
FALLBACK_MODEL = "gemini-2.0-flash"

# ─── Retry Configuration (reduced delays for speed) ───
RETRY_DELAYS = [1, 3, 6]  # seconds — faster retries
RETRYABLE_STATUS_CODES = {429, 500, 502, 503, 504}


def _build_prompt(resume_md: str, target_role: str, jd_md: str = None, user_problems: str = None) -> str:
    """Construct the highly precise analysis prompt."""
    jd_context = ""
    if jd_md:
        jd_context = f"""
        JOB DESCRIPTION PROVIDED:
        {jd_md}
        
        Compare the resume heavily against this exact Job Description.
        """
    else:
        jd_context = f"""
        NO JOB DESCRIPTION PROVIDED.
        Compare the resume heavily against industry-standard benchmark profiles and expectations for the target role: {target_role}.
        """

    problems_context = ""
    if user_problems:
        problems_context = f"""
        THE CANDIDATE IS CURRENTLY FACING THESE CHALLENGES:
        "{user_problems}"
        
        You MUST explicitly address these challenges in your analysis, recommendations, and improvement plan. Explain *why* their resume might be causing these specific issues.
        """

    from datetime import datetime
    current_date = datetime.now().strftime("%B %d, %Y")

    return f"""
    You are an elite Senior Recruiter, ATS System, Hiring Manager, and Career Strategist.
    Your job is to deeply analyze the following candidate's resume for the target role: {target_role}.

    CURRENT DATE FOR CONTEXT: {current_date}
    (Do not hallucinate that the current year is 2023 or 2024. Evaluate timelines based on the current date.)

    {jd_context}
    {problems_context}
    
    CANDIDATE RESUME:
    {resume_md}
    
    SCORING & STRATEGY INSTRUCTIONS:
    1. Overall Employability Score should roughly be weighted: 25% Skills, 20% Projects, 15% ATS Quality, 15% Portfolio, 15% Interview Readiness, 10% Experience.
    2. Be strict and highly precise. 90+ is elite, 75-89 is strong, 60-74 average, 40-59 needs improvement, 0-39 high risk.
    3. Evaluate ATS friendliness (keyword usage, structure, readability).
    4. Provide top reasons why they might get rejected.
    5. **Alternative Pathways**: If their skills actually align much better with a different role (e.g., they want Data Analyst but have heavy ML Engineering skills, or vice versa), suggest alternative roles and explain why. If they are perfectly suited for their target role, just reinforce that.
    6. **Skill Acquisition Guide**: Don't just list missing skills. Provide actionable guidance on *how* to acquire them (e.g., specific concepts to learn, tools to master).
    
    7. **Candidate Info Extraction**: Extract personal details: Name, Phone Number, Email, Latest College/University Name, Graduation Year, Speaking Languages. If missing, leave null/empty.
        - **Degree & Branch Splitting**: You must meticulously dissect the degree. If the resume says "BS in data science and applied AI", the `degree` is "BS" and the `branch` is "data science and applied AI". 
        - **Interested Field**: This MUST be set exactly to the target role they entered: "{target_role}".
        - **Potential Field**: Identify the top 1 alternative job role they are most capable of based on your analysis.
    8. **Major Remark for Problem**: Based on the candidate's challenges provided above, provide a single, punchy "major remark" (1-2 sentences) summarizing the core issue holding them back and your primary advice.

    You must output your response STRICTLY as a JSON object matching the provided JSON schema. No markdown wrapping. Take your time to reason deeply and provide the highest precision possible.
    """


def _is_retryable_error(error: Exception) -> bool:
    """Check if an error contains a retryable HTTP status code."""
    error_str = str(error)
    for code in RETRYABLE_STATUS_CODES:
        if str(code) in error_str:
            return True
    retryable_keywords = ["overloaded", "unavailable", "temporarily", "capacity", "rate limit", "quota"]
    for keyword in retryable_keywords:
        if keyword.lower() in error_str.lower():
            return True
    return False


async def _call_gemini_with_retries(client, model_name: str, prompt: str) -> GeminiOutputFormat:
    """
    Call a specific Gemini model with exponential backoff retry logic.
    Retries on 429, 500, 502, 503, 504 errors.
    """
    last_error = None

    for attempt, delay in enumerate(RETRY_DELAYS, start=1):
        try:
            logger.info(f"[Attempt {attempt}/{len(RETRY_DELAYS)}] Calling model: {model_name} | Prompt size: {len(prompt)} chars")

            config_params = {
                "response_mime_type": "application/json",
                "response_schema": GeminiOutputFormat,
                "temperature": 0.2,
            }

            # Allow the thinking model to use its full capacity for high precision
            # Removed the 1024 token limit so it can deeply analyze the resume.
            if "2.5" in model_name:
                config_params["thinking_config"] = types.ThinkingConfig(thinking_budget=4096)

            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
                config=types.GenerateContentConfig(**config_params),
            )

            # Parse the response
            data = json.loads(response.text)
            result = GeminiOutputFormat(**data)

            logger.info(f"[SUCCESS] Model: {model_name} | Employability Score: {result.employability_score}")
            return result

        except Exception as e:
            last_error = e
            if _is_retryable_error(e):
                logger.warning(f"[Attempt {attempt}/{len(RETRY_DELAYS)}] Model {model_name} returned retryable error: {e}")
                if attempt < len(RETRY_DELAYS):
                    logger.info(f"Waiting {delay}s before retry...")
                    await asyncio.sleep(delay)
                    continue
                else:
                    logger.error(f"All {len(RETRY_DELAYS)} retries exhausted for model {model_name}.")
                    raise
            else:
                logger.error(f"Non-retryable error from {model_name}: {e}")
                raise

    raise last_error


async def analyze_resume(resume_md: str, target_role: str, jd_md: str = None, user_problems: str = None) -> GeminiOutputFormat:
    """
    Production-grade Gemini analysis with:
    1. High-precision primary model (2.5 Flash with deep reasoning)
    2. Exponential backoff retries (1s → 3s → 6s)
    3. Automatic model fallback (2.5 Flash → 2.0 Flash)
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or api_key == "your_google_gemini_api_key_here":
        raise Exception("GEMINI_API_KEY is missing or invalid.")

    client = genai.Client(api_key=api_key)
    prompt = _build_prompt(resume_md, target_role, jd_md, user_problems)

    # ─── Try PRIMARY model (fast) with retries ───
    try:
        logger.info(f"Starting analysis with PRIMARY model: {PRIMARY_MODEL}")
        return await _call_gemini_with_retries(client, PRIMARY_MODEL, prompt)
    except Exception as primary_error:
        logger.warning(f"PRIMARY model ({PRIMARY_MODEL}) failed after all retries: {primary_error}")

    # ─── Fallback to SECONDARY model with retries ───
    try:
        logger.info(f"Falling back to SECONDARY model: {FALLBACK_MODEL}")
        return await _call_gemini_with_retries(client, FALLBACK_MODEL, prompt)
    except Exception as fallback_error:
        logger.error(f"FALLBACK model ({FALLBACK_MODEL}) also failed: {fallback_error}")
        # Return the EXACT error so the frontend can display if it's a quota/API key issue
        raise Exception(f"AI Analysis Failed: {str(fallback_error)}")

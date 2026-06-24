from pydantic import BaseModel
from typing import List, Optional, Any

class AnalysisResponse(BaseModel):
    analysis_id: int
    message: str

class CandidateInfo(BaseModel):
    name: Optional[str]
    phone_number: Optional[str]
    email: Optional[str]
    college_name: Optional[str]
    degree: Optional[str]
    branch: Optional[str]
    graduation_year: Optional[str]
    interested_field: Optional[str]
    potential_field: Optional[str]
    speaking_languages: List[str]
    major_remark_for_problem: Optional[str]

class GeminiOutputFormat(BaseModel):
    candidate_info: CandidateInfo
    employability_score: int
    ats_score: int
    skill_score: int
    project_score: int
    portfolio_score: int
    interview_score: int
    role_fit_score: int
    strengths: List[str]
    weaknesses: List[str]
    missing_skills: List[str]
    top_rejection_reasons: List[str]
    recommended_skills: List[str]
    recommended_projects: List[str]
    recommended_certifications: List[str]
    career_suggestions: List[str]
    improvement_plan: List[str]
    alternative_roles_suggested: List[str]
    skill_acquisition_guide: List[str]
    estimated_improved_score: int

class DashboardReport(BaseModel):
    employability_score: int
    ats_score: int
    skill_score: int
    project_score: int
    portfolio_score: int
    interview_score: int
    
    strengths: List[str]
    weaknesses: List[str]
    missing_skills: List[str]
    
    recommendations: dict
    improvement_plan: List[str]
    alternative_roles_suggested: List[str]
    skill_acquisition_guide: List[str]
    
    role_fit: int
    estimated_improved_score: int

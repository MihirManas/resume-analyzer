import os
import logging
import requests
from app.schemas import CandidateInfo

logger = logging.getLogger(__name__)

def upsert_candidate_info(candidate_info: CandidateInfo):
    """
    Export or update the candidate information via Google Apps Script Web App.
    """
    script_url = os.getenv("GOOGLE_APPS_SCRIPT_URL")
    if not script_url:
        logger.error("GOOGLE_APPS_SCRIPT_URL environment variable is missing. Setup Apps Script to fix this.")
        return False
        
    try:
        # Format the languages list to a comma-separated string
        languages = ", ".join(candidate_info.speaking_languages) if candidate_info.speaking_languages else ""
        
        # Prepare the JSON payload
        payload = {
            "name": candidate_info.name or "",
            "phone_number": candidate_info.phone_number or "",
            "email": candidate_info.email or "",
            "college_name": candidate_info.college_name or "",
            "degree": candidate_info.degree or "",
            "branch": candidate_info.branch or "",
            "graduation_year": candidate_info.graduation_year or "",
            "interested_field": candidate_info.interested_field or "",
            "potential_field": candidate_info.potential_field or "",
            "speaking_languages": languages,
            "major_remark": candidate_info.major_remark_for_problem or ""
        }
        
        logger.info(f"Sending data to Google Apps Script for phone: {payload['phone_number']}")
        
        # We must follow redirects for Google Apps Script
        response = requests.post(script_url, json=payload, allow_redirects=True)
        
        if response.status_code in (200, 201):
            logger.info("Successfully synced to Google Sheets!")
            return True
        else:
            logger.error(f"Failed to sync. Status: {response.status_code}, Response: {response.text}")
            return False

    except Exception as e:
        logger.error(f"Failed to push candidate info to Google Sheets: {e}", exc_info=True)
        return False

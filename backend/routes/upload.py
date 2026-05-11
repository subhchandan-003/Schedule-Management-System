import os
import tempfile
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from fastapi.security import HTTPBasic, HTTPBasicCredentials
import secrets

from services.sheet_parser import parse_excel
from services.pdf_extractor import extract_courses_from_pdf
from services.supabase_writer import upsert_schedule_entries, upsert_courses
from models.schemas import ImportResponse, PDFExtractResponse

router = APIRouter(prefix="/upload", tags=["upload"])
security = HTTPBasic()


def verify_admin(credentials: HTTPBasicCredentials = Depends(security)):
    correct_password = os.getenv("ADMIN_PASSWORD", "admin123")
    is_correct = secrets.compare_digest(credentials.password.encode(), correct_password.encode())
    if not is_correct:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return credentials.username


@router.post("/excel", response_model=ImportResponse)
async def upload_excel(
    file: UploadFile = File(...),
    term: str = Form(...),
    _: str = Depends(verify_admin),
):
    if not file.filename.endswith((".xlsx", ".xls")):
        raise HTTPException(status_code=400, detail="Only .xlsx/.xls files accepted")

    contents = await file.read()
    with tempfile.NamedTemporaryFile(suffix=".xlsx", delete=False) as tmp:
        tmp.write(contents)
        tmp_path = tmp.name

    try:
        entries, courses = parse_excel(tmp_path, term)
        entries_count = await upsert_schedule_entries(entries, term)
        courses_count = await upsert_courses(courses, term)
        return ImportResponse(
            success=True,
            entries_imported=entries_count,
            courses_imported=courses_count,
            message=f"Imported {entries_count} entries and {courses_count} courses for Term {term}",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        os.unlink(tmp_path)


@router.post("/pdf", response_model=PDFExtractResponse)
async def upload_pdf(
    file: UploadFile = File(...),
    section: str = Form(...),
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files accepted")
    if section not in ("A", "B"):
        raise HTTPException(status_code=400, detail="Section must be A or B")

    contents = await file.read()
    try:
        courses = await extract_courses_from_pdf(contents, section)
        return PDFExtractResponse(courses=courses, section=section)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF extraction failed: {str(e)}")

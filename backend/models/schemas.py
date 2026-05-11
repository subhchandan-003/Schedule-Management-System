from pydantic import BaseModel
from typing import Optional, List
from datetime import date, time
from uuid import UUID


class ScheduleEntry(BaseModel):
    id: Optional[UUID] = None
    term: str
    date: date
    day_of_week: str
    section: str
    slot_label: str
    slot_start: str
    slot_end: str
    course_code: Optional[str] = None
    course_name_raw: Optional[str] = None
    session_number: Optional[int] = None
    is_special_event: bool = False
    special_event_label: Optional[str] = None
    custom_start_override: Optional[str] = None
    custom_end_override: Optional[str] = None


class Course(BaseModel):
    id: Optional[UUID] = None
    term: str
    code: str
    full_name: str
    credits: Optional[float] = None
    area: Optional[str] = None
    faculty: Optional[str] = None
    faculty_email: Optional[str] = None
    classroom: Optional[str] = None
    sections: Optional[List[str]] = None
    group_email: Optional[str] = None
    total_sessions: Optional[int] = None
    cr_a_name: Optional[str] = None
    cr_a_email: Optional[str] = None
    cr_a_phone: Optional[str] = None
    cr_b_name: Optional[str] = None
    cr_b_email: Optional[str] = None
    cr_b_phone: Optional[str] = None


class ExtractedCourse(BaseModel):
    code: str
    name: str
    credits: Optional[float] = None


class WebhookPayload(BaseModel):
    term: str
    row_number: int
    row_data: dict
    changed_cell: Optional[dict] = None


class ImportResponse(BaseModel):
    success: bool
    entries_imported: int
    courses_imported: int
    message: str = ""


class PDFExtractResponse(BaseModel):
    courses: List[ExtractedCourse]
    section: str

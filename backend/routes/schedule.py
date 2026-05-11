from fastapi import APIRouter, Query
from services.supabase_writer import get_client

router = APIRouter(prefix="/schedule", tags=["schedule"])


@router.get("/entries")
async def get_entries(
    term: str = Query(...),
    section: str = Query(None),
    date_from: str = Query(None),
    date_to: str = Query(None),
):
    sb = get_client()
    q = sb.table("schedule_entries").select("*").eq("term", term)
    if section and section != "BOTH":
        q = q.in_("section", [section, "COMMON"])
    if date_from:
        q = q.gte("date", date_from)
    if date_to:
        q = q.lte("date", date_to)
    result = q.order("date").order("slot_start").execute()
    return result.data or []


@router.get("/courses")
async def get_courses(term: str = Query(...)):
    sb = get_client()
    result = sb.table("courses").select("*").eq("term", term).execute()
    return result.data or []


@router.get("/terms")
async def get_terms():
    sb = get_client()
    result = sb.table("schedule_entries").select("term").execute()
    terms = list({row["term"] for row in (result.data or [])})
    return sorted(terms)

from fastapi import APIRouter, HTTPException
from services.sheet_parser import parse_webhook_row
from services.supabase_writer import upsert_single_entries, get_course_lookup
from models.schemas import WebhookPayload

router = APIRouter(prefix="/webhook", tags=["webhook"])


@router.post("/sheets")
async def receive_sheet_webhook(payload: WebhookPayload):
    try:
        course_lookup = await get_course_lookup(payload.term)
        entries = parse_webhook_row(payload.term, payload.row_data, course_lookup)
        count = await upsert_single_entries(entries)
        return {"received": True, "entries_updated": count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

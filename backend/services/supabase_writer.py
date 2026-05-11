import os
from supabase import create_client, Client
from typing import List


def get_client() -> Client:
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_KEY")
    return create_client(url, key)


async def upsert_schedule_entries(entries: List[dict], term: str) -> int:
    sb = get_client()
    # Delete existing entries for this term first
    sb.table("schedule_entries").delete().eq("term", term).execute()

    if not entries:
        return 0

    # Insert in batches of 500
    batch_size = 500
    total = 0
    for i in range(0, len(entries), batch_size):
        batch = entries[i:i + batch_size]
        sb.table("schedule_entries").insert(batch).execute()
        total += len(batch)
    return total


async def upsert_courses(courses: List[dict], term: str) -> int:
    sb = get_client()
    sb.table("courses").delete().eq("term", term).execute()

    if not courses:
        return 0

    sb.table("courses").insert(courses).execute()
    return len(courses)


async def upsert_single_entries(entries: List[dict]) -> int:
    """Upsert individual entries (for webhook updates)."""
    if not entries:
        return 0
    sb = get_client()
    for entry in entries:
        sb.table("schedule_entries").upsert(entry, on_conflict="term,date,section,slot_label").execute()
    return len(entries)


async def get_course_lookup(term: str) -> dict:
    sb = get_client()
    result = sb.table("courses").select("code,full_name").eq("term", term).execute()
    return {row["code"]: row["full_name"] for row in (result.data or [])}

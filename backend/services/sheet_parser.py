import pandas as pd
import re
from datetime import datetime
from typing import Optional
from models.schemas import ScheduleEntry, Course

TIME_SLOTS = [
    {"label": "Slot 1", "start": "08:00", "end": "09:30"},
    {"label": "Slot 2", "start": "10:00", "end": "11:30"},
    {"label": "Slot 3", "start": "12:00", "end": "13:30"},
    {"label": "Slot 4", "start": "14:30", "end": "16:00"},
    {"label": "Slot 5", "start": "16:30", "end": "18:00"},
    {"label": "Slot 6", "start": "18:30", "end": "20:00"},
    {"label": "Slot 7", "start": "20:30", "end": "22:00"},
]

# Slot column indices in the sheet (0-based, after date/day/section)
# Columns: 0=Date, 1=Day, 2=Section, 3=Slot1, 4=Slot2, 5=Slot3, 6=LUNCH, 7=Slot4, 8=Slot5, 9=Slot6, 10=Slot7
SLOT_COL_TO_INDEX = {3: 0, 4: 1, 5: 2, 7: 3, 8: 4, 9: 5, 10: 6}

SPECIAL_EVENTS = [
    "REGISTRATION", "YOGA", "TEACHERS", "HOLIDAY", "LUNCH BREAK",
    "INTERNATIONAL", "CELEBRATION", "CONVOCATION", "ORIENTATION", "BREAK"
]

SECTION_MAP = {
    "section a": "A",
    "section b": "B",
    "single section": "COMMON",
    "common": "COMMON",
    "both": "COMMON",
}


def normalize_section(raw: str) -> str:
    if not raw or pd.isna(raw):
        return "COMMON"
    s = str(raw).strip().lower()
    for key, val in SECTION_MAP.items():
        if key in s:
            return val
    return "COMMON"


def is_special_event(cell_value: str) -> bool:
    if not cell_value:
        return False
    upper = cell_value.upper()
    return any(kw in upper for kw in SPECIAL_EVENTS)


def parse_custom_time(cell_value: str) -> Optional[tuple]:
    """Extract custom time override from patterns like 'DV-3 (08:45-10:15)'"""
    match = re.search(r'\((\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2})\)', cell_value)
    if match:
        return match.group(1), match.group(2)
    return None


def parse_cell(cell_value: str, course_lookup: dict) -> dict:
    """Parse a schedule cell and return structured info."""
    if not cell_value or pd.isna(cell_value):
        return None
    cell_str = str(cell_value).strip()
    if not cell_str or cell_str.lower() in ("nan", "lunch", "-"):
        return None

    result = {
        "course_code": None,
        "course_name_raw": cell_str,
        "session_number": None,
        "is_special_event": False,
        "special_event_label": None,
        "custom_start_override": None,
        "custom_end_override": None,
    }

    if is_special_event(cell_str):
        result["is_special_event"] = True
        result["special_event_label"] = cell_str
        return result

    # Try Term IV style: CODE-SESSION e.g. "DV-1", "SAPM-2", "OFD-1 (RK)"
    m = re.match(r'^([A-Z]{1,6}(?:[A-Z0-9]{0,4}))\s*[-–]\s*(\d+)', cell_str)
    if m:
        result["course_code"] = m.group(1).strip()
        result["session_number"] = int(m.group(2))
        custom_time = parse_custom_time(cell_str)
        if custom_time:
            result["custom_start_override"] = custom_time[0]
            result["custom_end_override"] = custom_time[1]
        return result

    # Try Term V/VI long name style: "Product Management & Analytics 1 (Prof. Nitin Soni)"
    # Extract session number from end digits before parentheses
    m2 = re.search(r'(.+?)\s+(\d+)\s*(?:\(.*\))?$', cell_str)
    if m2:
        name_part = m2.group(1).strip()
        session = int(m2.group(2))
        result["session_number"] = session
        # Try fuzzy match to known courses
        code = fuzzy_match_course(name_part, course_lookup)
        result["course_code"] = code
        return result

    # Fallback: treat as raw label
    return result


def fuzzy_match_course(name_part: str, course_lookup: dict) -> Optional[str]:
    """Match a long course name to a course code using simple word overlap."""
    if not course_lookup:
        return None
    name_lower = name_part.lower()
    best_score = 0
    best_code = None
    for code, full_name in course_lookup.items():
        words_name = set(re.findall(r'\w+', full_name.lower()))
        words_cell = set(re.findall(r'\w+', name_lower))
        overlap = len(words_name & words_cell)
        if overlap > best_score:
            best_score = overlap
            best_code = code
    return best_code if best_score >= 2 else None


def parse_excel(file_path: str, term: str) -> tuple[list, list]:
    """Parse IIM Sambalpur schedule Excel file. Returns (entries, courses)."""
    xl = pd.ExcelFile(file_path)
    entries = []
    courses = []

    # Try to find course details sheet
    course_lookup = {}
    for sheet_name in xl.sheet_names:
        sn_lower = sheet_name.strip().lower()
        if any(kw in sn_lower for kw in ("cr detail", "classroom", "course detail")):
            courses = parse_courses_sheet(xl, sheet_name, term)
            course_lookup = {c["code"]: c["full_name"] for c in courses}
            break

    # Find schedule sheet
    for sheet_name in xl.sheet_names:
        sn_lower = sheet_name.strip().lower()
        if "schedule" in sn_lower:
            entries = parse_schedule_sheet(xl, sheet_name, term, course_lookup)
            break

    return entries, courses


def parse_schedule_sheet(xl: pd.ExcelFile, sheet_name: str, term: str, course_lookup: dict) -> list:
    """Parse SCHEDULE sheet into list of entry dicts."""
    df = xl.parse(sheet_name, header=0)
    df = df.reset_index(drop=True)

    entries = []
    current_date = None
    current_day = None

    for _, row in df.iterrows():
        # Forward-fill date
        raw_date = row.iloc[0]
        raw_day = row.iloc[1] if len(row) > 1 else None

        if pd.notna(raw_date):
            try:
                if isinstance(raw_date, (datetime, pd.Timestamp)):
                    current_date = raw_date.date()
                else:
                    current_date = pd.to_datetime(str(raw_date)).date()
                if pd.notna(raw_day):
                    current_day = str(raw_day).strip()
            except Exception:
                pass

        if current_date is None:
            continue

        # Section
        raw_section = row.iloc[2] if len(row) > 2 else None
        section = normalize_section(str(raw_section) if pd.notna(raw_section) else "")

        # Parse each slot column
        for col_idx, slot_idx in SLOT_COL_TO_INDEX.items():
            if col_idx >= len(row):
                continue
            cell_val = row.iloc[col_idx]
            if pd.isna(cell_val):
                continue

            parsed = parse_cell(str(cell_val), course_lookup)
            if parsed is None:
                continue

            slot = TIME_SLOTS[slot_idx]
            entry = {
                "term": term,
                "date": str(current_date),
                "day_of_week": current_day or "",
                "section": section,
                "slot_label": slot["label"],
                "slot_start": parsed.get("custom_start_override") or slot["start"],
                "slot_end": parsed.get("custom_end_override") or slot["end"],
                "course_code": parsed.get("course_code"),
                "course_name_raw": parsed.get("course_name_raw"),
                "session_number": parsed.get("session_number"),
                "is_special_event": parsed.get("is_special_event", False),
                "special_event_label": parsed.get("special_event_label"),
                "custom_start_override": parsed.get("custom_start_override"),
                "custom_end_override": parsed.get("custom_end_override"),
            }
            entries.append(entry)

    return entries


def parse_courses_sheet(xl: pd.ExcelFile, sheet_name: str, term: str) -> list:
    """Parse CR DETAILS / CLASSROOM sheet into course dicts."""
    df = xl.parse(sheet_name, header=0)
    df = df.fillna("")
    courses = []

    cols = [str(c).strip().lower() for c in df.columns]

    def get_col(row, keywords):
        for kw in keywords:
            for i, c in enumerate(cols):
                if kw in c:
                    v = row.iloc[i]
                    return str(v).strip() if v else ""
        return ""

    for _, row in df.iterrows():
        code = get_col(row, ["code", "abbr"])
        full_name = get_col(row, ["name", "course name", "full"])
        if not code and not full_name:
            continue

        sections_raw = get_col(row, ["section"])
        sections = []
        if "a" in sections_raw.upper():
            sections.append("A")
        if "b" in sections_raw.upper():
            sections.append("B")
        if not sections:
            sections = ["A", "B"]

        credits_raw = get_col(row, ["credit"])
        try:
            credits = float(credits_raw) if credits_raw else None
        except ValueError:
            credits = None

        total_sessions_raw = get_col(row, ["session", "total"])
        try:
            total_sessions = int(float(total_sessions_raw)) if total_sessions_raw else None
        except ValueError:
            total_sessions = None

        course = {
            "term": term,
            "code": code,
            "full_name": full_name,
            "credits": credits,
            "area": get_col(row, ["area", "specialization"]),
            "faculty": get_col(row, ["faculty", "instructor", "professor"]),
            "faculty_email": get_col(row, ["faculty email", "prof email"]),
            "classroom": get_col(row, ["classroom", "room", "venue"]),
            "sections": sections,
            "group_email": get_col(row, ["group email", "email group"]),
            "total_sessions": total_sessions,
            "cr_a_name": get_col(row, ["cr a name", "cr_a name"]),
            "cr_a_email": get_col(row, ["cr a email", "cr_a email"]),
            "cr_a_phone": get_col(row, ["cr a phone", "cr_a phone"]),
            "cr_b_name": get_col(row, ["cr b name", "cr_b name"]),
            "cr_b_email": get_col(row, ["cr b email", "cr_b email"]),
            "cr_b_phone": get_col(row, ["cr b phone", "cr_b phone"]),
        }
        courses.append(course)

    return courses


def parse_webhook_row(term: str, row_data: dict, course_lookup: dict = None) -> list:
    """Parse a single row from the Google Sheets webhook payload."""
    entries = []
    slot_keys = ["slot1", "slot2", "slot3", "slot4", "slot5", "slot6", "slot7"]

    raw_date = row_data.get("date")
    raw_day = row_data.get("day", "")
    raw_section = row_data.get("section", "")

    try:
        if isinstance(raw_date, (datetime, pd.Timestamp)):
            entry_date = raw_date.date()
        else:
            entry_date = pd.to_datetime(str(raw_date)).date()
    except Exception:
        return entries

    section = normalize_section(raw_section)

    for i, key in enumerate(slot_keys):
        cell_val = row_data.get(key)
        if not cell_val or pd.isna(cell_val) if not isinstance(cell_val, str) else False:
            continue
        if not str(cell_val).strip():
            continue

        parsed = parse_cell(str(cell_val), course_lookup or {})
        if parsed is None:
            continue

        slot = TIME_SLOTS[i]
        entry = {
            "term": term,
            "date": str(entry_date),
            "day_of_week": str(raw_day).strip(),
            "section": section,
            "slot_label": slot["label"],
            "slot_start": parsed.get("custom_start_override") or slot["start"],
            "slot_end": parsed.get("custom_end_override") or slot["end"],
            "course_code": parsed.get("course_code"),
            "course_name_raw": parsed.get("course_name_raw"),
            "session_number": parsed.get("session_number"),
            "is_special_event": parsed.get("is_special_event", False),
            "special_event_label": parsed.get("special_event_label"),
            "custom_start_override": parsed.get("custom_start_override"),
            "custom_end_override": parsed.get("custom_end_override"),
        }
        entries.append(entry)

    return entries

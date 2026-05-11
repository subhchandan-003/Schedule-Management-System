import anthropic
import base64
import json
import re
import os
from typing import List
from models.schemas import ExtractedCourse

EXTRACTION_PROMPT = """You are parsing an IIM Sambalpur MBA course confirmation PDF.
Extract all enrolled courses and return ONLY a JSON array.
Each item must have: code (string), name (string), credits (number).

Known course code patterns:
- Short codes: "DV", "SAPM", "OFD", "CMN", "CS", "WAI", "AMR", "CB", "PM", "MF", "PMA" etc.
- Match course names to codes using fuzzy matching if code not directly visible
- If the PDF lists courses as full names, infer short codes from initials

Return ONLY valid JSON array, no markdown fences, no explanation:
[{"code": "DV", "name": "Data Visualization and Business Storytelling", "credits": 3}, ...]"""


async def extract_courses_from_pdf(pdf_bytes: bytes, section: str) -> List[ExtractedCourse]:
    client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
    pdf_b64 = base64.standard_b64encode(pdf_bytes).decode("utf-8")

    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=2048,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "document",
                        "source": {
                            "type": "base64",
                            "media_type": "application/pdf",
                            "data": pdf_b64,
                        },
                    },
                    {
                        "type": "text",
                        "text": EXTRACTION_PROMPT,
                    },
                ],
            }
        ],
    )

    raw = message.content[0].text.strip()
    raw = re.sub(r"^```(?:json)?\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)

    data = json.loads(raw)
    courses = []
    for item in data:
        courses.append(ExtractedCourse(
            code=str(item.get("code", "")).strip().upper(),
            name=str(item.get("name", "")).strip(),
            credits=float(item["credits"]) if item.get("credits") else None,
        ))
    return courses

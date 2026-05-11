import sys
import os

# Add backend root to path so 'routes', 'services', 'models' are importable
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app  # noqa: F401 — Vercel looks for `app` or `handler`

# Vercel uses the name `app` (ASGI) or `handler` (WSGI)
handler = app

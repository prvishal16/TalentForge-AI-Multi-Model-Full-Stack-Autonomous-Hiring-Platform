import json
import urllib.request
from django.conf import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response


def _call_openrouter(prompt: str, model: str = "openai/gpt-4o-mini") -> str:
    """Thin OpenRouter proxy. Returns '' on any failure so callers can
    fall back gracefully instead of crashing the request."""
    if not settings.OPENROUTER_KEY:
        return ""
    try:
        req = urllib.request.Request(
            f"{settings.OPENROUTER_URL}/chat/completions",
            data=json.dumps({
                "model": model,
                "messages": [{"role": "user", "content": prompt}],
            }).encode(),
            headers={
                "Authorization": f"Bearer {settings.OPENROUTER_KEY}",
                "Content-Type": "application/json",
            },
        )
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read())
            return data["choices"][0]["message"]["content"]
    except Exception:
        return ""


@api_view(["POST"])
def generate_interview(request):
    jd = request.data.get("jobDescription", "")
    text = _call_openrouter(f"Generate 5 interview questions for: {jd}")
    questions = text.splitlines() if text else [
        "Tell me about a challenging project.",
        "How do you approach debugging?",
    ]
    return Response({"questions": [q for q in questions if q.strip()]})


@api_view(["POST"])
def ats(request):
    return Response({"score": 82, "keywords": ["React", "TypeScript", "Leadership"]})


@api_view(["POST"])
def cover_letter(request):
    title = request.data.get("jobTitle", "the role")
    text = _call_openrouter(f"Write a short cover letter for a {title} position.")
    return Response({"letter": text or f"A tailored cover letter draft for the {title} role would appear here."})


@api_view(["POST"])
def career_plan(request):
    return Response({"steps": ["Strengthen core skills", "Build a portfolio project", "Target mid-level roles"]})

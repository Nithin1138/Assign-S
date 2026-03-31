import time
from typing import Optional

from fastapi import HTTPException
import google.generativeai as genai
import requests

from app.core.config import settings


# -----------------------------
# AI CONFIG
# -----------------------------
api_key = settings.GEMINI_API_KEY

if not api_key:
    raise RuntimeError("❌ GEMINI API KEY NOT FOUND")

genai.configure(api_key=api_key)

model = genai.GenerativeModel("gemini-2.0-flash-lite")


# -----------------------------
# GROQ FALLBACK
# -----------------------------
def generate_with_groq(prompt: str):
    api_key = settings.GROQ_API_KEY

    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="Groq API key missing"
        )

    MODELS = [
        "openai/gpt-oss-120b",
        "openai/gpt-oss-20b",
        "openai/gpt-oss-safeguard-120b",
        "groq/compound",    
        "groq/compound-mini",
        "qwen/qwen3-32b",
        "whisper-large-v3",
        "whisper-large-v3-turbo"
    ]

    for model_name in MODELS:
        try:
            print(f"🔄 Trying Groq model: {model_name}")

            payload = {
                "model": model_name,
                "messages": [
                    {"role": "user", "content": prompt}
                ]
            }

            response = requests.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json"
                },
                json=payload,
                timeout=30
            )

            if response.status_code != 200:
                print(f"❌ Groq model failed: {model_name}")
                print(response.text)
                continue

            data = response.json()

            try:
                return data["choices"][0]["message"]["content"]
            except Exception:
                print("⚠️ Bad Groq response format:", data)
                continue

        except Exception as e:
            print(f"🔥 Error with Groq model {model_name}:", str(e))
            continue

    # If all models fail
    raise HTTPException(
        status_code=503,
        detail="All Groq models failed. AI service exhausted."
    )

# -----------------------------
# RESPONSE PARSER
# -----------------------------
def _extract_text_from_response(response) -> str:
    try:
        t = getattr(response, "text", None)
        if t and str(t).strip():
            return str(t).strip()
    except Exception:
        pass

    candidates = getattr(response, "candidates", None) or []
    for cand in candidates:
        content = getattr(cand, "content", None)
        if not content:
            continue

        parts = getattr(content, "parts", None) or []
        for part in parts:
            pt = getattr(part, "text", None)
            if pt and str(pt).strip():
                return str(pt).strip()

    return ""


# -----------------------------
# MAIN FUNCTION
# -----------------------------
def generate_assignment(prompt: str):
    MAX_RETRIES = 2

    for attempt in range(MAX_RETRIES + 1):
        try:
            response = model.generate_content(prompt)

            if not response:
                raise HTTPException(
                    status_code=500,
                    detail="Empty AI response"
                )

            text = _extract_text_from_response(response)

            if text:
                return text

            fb = getattr(response, "prompt_feedback", None)
            block = getattr(fb, "block_reason", None) if fb else None

            if block:
                raise HTTPException(
                    status_code=400,
                    detail=f"AI response blocked: {block}"
                )

            raise HTTPException(
                status_code=500,
                detail="AI returned no usable content"
            )

        except Exception as e:
            error_str = str(e)

            # -----------------------------
            # QUOTA → FALLBACK
            # -----------------------------
            if "429" in error_str or "quota" in error_str.lower():
                print("⚠️ Gemini quota exceeded → switching to Groq")
                return generate_with_groq(prompt)

            # -----------------------------
            # RETRY
            # -----------------------------
            if attempt < MAX_RETRIES:
                time.sleep(1)
                continue

            # -----------------------------
            # FINAL FAIL
            # -----------------------------
            raise HTTPException(
                status_code=503,
                detail=f"AI service busy: {error_str}. Please try again in a few seconds."
            )
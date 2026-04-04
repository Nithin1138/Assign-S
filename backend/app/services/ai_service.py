import asyncio
import logging
import time
from typing import Optional

from fastapi import HTTPException
import google.generativeai as genai
import requests

from app.core.config import settings

# --------------------------------------------------
# LOGGING
# --------------------------------------------------
logger = logging.getLogger(__name__)


# --------------------------------------------------
# GEMINI CONFIG
# --------------------------------------------------
api_key = settings.GEMINI_API_KEY

if not api_key:
    raise RuntimeError("❌ GEMINI API KEY NOT FOUND")

genai.configure(api_key=api_key)
model = genai.GenerativeModel("gemini-2.0-flash-lite")


# --------------------------------------------------
# GROQ FALLBACK
# --------------------------------------------------
def _groq_sync(prompt: str) -> str:
    """Synchronous Groq call — runs inside asyncio.to_thread."""
    groq_key = settings.GROQ_API_KEY

    if not groq_key:
        raise HTTPException(status_code=500, detail="Groq API key missing")

    # High-performance standard Groq models
    MODELS = [
        "openai/gpt-oss-120b",
        "openai/gpt-oss-20b",
        "openai/gpt-oss-safeguard-120b",
        "groq/compound",
        "groq/compound-mini",
        "qwen/qwen3-32b",
        "llama-3.3-70b-versatile",
        "llama-3.1-8b-instant",
        "mixtral-8x7b-32768",
        "gemma2-9b-it",
    ]

    for model_name in MODELS:
        try:
            logger.info("🔄 Trying Groq model: %s", model_name)
            payload = {
                "model": model_name,
                "messages": [{"role": "user", "content": prompt}]
            }
            response = requests.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {groq_key}",
                    "Content-Type": "application/json"
                },
                json=payload,
                timeout=30
            )

            if response.status_code != 200:
                logger.warning("❌ Groq model failed [%s]: %s", model_name, response.text[:200])
                continue

            data = response.json()
            content = data["choices"][0]["message"]["content"]
            if content:
                logger.info("✅ Groq success via %s", model_name)
                return content

        except Exception as e:
            logger.error("🔥 Groq error on %s: %s", model_name, str(e))
            continue

    raise HTTPException(status_code=503, detail="All AI providers (Gemini/Groq) are currently exhausted.")


# --------------------------------------------------
# RESPONSE PARSER
# --------------------------------------------------
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


# --------------------------------------------------
# SYNC AI CALL (runs in thread)
# --------------------------------------------------
def _gemini_sync(prompt: str) -> str:
    """Synchronous Gemini call — runs inside asyncio.to_thread."""
    MAX_RETRIES = 1

    for attempt in range(MAX_RETRIES + 1):
        try:
            response = model.generate_content(prompt)

            if not response:
                raise HTTPException(status_code=500, detail="Empty AI response")

            text = _extract_text_from_response(response)

            if text:
                return text

            fb = getattr(response, "prompt_feedback", None)
            block = getattr(fb, "block_reason", None) if fb else None

            if block:
                raise HTTPException(status_code=400, detail=f"AI response blocked: {block}")

            raise HTTPException(status_code=500, detail="AI returned no usable content")

        except Exception as e:
            error_str = str(e).lower()

            # For safety/block reason, we raise as-is
            if "block" in error_str or "safety" in error_str:
                logger.error("🔥 AI Blocked: %s", error_str)
                raise HTTPException(status_code=400, detail=f"AI Content blocked: {error_str}")

            # For EVERY other error (expire, quota, 400, 429), try Groq Failover
            logger.warning("⚠️ Gemini failure (%s) → Initializing Groq Failover", error_str)
            try:
                return _groq_sync(prompt)
            except HTTPException:
                if attempt < MAX_RETRIES:
                    continue
                raise
            except Exception as fe:
                if attempt < MAX_RETRIES:
                    continue
                logger.error("🔥 AI Failover Failed: %s", str(fe))
                raise HTTPException(status_code=503, detail="AI providers exhausted.")


# --------------------------------------------------
# PUBLIC ASYNC INTERFACE
# --------------------------------------------------
async def generate_assignment(prompt: str) -> str:
    """
    Non-blocking AI generation.
    Offloads the synchronous Gemini/Groq call to a thread pool
    so the event loop is never blocked.
    """
    return await asyncio.to_thread(_gemini_sync, prompt)
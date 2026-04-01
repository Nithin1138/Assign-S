from typing import Any, Optional


def success_response(data: Any = None):
    return {
        "success": True,
        "data": data,
        "error": None
    }


def error_response(message: str, data: Any = None):
    return {
        "success": False,
        "data": data,
        "error": message
    }

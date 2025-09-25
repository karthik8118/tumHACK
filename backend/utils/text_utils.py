import logging

def clean_text(text):
    """
    Ensure text is a UTF-8 string. Replace invalid bytes with �.
    """
    try:
        if isinstance(text, bytes):
            return text.decode("utf-8", errors="replace")
        elif isinstance(text, str):
            return text.encode("utf-8", errors="replace").decode("utf-8")
        else:
            return str(text)
    except Exception as e:
        # fallback
        return str(text)

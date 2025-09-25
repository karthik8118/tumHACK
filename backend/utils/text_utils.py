def clean_text(text):
    """Ensure text is UTF-8 safe."""
    try:
        if isinstance(text, bytes):
            return text.decode("utf-8", errors="replace")
        elif isinstance(text, str):
            return text.encode("utf-8", errors="replace").decode("utf-8")
        else:
            return str(text)
    except Exception:
        return str(text)

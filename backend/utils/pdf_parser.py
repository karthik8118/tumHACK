from pypdf import PdfReader
from backend.utils.text_utils import clean_text

def extract_text_from_fileobj(fileobj, separator="\n\n") -> str:
    reader = PdfReader(fileobj)
    if reader.is_encrypted:
        try:
            reader.decrypt("")
        except Exception as e:
            raise RuntimeError("PDF is encrypted and cannot be decrypted without a password.") from e
    pages = []
    for p in reader.pages:
        text = p.extract_text()
        if text:
            pages.append(clean_text(text))  # <-- ensure UTF-8 safety
    return separator.join(pages)

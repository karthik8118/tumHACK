from pypdf import PdfReader
from io import BytesIO
from backend.utils.text_utils import clean_text

def extract_text_from_pdf(fileobj, separator="\n\n") -> str:
    """Extract text safely from a PDF."""
    if isinstance(fileobj, bytes):
        fileobj = BytesIO(fileobj)
    reader = PdfReader(fileobj)
    if reader.is_encrypted:
        try:
            reader.decrypt("")
        except Exception as e:
            raise RuntimeError("PDF is encrypted and cannot be decrypted.") from e
    pages = []
    for p in reader.pages:
        text = p.extract_text()
        if text:
            pages.append(clean_text(text))
    return separator.join(pages)

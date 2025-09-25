from pypdf import PdfReader
from io import BytesIO

def extract_text_from_pdf(fileobj, separator="\n\n") -> str:
    """
    Extract text safely from all pages of a PDF.
    Handles encoding issues and encrypted PDFs.
    """
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
            pages.append(text)
    return separator.join(pages)

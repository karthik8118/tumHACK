from pypdf import PdfReader

def extract_text_from_fileobj(fileobj, separator="\n\n") -> str:
    """
    Extracts text from all pages of a PDF file object.

    Args:
        fileobj: A file-like object containing the PDF.
        separator (str): Separator used to join page texts. Defaults to double newline.

    Returns:
        str: The extracted text from all pages, separated by the specified separator.
    """
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
            pages.append(text)
    return separator.join(pages)

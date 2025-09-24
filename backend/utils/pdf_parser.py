from pypdf import PdfReader

def extract_text_from_fileobj(fileobj) -> str:
    reader = PdfReader(fileobj)
    pages = []
    for p in reader.pages:
        text = p.extract_text()
        if text:
            pages.append(text)
    return "\n\n".join(pages)

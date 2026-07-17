from __future__ import annotations

from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parents[1]
HTML_FILES = (ROOT / "index.html", ROOT / "resume.html")


class SiteParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.ids: list[str] = []
        self.references: list[tuple[str, str]] = []
        self.images_without_alt: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = dict(attrs)
        element_id = values.get("id")
        if element_id:
            self.ids.append(element_id)

        for attribute in ("href", "src"):
            value = values.get(attribute)
            if value:
                self.references.append((attribute, value))

        if tag == "img" and not values.get("alt"):
            self.images_without_alt.append(values.get("src", "<unknown>"))


def is_external(reference: str) -> bool:
    parsed = urlparse(reference)
    return parsed.scheme in {"http", "https", "mailto", "tel", "data"}


def resolve_reference(html_file: Path, reference: str) -> Path | None:
    clean = reference.split("#", 1)[0].split("?", 1)[0]
    if not clean or is_external(clean):
        return None
    if clean.startswith("/"):
        return ROOT / clean.lstrip("/")
    return html_file.parent / clean


def check_html(html_file: Path) -> list[str]:
    errors: list[str] = []
    parser = SiteParser()
    parser.feed(html_file.read_text(encoding="utf-8"))

    duplicates = sorted({element_id for element_id in parser.ids if parser.ids.count(element_id) > 1})
    if duplicates:
        errors.append(f"{html_file.name}: duplicate ids: {', '.join(duplicates)}")

    for image in parser.images_without_alt:
        errors.append(f"{html_file.name}: image is missing alt text: {image}")

    for attribute, reference in parser.references:
        target = resolve_reference(html_file, reference)
        if target is not None and not target.exists():
            errors.append(f"{html_file.name}: missing {attribute} target: {reference}")

    return errors


def main() -> int:
    errors: list[str] = []

    for html_file in HTML_FILES:
        if not html_file.exists():
            errors.append(f"Missing required page: {html_file.name}")
            continue
        errors.extend(check_html(html_file))

    required_files = (
        ROOT / "styles.20260717.css",
        ROOT / "resume.20260717.css",
        ROOT / "app.20260717.js",
        ROOT / "robots.txt",
        ROOT / "sitemap.xml",
        ROOT / "_headers",
        ROOT / "_redirects",
    )
    for required_file in required_files:
        if not required_file.exists():
            errors.append(f"Missing required file: {required_file.name}")

    if errors:
        print("Site checks failed:")
        for error in errors:
            print(f"- {error}")
        return 1

    print(f"Site checks passed for {len(HTML_FILES)} HTML pages.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

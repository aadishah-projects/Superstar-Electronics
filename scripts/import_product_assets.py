from __future__ import annotations

import json
import re
import shutil
from dataclasses import dataclass
from datetime import date
from io import BytesIO
from pathlib import Path
from urllib.parse import quote, urljoin

import pdfplumber
import requests
from PIL import Image


ROOT = Path(__file__).resolve().parent.parent
ASSETS_DIR = ROOT / "Product-assets"
OUTPUT_PATH = ROOT / "src" / "data" / "product-assets-catalog.json"
IMAGE_DIR = ROOT / "public" / "product-assets-imported"
HEADERS = {"User-Agent": "Mozilla/5.0"}
QUALITY_BASE_URL = "https://qualitycomputer.com.np"

CARD_RE = re.compile(
    r'<form action="/shop/cart/update".*?class="card oe_product_cart.*?</form>',
    re.S,
)
HREF_RE = re.compile(r'itemprop="url" href="([^"]+)"')
NAME_RE = re.compile(r'itemprop="name"[^>]*title="([^"]+)"')
IMAGE_RE = re.compile(r'<img src="([^"]+)"')

PRICE_SUFFIX_RE = re.compile(r"Rs\.?\s*(.+)", re.I | re.S)
PARENS_RE = re.compile(r"\(([^)]+)\)")

CATEGORY_DEFS = {
    "cctv-cameras": {
        "name": "CCTV Cameras",
        "description": "Analog, IP, turret, dome, bullet, PTZ, and dash cameras for surveillance coverage.",
        "inquiryLabel": "CCTV cameras",
        "sourceSummary": "Super Star Electronics price-list assets and imported MRP catalog",
    },
    "dvr-nvr-systems": {
        "name": "DVR & NVR Systems",
        "description": "Recorders and storage-focused surveillance systems for playback, retention, and multi-camera setups.",
        "inquiryLabel": "DVR and NVR systems",
        "sourceSummary": "Super Star Electronics price-list assets and imported MRP catalog",
    },
    "poe-gigabit-switches": {
        "name": "POE & Gigabit Switches",
        "description": "Network switches for powering IP cameras, expanding wired connectivity, and surveillance deployments.",
        "inquiryLabel": "POE and gigabit switches",
        "sourceSummary": "Super Star Electronics price-list assets and imported MRP catalog",
    },
    "accessories-cables": {
        "name": "Accessories, Power & Cables",
        "description": "Cable, power, adapters, modules, and other infrastructure accessories used in CCTV and network setups.",
        "inquiryLabel": "accessories, power, and cables",
        "sourceSummary": "Super Star Electronics price-list assets and imported MRP catalog",
    },
    "biometrics-access": {
        "name": "Biometrics & Access Control",
        "description": "Fingerprint terminals, face recognition, locks, and access-control products for offices and entry management.",
        "inquiryLabel": "biometric and access control devices",
        "sourceSummary": "Super Star Electronics price-list assets and imported MRP catalog",
    },
    "video-intercom": {
        "name": "Video Intercom",
        "description": "Indoor monitors, door stations, IP intercom kits, and related video door-phone products.",
        "inquiryLabel": "video intercom products",
        "sourceSummary": "Super Star Electronics price-list assets and imported MRP catalog",
    },
    "monitors-displays": {
        "name": "Monitors & Displays",
        "description": "Security monitors and commercial display panels for surveillance viewing and digital display use.",
        "inquiryLabel": "monitors and displays",
        "sourceSummary": "Super Star Electronics price-list assets and imported MRP catalog",
    },
    "interactive-boards": {
        "name": "Interactive Boards",
        "description": "Interactive display boards, OPS modules, and related classroom and meeting-room display products.",
        "inquiryLabel": "interactive boards",
        "sourceSummary": "Super Star Electronics price-list assets and imported MRP catalog",
    },
}

CATEGORY_ORDER = [
    "cctv-cameras",
    "dvr-nvr-systems",
    "poe-gigabit-switches",
    "accessories-cables",
    "biometrics-access",
    "video-intercom",
    "monitors-displays",
    "interactive-boards",
]


@dataclass(frozen=True)
class AssetFileConfig:
    filename: str
    label: str
    brand: str


FILE_CONFIGS = [
    AssetFileConfig(
        filename="SUPER STAR ELECTRONICS INDUSTIRES  Video intercom (DPP,MRP)updated-29 April 2026 .pdf",
        label="Video Intercom Price List",
        brand="Hikvision",
    ),
    AssetFileConfig(
        filename="SUPER STAR ELECTRONICS INDUSTRIES   Camera Price List (DPP,MRP)-21st April 2026.pdf",
        label="Camera Price List",
        brand="Hikvision",
    ),
    AssetFileConfig(
        filename="SUPER STAR ELECTRONICS INDUSTRIES   Interactive Board Price List(DPP,MRP)- 21 April 2026.pdf",
        label="Interactive Board Price List",
        brand="Hikvision",
    ),
    AssetFileConfig(
        filename="SUPER STAR ELECTRONICS INDUSTRIES   Monitor Price List(DPP, MRP)-21 April 2026.pdf",
        label="Monitor Price List",
        brand="Hikvision",
    ),
    AssetFileConfig(
        filename="SUPER STAR ELECTRONICS INDUSTRIES  Hikvision HDD and cable (DPP,MRP))- 21st April 2026 .pdf",
        label="Hikvision HDD and Cable Price List",
        brand="Hikvision",
    ),
    AssetFileConfig(
        filename="SUPER STAR ELECTRONICS INDUSTRIES  SWITCH(DPP,MRP)-21 April 2026.pdf",
        label="Switch Price List",
        brand="Hikvision",
    ),
    AssetFileConfig(
        filename="SUPER STAR ELECTRONICS INDUSTRIES  Video intercom (DPP,MRP)updated-21 April 2026.pdf",
        label="Video Intercom Price List",
        brand="Hikvision",
    ),
    AssetFileConfig(
        filename="SUPER STAR ELECTRONICS INDUSTRIES HILOOK Price list (DPP AND MRP)-2026 21st april.pdf",
        label="HiLook Price List",
        brand="HiLook",
    ),
]

MODEL_PREFIXES = [
    "DS-",
    "IPC-",
    "IPC",
    "NVRA-",
    "NVR-",
    "NVR",
    "NS-",
    "NC-",
    "AE-",
    "HK-SFP-",
    "K1T",
    "K1R",
]

MODEL_STOP_WORDS = [
    "Pro",
    "Face",
    "Fingerprint",
    "Terminal",
    "Smart",
    "Monitor",
    "Camera",
    "Bullet",
    "Dome",
    "Turret",
    "Kit",
    "Door",
    "Stand",
]

SEARCH_CACHE: dict[str, list[dict[str, str]]] = {}


def clean_text(value: str) -> str:
    return " ".join((value or "").replace("\n", " ").split())


def slugify(value: str) -> str:
    text = re.sub(r"[^a-z0-9]+", "-", value.lower())
    return text.strip("-") or "item"


def normalize_token(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "", value.lower())


def parse_price(value: str) -> int | None:
    text = clean_text(value)
    if not text:
        return None

    target = PRICE_SUFFIX_RE.search(text)
    payload = target.group(1) if target else text
    digits = re.sub(r"[^0-9,]", "", payload)
    digits = digits.strip(",")
    if not digits:
        return None
    return int(digits.replace(",", ""))


def trim_word_suffix(value: str) -> str:
    for stop_word in MODEL_STOP_WORDS:
        marker = value.find(stop_word)
        if marker > 0:
            return value[:marker]
    for index, char in enumerate(value):
        if char.islower():
            cut = index - 1 if index > 0 and value[index - 1].isupper() else index
            return value[:cut]
    return value


def normalize_model(candidate: str) -> str:
    value = candidate.strip(" -_/")
    value = value.split("(")[0].strip(" -_/")
    value = trim_word_suffix(value)

    if value.startswith("IPC") and not value.startswith("IPC-") and len(value) > 3:
        value = f"IPC-{value[3:]}"
    if value.startswith("NVRA") and not value.startswith("NVRA-") and len(value) > 4:
        value = f"NVRA-{value[4:]}"
    if value.startswith("NVR") and not value.startswith("NVR-") and len(value) > 3:
        value = f"NVR-{value[3:]}"
    if value.startswith("DS") and not value.startswith("DS-") and len(value) > 2:
        value = f"DS-{value[2:]}"

    return value.strip(" -_/")


def finalize_product_name(name: str, brand: str, model: str | None) -> str:
    cleaned = clean_text(name.replace("( )", " ").replace("()", " "))

    if brand and model:
        prefix = f"{brand} {model}"
        if cleaned.startswith(prefix):
            suffix = cleaned[len(prefix) :].strip(" -_/")
            suffix_key = normalize_token(suffix)
            model_key = normalize_token(model)
            if not suffix_key or suffix_key in model_key or model_key in suffix_key:
                return prefix
            return f"{prefix} {suffix}".strip()

    return cleaned


def extract_model(raw_cell: str, description: str) -> str | None:
    raw = clean_text(raw_cell)
    if not raw:
        return None

    collapsed = raw.replace(" ", "")
    for prefix in MODEL_PREFIXES:
        position = collapsed.find(prefix)
        if position >= 0:
            tail = collapsed[position:]
            boundary = tail.find("(")
            if boundary >= 0:
                tail = tail[:boundary]
            return normalize_model(tail)

    first_token = raw.split()[0]
    if first_token:
        model = normalize_model(first_token)
        if any(char.isdigit() for char in model):
            return model

    fallback = clean_text(description).split()
    if fallback:
        token = normalize_model(fallback[0])
        if any(char.isdigit() for char in token):
            return token

    return None


def build_product_name(brand: str, model: str | None, raw_cell: str, description: str) -> str:
    labels = [
        clean_text(item)
        for item in PARENS_RE.findall(raw_cell)
        if clean_text(item) and len(normalize_token(clean_text(item))) > 1
    ]
    if labels:
        suffix = " ".join(dict.fromkeys(labels))
        return finalize_product_name(f"{brand} {model} {suffix}".strip(), brand, model)

    raw = clean_text(raw_cell)
    if model and raw:
        simplified = raw.replace(model, " ").strip()
        simplified = re.sub(r"\b[A-Z]\b", " ", simplified)
        simplified = clean_text(simplified)
        if simplified and simplified != model and len(normalize_token(simplified)) > 1:
            return finalize_product_name(f"{brand} {model} {simplified}".strip(), brand, model)

    description_words = clean_text(description).split()[:6]
    description_label = " ".join(description_words)
    if model and description_label and len(normalize_token(description_label)) > 1:
        return finalize_product_name(
            f"{brand} {model} {description_label}".strip(),
            brand,
            model,
        )
    if model:
        return finalize_product_name(f"{brand} {model}".strip(), brand, model)
    if raw:
        return finalize_product_name(f"{brand} {raw}".strip(), brand, model)
    return finalize_product_name(brand, brand, model)


def parse_quality_search(html: str) -> list[dict[str, str]]:
    items: list[dict[str, str]] = []
    for block in CARD_RE.findall(html):
        href_match = HREF_RE.search(block)
        name_match = NAME_RE.search(block)
        image_match = IMAGE_RE.search(block)
        if not all([href_match, name_match, image_match]):
            continue
        items.append(
            {
                "href": urljoin(QUALITY_BASE_URL, href_match.group(1)),
                "name": clean_text(name_match.group(1)),
                "image": urljoin(QUALITY_BASE_URL, image_match.group(1)),
            }
        )
    return items


def quality_search(query: str) -> list[dict[str, str]]:
    key = query.strip().lower()
    if key in SEARCH_CACHE:
        return SEARCH_CACHE[key]

    response = requests.get(
        f"{QUALITY_BASE_URL}/shop",
        params={"search": query},
        headers=HEADERS,
        timeout=30,
    )
    response.raise_for_status()
    SEARCH_CACHE[key] = parse_quality_search(response.text)
    return SEARCH_CACHE[key]


def find_web_image(model: str | None, name: str, brand: str) -> str | None:
    if not model:
        return None

    model_key = normalize_token(model)
    queries = [model, f"{brand} {model}", name]

    for query in queries:
        try:
            results = quality_search(query)
        except requests.RequestException:
            continue

        for item in results:
            name_key = normalize_token(item["name"])
            href_key = normalize_token(item["href"])
            if model_key in name_key or model_key in href_key:
                return item["image"]

        if len(results) == 1:
            return results[0]["image"]

    return None


def download_image(url: str, output_path: Path) -> bool:
    try:
        response = requests.get(url, headers=HEADERS, timeout=30)
        response.raise_for_status()
    except requests.RequestException:
        return False

    try:
        image = Image.open(BytesIO(response.content))
        output_path.parent.mkdir(parents=True, exist_ok=True)
        image.save(output_path, format="PNG")
        return True
    except Exception:
        return False


def save_pdf_crop(page: pdfplumber.page.Page, bbox: tuple[float, float, float, float], output_path: Path) -> None:
    crop = page.crop(bbox)
    image = crop.to_image(resolution=170)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    image.save(output_path, format="PNG")


def determine_category(config: AssetFileConfig, text: str, name: str, model: str | None) -> str:
    label_lower = config.label.lower()
    detail_lower = f"{text} {name} {model or ''}".lower()

    if "video intercom" in label_lower:
        if any(
            token in detail_lower
            for token in [
                "fingerprint",
                "face recognition",
                "smart lock",
                "magnetic lock",
                "electric lock",
                "access control",
                "exit & emergency",
                "access terminal",
                "attendance terminal",
            ]
        ):
            return "biometrics-access"
        return "video-intercom"

    if "interactive board" in label_lower:
        return "interactive-boards"

    if "monitor price list" in label_lower:
        return "monitors-displays"

    if "switch" in label_lower:
        if any(
            token in detail_lower
            for token in ["adapter", "ampere", "patch cord", "power supply", "sfp module"]
        ):
            return "accessories-cables"
        return "poe-gigabit-switches"

    if "hdd and cable" in label_lower:
        if any(token in detail_lower for token in ["hdd", "ssd", "hard drive", "surveillance drive"]):
            return "dvr-nvr-systems"
        return "accessories-cables"

    if "hilook" in label_lower:
        if "cable" in detail_lower:
            return "accessories-cables"
        if "switch" in detail_lower or "poe" in detail_lower:
            return "poe-gigabit-switches"
        if "nvr" in detail_lower or "dvr" in detail_lower:
            return "dvr-nvr-systems"
        return "cctv-cameras"

    if "camera price list" in label_lower:
        if (
            "nvr" in detail_lower
            or "dvr" in detail_lower
            or ("channel" in detail_lower and "camera" not in detail_lower)
            or (
                model
                and re.search(r"ds-7\d{3,}.*(?:ni|nxi|hghi|hqhi)", model.lower()) is not None
            )
        ):
            return "dvr-nvr-systems"
        return "cctv-cameras"

    return "accessories-cables"


def iter_rows(config: AssetFileConfig):
    path = ASSETS_DIR / config.filename
    with pdfplumber.open(path) as pdf:
        for page_index, page in enumerate(pdf.pages):
            for table in page.find_tables():
                rows = table.extract()
                for row_index in range(1, len(rows)):
                    row = rows[row_index]
                    cells = [clean_text(cell or "") for cell in row]
                    if len(cells) < 5:
                        continue
                    mrp = parse_price(cells[4])
                    if mrp is None:
                        continue
                    yield {
                        "page": page,
                        "page_index": page_index,
                        "image_bbox": table.rows[row_index].cells[0],
                        "model_cell": cells[1],
                        "description": cells[2],
                        "mrp": mrp,
                        "source_label": config.label,
                        "brand": config.brand,
                    }


def build_output() -> dict[str, object]:
    IMAGE_DIR.mkdir(parents=True, exist_ok=True)

    products: list[dict[str, object]] = []
    seen_keys: set[str] = set()
    used_categories: set[str] = set()

    for config in FILE_CONFIGS:
        for row in iter_rows(config):
            model = extract_model(row["model_cell"], row["description"])
            name = build_product_name(row["brand"], model, row["model_cell"], row["description"])
            category_key = determine_category(config, row["description"], name, model)
            category_meta = CATEGORY_DEFS[category_key]

            dedupe_key = normalize_token(model or name)
            if dedupe_key in seen_keys:
                continue

            product_id = slugify(model or name)
            local_image_path = IMAGE_DIR / f"{product_id}.png"
            web_image = find_web_image(model, name, row["brand"])

            if web_image:
                downloaded = download_image(web_image, local_image_path)
                if not downloaded and not local_image_path.exists():
                    save_pdf_crop(row["page"], row["image_bbox"], local_image_path)
            elif not local_image_path.exists():
                save_pdf_crop(row["page"], row["image_bbox"], local_image_path)

            source_url = (
                f"{QUALITY_BASE_URL}/shop?search={quote(model)}"
                if model
                else f"{QUALITY_BASE_URL}/shop?search={quote(name)}"
            )

            seen_keys.add(dedupe_key)
            used_categories.add(category_key)
            products.append(
                {
                    "id": product_id,
                    "name": name,
                    "brand": row["brand"],
                    "model": model,
                    "categoryKey": category_key,
                    "categoryName": category_meta["name"],
                    "price": row["mrp"],
                    "originalPrice": None,
                    "currency": "NPR",
                    "priceType": "mrp",
                    "image": f"/product-assets-imported/{local_image_path.name}",
                    "sourceUrl": source_url,
                    "sourceCategory": row["source_label"],
                }
            )

    categories = [
        {
            "key": key,
            "name": CATEGORY_DEFS[key]["name"],
            "description": CATEGORY_DEFS[key]["description"],
            "inquiryLabel": CATEGORY_DEFS[key]["inquiryLabel"],
            "sourceSummary": CATEGORY_DEFS[key]["sourceSummary"],
        }
        for key in CATEGORY_ORDER
        if key in used_categories
    ]

    return {
        "sourceSite": "Super Star Electronics Product Assets",
        "syncedAt": date.today().isoformat(),
        "categories": categories,
        "products": products,
    }


def main() -> None:
    payload = build_output()
    OUTPUT_PATH.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    print(f"Wrote {len(payload['products'])} products to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()

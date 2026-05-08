from __future__ import annotations

import json
import re
from dataclasses import dataclass
from datetime import date
from html import unescape
from pathlib import Path
from typing import Iterable
from urllib.parse import urljoin

import requests


ROOT = Path(__file__).resolve().parent.parent
OUTPUT_PATH = ROOT / "src" / "data" / "quality-products.json"
BASE_URL = "https://qualitycomputer.com.np"
HEADERS = {"User-Agent": "Mozilla/5.0"}


@dataclass(frozen=True)
class SourceConfig:
    label: str
    url: str
    limit: int


@dataclass(frozen=True)
class CategoryConfig:
    key: str
    name: str
    description: str
    inquiry_label: str
    source_summary: str
    sources: tuple[SourceConfig, ...]


CATEGORY_CONFIGS: tuple[CategoryConfig, ...] = (
    CategoryConfig(
        key="cctv-cameras",
        name="CCTV Cameras",
        description=(
            "Fixed dome and bullet surveillance cameras suited for homes, shops, "
            "offices, and perimeter coverage."
        ),
        inquiry_label="CCTV cameras",
        source_summary="Hikvision dome, Hikvision bullet, and Dahua source listings",
        sources=(
            SourceConfig(
                label="Hikvision Dome Camera",
                url=f"{BASE_URL}/shop/category/security-and-surveillance-hikvision-dome-camera-922",
                limit=6,
            ),
            SourceConfig(
                label="Hikvision Bullet Camera",
                url=f"{BASE_URL}/shop/category/security-and-surveillance-hikvision-bullet-camera-923",
                limit=6,
            ),
            SourceConfig(
                label="Dahua Camera",
                url=f"{BASE_URL}/shop/category/security-and-surveillance-dahua-926",
                limit=4,
            ),
        ),
    ),
    CategoryConfig(
        key="wireless-cameras",
        name="Wireless Cameras",
        description=(
            "Smart Wi-Fi cameras and pan-tilt cameras for app-based monitoring and "
            "easy residential setup."
        ),
        inquiry_label="wireless cameras",
        source_summary="EZVIZ smart home and wireless camera listings",
        sources=(
            SourceConfig(
                label="EZVIZ",
                url=f"{BASE_URL}/shop/category/security-and-surveillance-ezviz-867",
                limit=12,
            ),
        ),
    ),
    CategoryConfig(
        key="dvr-nvr-systems",
        name="DVR & NVR Systems",
        description=(
            "Recording systems for centralized playback, remote access, and "
            "multi-camera security installations."
        ),
        inquiry_label="DVR and NVR systems",
        source_summary="Dedicated DVR and NVR source listings",
        sources=(
            SourceConfig(
                label="DVR",
                url=f"{BASE_URL}/shop/category/security-and-surveillance-dvr-765",
                limit=6,
            ),
            SourceConfig(
                label="NVR",
                url=f"{BASE_URL}/shop/category/security-and-surveillance-nvr-806",
                limit=6,
            ),
        ),
    ),
    CategoryConfig(
        key="routers-networking",
        name="Routers & Wireless Networking",
        description=(
            "Routers and wireless networking products for internet distribution, "
            "remote CCTV access, and office connectivity."
        ),
        inquiry_label="routers and wireless networking",
        source_summary="Router and Ruijie Reyee networking listings",
        sources=(
            SourceConfig(
                label="Router",
                url=f"{BASE_URL}/shop/category/network-component-router-815",
                limit=8,
            ),
            SourceConfig(
                label="Ruijie Reyee",
                url=f"{BASE_URL}/shop/category/network-component-ruijie-reyee-853",
                limit=4,
            ),
        ),
    ),
    CategoryConfig(
        key="poe-gigabit-switches",
        name="POE & Gigabit Switches",
        description=(
            "Network switches for IP camera deployment, office networking, and "
            "expanding wired connectivity."
        ),
        inquiry_label="POE and gigabit switches",
        source_summary="Network switch source listings",
        sources=(
            SourceConfig(
                label="Switches",
                url=f"{BASE_URL}/shop/category/network-component-switches-822",
                limit=12,
            ),
        ),
    ),
    CategoryConfig(
        key="accessories-cables",
        name="Accessories, Power & Cables",
        description=(
            "Networking cables, adapters, and related accessories used in CCTV and "
            "network installations."
        ),
        inquiry_label="accessories, adapters, and cables",
        source_summary="Cable and adapter source listings",
        sources=(
            SourceConfig(
                label="Cable",
                url=f"{BASE_URL}/shop/category/network-component-cable-133",
                limit=8,
            ),
            SourceConfig(
                label="Adapters",
                url=f"{BASE_URL}/shop/category/network-component-adapter-124",
                limit=4,
            ),
        ),
    ),
    CategoryConfig(
        key="biometrics-access",
        name="Biometrics & Access Control",
        description=(
            "Biometric attendance and access devices for office entry management and "
            "staff tracking."
        ),
        inquiry_label="biometric and access control devices",
        source_summary="Biometric and attendance device source listings",
        sources=(
            SourceConfig(
                label="Biometrics",
                url=f"{BASE_URL}/shop/category/security-and-surveillance-biometrics-754",
                limit=12,
            ),
        ),
    ),
)


CARD_RE = re.compile(
    r'<form action="/shop/cart/update".*?class="card oe_product_cart.*?</form>',
    re.S,
)
HREF_RE = re.compile(r'itemprop="url" href="([^"]+)"')
NAME_RE = re.compile(r'itemprop="name"[^>]*title="([^"]+)"')
IMAGE_RE = re.compile(r'<img src="([^"]+)"')
PRICE_RE = re.compile(r'<span itemprop="price" style="display:none;">([^<]+)</span>')
LIST_PRICE_RE = re.compile(
    r'<small[^>]*>\s*₨\s*<span class="oe_currency_value">([^<]+)</span>',
    re.S,
)
PAGE_LINK_RE = re.compile(r'href="([^"]*/page/\d+[^"]*)"')

BRAND_PATTERNS: tuple[tuple[str, str], ...] = (
    ("ruijie reyee", "Ruijie Reyee"),
    ("hikvision", "Hikvision"),
    ("ezviz", "EZVIZ"),
    ("dahua", "Dahua"),
    ("hilook", "HiLook"),
    ("zkteco", "ZKTeco"),
    ("tp-link", "TP-Link"),
    ("d-link", "D-Link"),
    ("tenda", "Tenda"),
    ("netis", "Netis"),
    ("totolink", "TOTOLINK"),
    ("mikrotik", "MikroTik"),
    ("toshiba", "Toshiba"),
    ("mercusys", "Mercusys"),
)


def fetch_html(url: str) -> str:
    response = requests.get(url, headers=HEADERS, timeout=30)
    response.raise_for_status()
    return response.text


def discover_page_urls(base_url: str, first_page_html: str) -> list[str]:
    urls = {base_url}
    for match in PAGE_LINK_RE.findall(first_page_html):
        candidate = urljoin(BASE_URL, unescape(match))
        if "/page/" in candidate:
            urls.add(candidate)
    return sorted(
        urls,
        key=lambda item: int(re.search(r"/page/(\d+)", item).group(1))
        if re.search(r"/page/(\d+)", item)
        else 1,
    )


def parse_cards(html: str) -> list[dict[str, object]]:
    items: list[dict[str, object]] = []

    for block in CARD_RE.findall(html):
      href_match = HREF_RE.search(block)
      name_match = NAME_RE.search(block)
      image_match = IMAGE_RE.search(block)
      price_match = PRICE_RE.search(block)

      if not all([href_match, name_match, image_match, price_match]):
          continue

      href = urljoin(BASE_URL, unescape(href_match.group(1).split("?")[0]))
      name = clean_text(name_match.group(1))
      image = urljoin(BASE_URL, unescape(image_match.group(1)))
      price = float(price_match.group(1))

      list_price_match = LIST_PRICE_RE.search(block)
      original_price = None
      if list_price_match:
          try:
              original_price = float(list_price_match.group(1).replace(",", ""))
          except ValueError:
              original_price = None

      items.append(
          {
              "href": href,
              "name": name,
              "image": image,
              "price": price,
              "original_price": original_price,
          }
      )

    return items


def clean_text(value: str) -> str:
    return " ".join(unescape(value).split())


def detect_brand(name: str) -> str:
    lowered = name.lower()
    for token, brand in BRAND_PATTERNS:
        if token in lowered:
            return brand
    return name.split()[0]


def extract_model(name: str) -> str | None:
    paren_match = re.search(r"\(([^)]+)\)", name)
    if paren_match:
        return clean_text(paren_match.group(1))

    candidates = re.findall(r"\b[A-Za-z0-9][A-Za-z0-9./-]*\d[A-Za-z0-9./-]*\b", name)
    candidates = [candidate for candidate in candidates if len(candidate) >= 4]

    if candidates:
        candidates.sort(key=len, reverse=True)
        return candidates[0]

    return None


def scrape_source(source: SourceConfig, excluded_hrefs: set[str] | None = None) -> list[dict[str, object]]:
    first_page_html = fetch_html(source.url)
    pages = [(source.url, first_page_html)]
    extra_urls = [url for url in discover_page_urls(source.url, first_page_html) if url != source.url]

    for page_url in extra_urls:
        pages.append((page_url, fetch_html(page_url)))

    products: list[dict[str, object]] = []
    seen: set[str] = set()
    excluded = excluded_hrefs or set()

    for _, html in pages:
        for item in parse_cards(html):
            href = item["href"]
            if not isinstance(href, str) or href in seen or href in excluded:
                continue
            seen.add(href)
            products.append(item)
            if len(products) >= source.limit:
                return products

    return products


def build_output() -> dict[str, object]:
    categories: list[dict[str, object]] = []
    products: list[dict[str, object]] = []

    for category in CATEGORY_CONFIGS:
        category_seen_hrefs: set[str] = set()

        categories.append(
            {
                "key": category.key,
                "name": category.name,
                "description": category.description,
                "inquiryLabel": category.inquiry_label,
                "sourceSummary": category.source_summary,
            }
        )

        for source in category.sources:
            for item in scrape_source(source, excluded_hrefs=category_seen_hrefs):
                href = item["href"]
                name = item["name"]
                if not isinstance(href, str) or not isinstance(name, str):
                    continue

                category_seen_hrefs.add(href)

                products.append(
                    {
                        "id": href.rstrip("/").split("/")[-1],
                        "name": name,
                        "brand": detect_brand(name),
                        "model": extract_model(name),
                        "categoryKey": category.key,
                        "categoryName": category.name,
                        "price": item["price"],
                        "originalPrice": item["original_price"],
                        "currency": "NPR",
                        "image": item["image"],
                        "sourceUrl": href,
                        "sourceCategory": source.label,
                    }
                )

    return {
        "sourceSite": BASE_URL,
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

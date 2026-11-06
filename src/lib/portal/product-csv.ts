export const productCsvHeaders = [
  "id",
  "legacy_id",
  "name",
  "brand",
  "model",
  "category_key",
  "category_name",
  "description",
  "specifications",
  "image_path",
  "image_alt",
  "source_url",
  "source_category",
  "current_price_npr",
  "reference_price_npr",
  "price_display_mode",
  "price_type",
  "availability",
  "publication_status",
  "unit",
  "warranty_months",
] as const;

export type ProductCsvHeader = (typeof productCsvHeaders)[number];
export type ProductImportRow = Record<ProductCsvHeader, string>;

export function parseCsvText(value: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < value.length; index += 1) {
    const character = value[index];
    const next = value[index + 1];
    if (character === '"' && quoted && next === '"') {
      cell += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && next === "\n") index += 1;
      row.push(cell);
      if (row.some((item) => item.trim())) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += character;
    }
  }

  row.push(cell);
  if (row.some((item) => item.trim())) rows.push(row);
  return rows;
}

export function toCsvValue(value: string | number | null) {
  const text = value === null ? "" : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

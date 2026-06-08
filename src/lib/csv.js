const removeAccents = (value) =>
  value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export const normalizeCsvHeader = (value) =>
  removeAccents(String(value || ""))
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const parseCsvLine = (line, delimiter) => {
  const cells = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && quoted && next === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === delimiter && !quoted) {
      cells.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  cells.push(current.trim());
  return cells;
};

const detectDelimiter = (headerLine) => {
  const commaCount = (headerLine.match(/,/g) || []).length;
  const semicolonCount = (headerLine.match(/;/g) || []).length;
  return semicolonCount > commaCount ? ";" : ",";
};

export const parseCsv = (content) => {
  const lines = String(content || "")
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((line) => line.trim());

  if (lines.length < 2) return [];

  const delimiter = detectDelimiter(lines[0]);
  const headers = parseCsvLine(lines[0], delimiter).map(normalizeCsvHeader);

  return lines.slice(1).map((line) => {
    const cells = parseCsvLine(line, delimiter);
    return headers.reduce((record, header, index) => {
      record[header] = cells[index] || "";
      return record;
    }, {});
  });
};

export const readCsvFile = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(parseCsv(reader.result));
    reader.onerror = () => reject(new Error("Nao foi possivel ler o CSV."));
    reader.readAsText(file, "utf-8");
  });

export const pickCsvValue = (row, aliases) => {
  for (const alias of aliases) {
    const value = row[normalizeCsvHeader(alias)];
    const normalizedValue = String(value ?? "").trim();
    if (normalizedValue && normalizedValue !== "-") {
      return normalizedValue;
    }
  }

  return "";
};

export const removeEmptyRecords = (records, requiredFields) =>
  records.filter((record) =>
    requiredFields.every((field) => String(record[field] || "").trim()),
  );

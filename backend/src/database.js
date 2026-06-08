import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { config } from "./config.js";

const emptyDatabase = {
  meta: {
    version: 1,
    created_at: null,
    updated_at: null,
  },
  loans: [],
  teachers: [],
  serviceCalls: [],
  inventoryItems: [],
  tasks: [],
  accessPasswords: [],
  students: [],
  notebooks: [],
};

let operationQueue = Promise.resolve();

const now = () => new Date().toISOString();

export const createId = () => crypto.randomUUID();

const cloneEmptyDatabase = () => JSON.parse(JSON.stringify(emptyDatabase));

const enqueueDatabaseOperation = (operation) => {
  const queued = operationQueue.then(operation, operation);
  operationQueue = queued.catch(() => {});
  return queued;
};

export const ensureDatabase = async () => {
  await fs.mkdir(path.dirname(config.dataFile), { recursive: true });

  try {
    await fs.access(config.dataFile);
  } catch {
    const database = cloneEmptyDatabase();
    database.meta.created_at = now();
    database.meta.updated_at = database.meta.created_at;
    await fs.writeFile(config.dataFile, JSON.stringify(database, null, 2));
  }
};

const readDatabaseUnlocked = async () => {
  await ensureDatabase();
  const content = (await fs.readFile(config.dataFile, "utf8")).replace(/^\uFEFF/, "");
  return {
    ...cloneEmptyDatabase(),
    ...JSON.parse(content),
  };
};

const writeDatabaseUnlocked = async (database) => {
  database.meta = {
    ...database.meta,
    updated_at: now(),
  };

  // Serializa escritas para evitar perda de dados em requisições simultâneas.
  const tempFile = `${config.dataFile}.${process.pid}.${Date.now()}.tmp`;
  const content = JSON.stringify(database, null, 2);

  try {
    await fs.writeFile(tempFile, content);
    await fs.rename(tempFile, config.dataFile);
  } catch (error) {
    await fs.unlink(tempFile).catch(() => {});
    throw error;
  }

};

export const readDatabase = async () =>
  enqueueDatabaseOperation(() => readDatabaseUnlocked());

export const writeDatabase = async (database) =>
  enqueueDatabaseOperation(() => writeDatabaseUnlocked(database));

export const mutateDatabase = async (mutator) =>
  enqueueDatabaseOperation(async () => {
    const database = await readDatabaseUnlocked();
    const result = await mutator(database);
    await writeDatabaseUnlocked(database);
    return result;
  });

export const accessDatabase = async (handler) =>
  enqueueDatabaseOperation(async () => {
    const database = await readDatabaseUnlocked();
    const { changed = false, result } = await handler(database);

    if (changed) {
      await writeDatabaseUnlocked(database);
    }

    return result;
  });

export const collections = {
  loans: "loans",
  teachers: "teachers",
  "service-calls": "serviceCalls",
  inventory: "inventoryItems",
  tasks: "tasks",
  passwords: "accessPasswords",
  students: "students",
  notebooks: "notebooks",
};

export const sortRecords = (records, sortBy = "", fallback = "created_date") => {
  const descending = sortBy.startsWith("-");
  const field = (descending ? sortBy.slice(1) : sortBy) || fallback;

  return [...records].sort((a, b) => {
    const aValue = a[field] ?? "";
    const bValue = b[field] ?? "";

    if (field.includes("date") || field.includes("time") || field.endsWith("_at")) {
      return descending
        ? new Date(bValue || 0) - new Date(aValue || 0)
        : new Date(aValue || 0) - new Date(bValue || 0);
    }

    return descending
      ? String(bValue).localeCompare(String(aValue), "pt-BR")
      : String(aValue).localeCompare(String(bValue), "pt-BR");
  });
};

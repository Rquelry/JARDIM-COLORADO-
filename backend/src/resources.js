import {
  accessDatabase,
  collections,
  createId,
  mutateDatabase,
  readDatabase,
  sortRecords,
} from "./database.js";

const collectionDefaults = {
  loans: { status: "emprestado" },
  teachers: {},
  "service-calls": { status: "aberto" },
  inventory: {},
  tasks: { status: "pendente" },
  passwords: {},
  students: {},
  notebooks: { status: "disponivel", problems: [], presence_checklists: [] },
};

const getCollectionName = (resource) => {
  const collection = collections[resource];

  if (!collection) {
    const error = new Error("Recurso inválido.");
    error.statusCode = 404;
    throw error;
  }

  return collection;
};

const matchesFilters = (record, filters) =>
  Object.entries(filters).every(([key, value]) => {
    if (value === undefined || value === null || value === "") return true;
    return String(record[key] ?? "") === String(value);
  });

const defaultNotebookProblems = [
  { label: "Nao liga", checked: false, marked_at: null },
  { label: "Tela quebrada ou manchada", checked: false, marked_at: null },
  { label: "Teclado com falha", checked: false, marked_at: null },
  { label: "Touchpad com falha", checked: false, marked_at: null },
  { label: "Bateria com defeito", checked: false, marked_at: null },
  { label: "Carregador ausente ou defeituoso", checked: false, marked_at: null },
  { label: "Wi-Fi ou rede com falha", checked: false, marked_at: null },
  { label: "Sistema operacional com problema", checked: false, marked_at: null },
];

const normalizeProblems = (data = {}) => {
  const source = Array.isArray(data.problems)
    ? data.problems
    : Array.isArray(data.checklist)
      ? data.checklist
      : defaultNotebookProblems;

  return source.map((problem, index) => {
    const defaultProblem = defaultNotebookProblems[index] || {};
    const checked = Boolean(problem.checked);

    return {
      label: problem.label || defaultProblem.label || "Problema",
      checked,
      marked_at: checked ? problem.marked_at || new Date().toISOString() : null,
    };
  });
};

const normalizeNotebook = (data = {}) => ({
  ...data,
  name: data.name || "",
  model: data.model || data.brand || "",
  serial_number: data.serial_number || "",
  asset_tag: data.asset_tag || "",
  cart: data.cart || data.charging_cart || "",
  current_location: data.current_location || data.location || "",
  responsible: data.responsible || data.current_user || "",
  problems: normalizeProblems(data),
  presence_checklists: Array.isArray(data.presence_checklists)
    ? data.presence_checklists
    : [],
});

const notebookToInventory = (notebook) => ({
  notebook_id: notebook.id,
  name: notebook.name || notebook.model,
  category: "Notebook",
  brand: notebook.model,
  serial_number: notebook.serial_number,
  asset_tag: notebook.asset_tag,
  cart: notebook.cart || "",
  status: notebook.status || "disponivel",
  current_user: notebook.responsible || "",
  user_type: notebook.responsible ? "funcionario" : "",
  location: notebook.current_location || "",
  notes: notebook.notes || "",
});

const syncNotebookInventory = (database, notebook) => {
  const inventory = database.inventoryItems;
  const existingIndex = inventory.findIndex((item) => item.notebook_id === notebook.id);
  const timestamp = new Date().toISOString();
  const payload = notebookToInventory(notebook);

  if (existingIndex >= 0) {
    inventory[existingIndex] = {
      ...inventory[existingIndex],
      ...payload,
      updated_date: timestamp,
    };
    return;
  }

  inventory.push({
    ...payload,
    id: createId(),
    created_date: timestamp,
    updated_date: timestamp,
  });
};

const reconcileNotebookInventory = (database) => {
  const before = JSON.stringify({
    inventoryItems: database.inventoryItems,
    notebooks: database.notebooks,
  });
  const timestamp = new Date().toISOString();
  const existingNotebookItems = new Map(
    database.inventoryItems
      .filter((item) => item.category === "Notebook" && item.notebook_id)
      .map((item) => [item.notebook_id, item]),
  );

  // A tabela de notebooks e a fonte de verdade para notebooks no estoque.
  // Itens Notebook sem vinculo sao descartados para nao repovoar dados antigos.
  const nonNotebookItems = database.inventoryItems.filter(
    (item) => item.category !== "Notebook",
  );

  database.notebooks = database.notebooks.map((notebook) => normalizeNotebook(notebook));

  const notebookItems = database.notebooks.map((notebook) => {
    const existing = existingNotebookItems.get(notebook.id);
    const payload = notebookToInventory(notebook);

    if (!existing) {
      return {
        ...payload,
        id: createId(),
        created_date: timestamp,
        updated_date: timestamp,
      };
    }

    const payloadChanged = Object.entries(payload).some(
      ([key, value]) => existing[key] !== value,
    );

    return payloadChanged
      ? { ...existing, ...payload, updated_date: timestamp }
      : existing;
  });

  database.inventoryItems = [...nonNotebookItems, ...notebookItems];

  return before !== JSON.stringify({
    inventoryItems: database.inventoryItems,
    notebooks: database.notebooks,
  });
};

export const listResource = async (resource, searchParams) => {
  const collectionName = getCollectionName(resource);
  if (resource === "notebooks" || resource === "inventory") {
    return accessDatabase(async (database) => {
      const changed = reconcileNotebookInventory(database);
      const sortBy = searchParams.get("sort") || searchParams.get("sortBy") || "";
      const limit = Number(searchParams.get("limit") || 100);
      const filters = {};

      for (const [key, value] of searchParams.entries()) {
        if (!["sort", "sortBy", "limit"].includes(key)) {
          filters[key] = value;
        }
      }

      return {
        changed,
        result: sortRecords(database[collectionName], sortBy)
          .filter((record) => matchesFilters(record, filters))
          .slice(0, Number.isFinite(limit) ? limit : 100),
      };
    });
  }

  const database = await readDatabase();
  const sortBy = searchParams.get("sort") || searchParams.get("sortBy") || "";
  const limit = Number(searchParams.get("limit") || 100);
  const filters = {};

  for (const [key, value] of searchParams.entries()) {
    if (!["sort", "sortBy", "limit"].includes(key)) {
      filters[key] = value;
    }
  }

  return sortRecords(database[collectionName], sortBy)
    .filter((record) => matchesFilters(record, filters))
    .slice(0, Number.isFinite(limit) ? limit : 100);
};

export const createResource = async (resource, data) => {
  const collectionName = getCollectionName(resource);

  return mutateDatabase(async (database) => {
    const items = Array.isArray(data) ? data : [data];
    const records = items.map((item) => {
      const timestamp = new Date().toISOString();
      const normalizedItem = resource === "notebooks" ? normalizeNotebook(item) : item;

      return {
        ...collectionDefaults[resource],
        ...normalizedItem,
        id: createId(),
        created_date: timestamp,
        updated_date: timestamp,
      };
    });

    database[collectionName].push(...records);
    if (resource === "notebooks") {
      records.forEach((record) => syncNotebookInventory(database, record));
    }
    return Array.isArray(data) ? records : records[0];
  });
};

export const updateResource = async (resource, id, data) => {
  const collectionName = getCollectionName(resource);

  return mutateDatabase(async (database) => {
    const records = database[collectionName];
    const index = records.findIndex((record) => record.id === id);

    if (index === -1) {
      const error = new Error("Registro não encontrado.");
      error.statusCode = 404;
      throw error;
    }

    records[index] = resource === "notebooks" ? normalizeNotebook({
      ...records[index],
      ...data,
      id,
      updated_date: new Date().toISOString(),
    }) : {
      ...records[index],
      ...data,
      id,
      updated_date: new Date().toISOString(),
    };

    if (resource === "notebooks") {
      syncNotebookInventory(database, records[index]);
    }

    return records[index];
  });
};

export const deleteResource = async (resource, id) => {
  const collectionName = getCollectionName(resource);

  await mutateDatabase(async (database) => {
    const records = database[collectionName];
    const index = records.findIndex((record) => record.id === id);

    if (index === -1) {
      const error = new Error("Registro não encontrado.");
      error.statusCode = 404;
      throw error;
    }

    records.splice(index, 1);
    if (resource === "notebooks") {
      database.inventoryItems = database.inventoryItems.filter(
        (item) => item.notebook_id !== id,
      );
    }
  });
};

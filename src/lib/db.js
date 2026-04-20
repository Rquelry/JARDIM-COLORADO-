// ============================================================
// CAMADA DE DADOS LOCAL — com persistência via localStorage
// ============================================================

const uid = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
};

// Helpers de leitura/escrita no localStorage
const load = (key) => {
  try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; }
};
const save = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// ---- LOANS ----
export const LoansDB = {
  async list(sortBy = "-checkout_time", limit = 100) {
    const loans = load("loans");
    return loans.sort((a, b) => new Date(b.checkout_time) - new Date(a.checkout_time)).slice(0, limit);
  },

  async filter(query = {}, sortBy = "-checkout_time", limit = 100) {
    const loans = load("loans");
    return loans
      .filter((item) => {
        return Object.entries(query).every(([k, v]) => {
          if (v === undefined || v === null || v === "") return true;
          return item[k] === v;
        });
      })
      .sort((a, b) => {
        const timeA = new Date(a.checkout_time || 0).getTime();
        const timeB = new Date(b.checkout_time || 0).getTime();
        return sortBy.startsWith("-") ? timeB - timeA : timeA - timeB;
      })
      .slice(0, limit);
  },

  async create(data) {
    const loans = load("loans");
    const record = { ...data, id: uid(), created_date: new Date().toISOString() };
    loans.push(record);
    save("loans", loans);
    return record;
  },

  async update(id, data) {
    const loans = load("loans").map((l) => (l.id === id ? { ...l, ...data } : l));
    save("loans", loans);
    return loans.find((l) => l.id === id);
  },

  async delete(id) {
    save("loans", load("loans").filter((l) => l.id !== id));
  },
};

// ---- TEACHERS ----
export const TeachersDB = {
  async list(sortBy = "name", limit = 100) {
    const teachers = load("teachers");
    return teachers
      .sort((a, b) => (a.name || "").localeCompare(b.name || ""))
      .slice(0, limit);
  },

  async create(data) {
    const teachers = load("teachers");
    const record = { ...data, id: uid(), created_date: new Date().toISOString() };
    teachers.push(record);
    save("teachers", teachers);
    return record;
  },

  async delete(id) {
    save("teachers", load("teachers").filter((t) => t.id !== id));
  },
};

// ---- SERVICE CALLS ----
export const ServiceCallsDB = {
  async list(sortBy = "-created_date", limit = 100) {
    return load("serviceCalls")
      .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
      .slice(0, limit);
  },

  async create(data) {
    const serviceCalls = load("serviceCalls");
    const record = { ...data, id: uid(), created_date: new Date().toISOString() };
    serviceCalls.push(record);
    save("serviceCalls", serviceCalls);
    return record;
  },

  async update(id, data) {
    const serviceCalls = load("serviceCalls").map((s) => (s.id === id ? { ...s, ...data } : s));
    save("serviceCalls", serviceCalls);
    return serviceCalls.find((s) => s.id === id);
  },

  async delete(id) {
    save("serviceCalls", load("serviceCalls").filter((s) => s.id !== id));
  },
};

// ---- INVENTORY ----
export const InventoryDB = {
  async list(sortBy = "name", limit = 200) {
    const items = load("inventoryItems");
    return items
      .sort((a, b) => (a.name || "").localeCompare(b.name || ""))
      .slice(0, limit);
  },

  async create(data) {
    const items = load("inventoryItems");
    const record = { ...data, id: uid(), created_date: new Date().toISOString() };
    items.push(record);
    save("inventoryItems", items);
    return record;
  },

  async update(id, data) {
    const items = load("inventoryItems").map((i) => (i.id === id ? { ...i, ...data } : i));
    save("inventoryItems", items);
    return items.find((i) => i.id === id);
  },

  async delete(id) {
    save("inventoryItems", load("inventoryItems").filter((i) => i.id !== id));
  },
};

// ---- TASKS ----
export const TasksDB = {
  async list(sortBy = "due_date", limit = 200) {
    return load("tasks")
      .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
      .slice(0, limit);
  },

  async create(data) {
    const tasks = load("tasks");
    const record = { ...data, id: uid(), created_date: new Date().toISOString() };
    tasks.push(record);
    save("tasks", tasks);
    return record;
  },

  async update(id, data) {
    const tasks = load("tasks").map((t) => (t.id === id ? { ...t, ...data } : t));
    save("tasks", tasks);
    return tasks.find((t) => t.id === id);
  },

  async delete(id) {
    save("tasks", load("tasks").filter((t) => t.id !== id));
  },
};

// ---- PASSWORDS ----
export const PasswordsDB = {
  async list(sortBy = "system_name", limit = 200) {
    const passwords = load("accessPasswords");
    return passwords
      .sort((a, b) => (a.system_name || "").localeCompare(b.system_name || ""))
      .slice(0, limit);
  },

  async create(data) {
    const passwords = load("accessPasswords");
    const record = { ...data, id: uid(), created_date: new Date().toISOString() };
    passwords.push(record);
    save("accessPasswords", passwords);
    return record;
  },

  async update(id, data) {
    const passwords = load("accessPasswords").map((p) => (p.id === id ? { ...p, ...data } : p));
    save("accessPasswords", passwords);
    return passwords.find((p) => p.id === id);
  },

  async delete(id) {
    save("accessPasswords", load("accessPasswords").filter((p) => p.id !== id));
  },
};
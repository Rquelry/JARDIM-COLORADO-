import { getAuthToken } from "./auth";

const API_RESOURCES = {
  loans: "/api/loans",
  teachers: "/api/teachers",
  serviceCalls: "/api/service-calls",
  inventoryItems: "/api/inventory",
  tasks: "/api/tasks",
  accessPasswords: "/api/passwords",
  students: "/api/students",
  notebooks: "/api/notebooks",
};

const apiRequest = async (path, options = {}) => {
  const token = getAuthToken();

  if (!token) {
    const error = new Error("Usuario nao autenticado.");
    error.code = "AUTH_REQUIRED";
    throw error;
  }

  const response = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  if (response.status === 401) {
    localStorage.removeItem("jardim_colorado_auth_token");
    const error = new Error("Sessao expirada.");
    error.code = "AUTH_REQUIRED";
    window.location.href = "/login";
    throw error;
  }

  if (response.status === 204) return null;

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error || "Erro na comunicacao com a API.");
  }

  return payload;
};

const buildQuery = (params = {}) => {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, value);
    }
  });

  const query = search.toString();
  return query ? `?${query}` : "";
};

const createStore = (apiPath, defaultSort) => ({
  list(sortBy = defaultSort, limit = 100) {
    return apiRequest(`${apiPath}${buildQuery({ sort: sortBy, limit })}`);
  },

  filter(query = {}, sortBy = defaultSort, limit = 100) {
    return apiRequest(`${apiPath}${buildQuery({ ...query, sort: sortBy, limit })}`);
  },

  create(data) {
    return apiRequest(apiPath, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  createMany(records) {
    return apiRequest(apiPath, {
      method: "POST",
      body: JSON.stringify(records),
    });
  },

  update(id, data) {
    return apiRequest(`${apiPath}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  delete(id) {
    return apiRequest(`${apiPath}/${id}`, { method: "DELETE" });
  },
});

export const LoansDB = createStore(API_RESOURCES.loans, "-checkout_time");
export const TeachersDB = createStore(API_RESOURCES.teachers, "name");
export const ServiceCallsDB = createStore(
  API_RESOURCES.serviceCalls,
  "-created_date",
);
export const InventoryDB = createStore(API_RESOURCES.inventoryItems, "name");
export const TasksDB = createStore(API_RESOURCES.tasks, "due_date");
export const PasswordsDB = createStore(
  API_RESOURCES.accessPasswords,
  "system_name",
);
export const StudentsDB = createStore(API_RESOURCES.students, "name");
export const NotebooksDB = createStore(API_RESOURCES.notebooks, "model");

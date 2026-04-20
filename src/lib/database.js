import initSqlJs from "sql.js";

/**
 * Módulo de banco de dados SQLite local
 * Armazena dados em IndexedDB para persistência
 */

let db = null;
let SQL = null;
const DB_STORE_NAME = "jardin-colorado-db";

/**
 * Inicializar banco de dados
 */
export const initDatabase = async () => {
  if (db) return db;

  try {
    SQL = await initSqlJs();

    // Tentar carregar dados salvos
    const savedData = await loadDatabaseFromStorage();
    if (savedData) {
      db = new SQL.Database(savedData);
    } else {
      db = new SQL.Database();
      await createTables();
    }

    return db;
  } catch (error) {
    console.error("Erro ao inicializar banco de dados:", error);
    throw error;
  }
};

/**
 * Criar tabelas do banco de dados
 */
export const createTables = async () => {
  if (!db) throw new Error("Database não foi inicializado");

  const tables = [
    // Tabela de Empréstimos
    `CREATE TABLE IF NOT EXISTS loans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER,
      item_description TEXT NOT NULL,
      loan_date TEXT NOT NULL,
      return_date TEXT,
      status TEXT DEFAULT 'active',
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`,

    // Tabela de Itens de Inventário
    `CREATE TABLE IF NOT EXISTS inventory_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      category TEXT,
      quantity INTEGER DEFAULT 0,
      min_quantity INTEGER DEFAULT 0,
      unit_price REAL,
      location TEXT,
      status TEXT DEFAULT 'active',
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`,

    // Tabela de Chamados de Serviço
    `CREATE TABLE IF NOT EXISTS service_calls (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT,
      priority TEXT DEFAULT 'normal',
      status TEXT DEFAULT 'open',
      assigned_to TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      completed_at TEXT
    )`,

    // Tabela de Tarefas
    `CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      assigned_to TEXT,
      due_date TEXT,
      priority TEXT DEFAULT 'normal',
      status TEXT DEFAULT 'pending',
      category TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      completed_at TEXT
    )`,

    // Tabela de Professores
    `CREATE TABLE IF NOT EXISTS teachers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE,
      phone TEXT,
      department TEXT,
      status TEXT DEFAULT 'active',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`,

    // Tabela de Alunos
    `CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      registration TEXT UNIQUE NOT NULL,
      email TEXT,
      phone TEXT,
      grade TEXT,
      status TEXT DEFAULT 'active',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`,
  ];

  tables.forEach((sql) => {
    db.run(sql);
  });

  await saveDatabaseToStorage();
};

/**
 * Salvar banco de dados no IndexedDB
 */
export const saveDatabaseToStorage = async () => {
  if (!db) throw new Error("Database não foi inicializado");

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_STORE_NAME, 1);

    request.onerror = () => {
      reject(new Error("Erro ao abrir IndexedDB"));
    };

    request.onupgradeneeded = (event) => {
      const idb = event.target.result;
      if (!idb.objectStoreNames.contains("db")) {
        idb.createObjectStore("db");
      }
    };

    request.onsuccess = () => {
      const idb = request.result;
      const transaction = idb.transaction(["db"], "readwrite");
      const store = transaction.objectStore("db");
      const data = db.export();
      const blob = new Blob([data], { type: "application/octet-stream" });

      store.put(blob, "database");

      transaction.oncomplete = () => {
        resolve();
      };

      transaction.onerror = () => {
        reject(new Error("Erro ao salvar banco de dados"));
      };
    };
  });
};

/**
 * Carregar banco de dados do IndexedDB
 */
export const loadDatabaseFromStorage = async () => {
  return new Promise((resolve) => {
    const request = indexedDB.open(DB_STORE_NAME, 1);

    request.onerror = () => {
      resolve(null);
    };

    request.onupgradeneeded = (event) => {
      const idb = event.target.result;
      if (!idb.objectStoreNames.contains("db")) {
        idb.createObjectStore("db");
      }
    };

    request.onsuccess = () => {
      const idb = request.result;
      const transaction = idb.transaction(["db"], "readonly");
      const store = transaction.objectStore("db");
      const getRequest = store.get("database");

      getRequest.onsuccess = () => {
        const blob = getRequest.result;
        if (blob) {
          blob.arrayBuffer().then((buffer) => {
            resolve(new Uint8Array(buffer));
          });
        } else {
          resolve(null);
        }
      };

      getRequest.onerror = () => {
        resolve(null);
      };
    };
  });
};

/**
 * Executar query e retornar resultados
 */
const query = (sql, params = []) => {
  if (!db) throw new Error("Database não foi inicializado");
  try {
    const statement = db.prepare(sql);
    statement.bind(params);
    const result = [];
    while (statement.step()) {
      result.push(statement.getAsObject());
    }
    statement.free();
    return result;
  } catch (error) {
    console.error("Erro ao executar query:", error);
    throw error;
  }
};

/**
 * Executar comando (INSERT, UPDATE, DELETE)
 */
const execute = async (sql, params = []) => {
  if (!db) throw new Error("Database não foi inicializado");
  try {
    db.run(sql, params);
    await saveDatabaseToStorage();
  } catch (error) {
    console.error("Erro ao executar comando:", error);
    throw error;
  }
};

// ============= EMPRÉSTIMOS =============
export const Loans = {
  create: async (data) => {
    const sql = `INSERT INTO loans (student_id, item_description, loan_date, status, notes) 
                 VALUES (?, ?, ?, ?, ?)`;
    await execute(sql, [
      data.student_id,
      data.item_description,
      data.loan_date,
      "active",
      data.notes || "",
    ]);
  },

  getAll: () => {
    return query("SELECT * FROM loans ORDER BY created_at DESC");
  },

  getById: (id) => {
    return query("SELECT * FROM loans WHERE id = ?", [id]);
  },

  getActive: () => {
    return query(
      'SELECT * FROM loans WHERE status = "active" ORDER BY loan_date DESC',
    );
  },

  update: async (id, data) => {
    const sql = `UPDATE loans SET student_id = ?, item_description = ?, status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP 
                 WHERE id = ?`;
    await execute(sql, [
      data.student_id,
      data.item_description,
      data.status,
      data.notes || "",
      id,
    ]);
  },

  delete: async (id) => {
    await execute("DELETE FROM loans WHERE id = ?", [id]);
  },

  return: async (id, returnDate) => {
    const sql = `UPDATE loans SET status = 'returned', return_date = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    await execute(sql, [returnDate, id]);
  },
};

// ============= ESTOQUE =============
export const Inventory = {
  create: async (data) => {
    const sql = `INSERT INTO inventory_items (code, name, category, quantity, min_quantity, unit_price, location, notes) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    await execute(sql, [
      data.code,
      data.name,
      data.category || "",
      data.quantity || 0,
      data.min_quantity || 0,
      data.unit_price || 0,
      data.location || "",
      data.notes || "",
    ]);
  },

  getAll: () => {
    return query(
      'SELECT * FROM inventory_items WHERE status = "active" ORDER BY name',
    );
  },

  getById: (id) => {
    return query("SELECT * FROM inventory_items WHERE id = ?", [id]);
  },

  getByCode: (code) => {
    return query("SELECT * FROM inventory_items WHERE code = ?", [code]);
  },

  getLowStock: () => {
    return query(
      'SELECT * FROM inventory_items WHERE quantity <= min_quantity AND status = "active"',
    );
  },

  update: async (id, data) => {
    const sql = `UPDATE inventory_items SET code = ?, name = ?, category = ?, quantity = ?, min_quantity = ?, 
                 unit_price = ?, location = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    await execute(sql, [
      data.code,
      data.name,
      data.category || "",
      data.quantity || 0,
      data.min_quantity || 0,
      data.unit_price || 0,
      data.location || "",
      data.notes || "",
      id,
    ]);
  },

  delete: async (id) => {
    const sql = `UPDATE inventory_items SET status = 'inactive', updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    await execute(sql, [id]);
  },

  updateQuantity: async (id, quantity) => {
    const sql = `UPDATE inventory_items SET quantity = quantity + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    await execute(sql, [quantity, id]);
  },
};

// ============= CHAMADOS DE SERVIÇO =============
export const ServiceCalls = {
  create: async (data) => {
    const sql = `INSERT INTO service_calls (title, description, category, priority, status, assigned_to) 
                 VALUES (?, ?, ?, ?, ?, ?)`;
    await execute(sql, [
      data.title,
      data.description || "",
      data.category || "",
      data.priority || "normal",
      "open",
      data.assigned_to || "",
    ]);
  },

  getAll: () => {
    return query("SELECT * FROM service_calls ORDER BY created_at DESC");
  },

  getById: (id) => {
    return query("SELECT * FROM service_calls WHERE id = ?", [id]);
  },

  getOpen: () => {
    return query(
      'SELECT * FROM service_calls WHERE status = "open" ORDER BY priority DESC, created_at DESC',
    );
  },

  update: async (id, data) => {
    const sql = `UPDATE service_calls SET title = ?, description = ?, category = ?, priority = ?, status = ?, 
                 assigned_to = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    await execute(sql, [
      data.title,
      data.description || "",
      data.category || "",
      data.priority || "normal",
      data.status || "open",
      data.assigned_to || "",
      id,
    ]);
  },

  complete: async (id) => {
    const sql = `UPDATE service_calls SET status = 'completed', completed_at = CURRENT_TIMESTAMP, 
                 updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    await execute(sql, [id]);
  },

  delete: async (id) => {
    await execute("DELETE FROM service_calls WHERE id = ?", [id]);
  },
};

// ============= TAREFAS =============
export const Tasks = {
  create: async (data) => {
    const sql = `INSERT INTO tasks (title, description, assigned_to, due_date, priority, category) 
                 VALUES (?, ?, ?, ?, ?, ?)`;
    await execute(sql, [
      data.title,
      data.description || "",
      data.assigned_to || "",
      data.due_date || "",
      data.priority || "normal",
      data.category || "",
    ]);
  },

  getAll: () => {
    return query("SELECT * FROM tasks ORDER BY due_date ASC, priority DESC");
  },

  getById: (id) => {
    return query("SELECT * FROM tasks WHERE id = ?", [id]);
  },

  getPending: () => {
    return query(
      'SELECT * FROM tasks WHERE status = "pending" ORDER BY due_date ASC, priority DESC',
    );
  },

  getByStatus: (status) => {
    return query("SELECT * FROM tasks WHERE status = ? ORDER BY due_date ASC", [
      status,
    ]);
  },

  update: async (id, data) => {
    const sql = `UPDATE tasks SET title = ?, description = ?, assigned_to = ?, due_date = ?, priority = ?, 
                 category = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    await execute(sql, [
      data.title,
      data.description || "",
      data.assigned_to || "",
      data.due_date || "",
      data.priority || "normal",
      data.category || "",
      data.status || "pending",
      id,
    ]);
  },

  complete: async (id) => {
    const sql = `UPDATE tasks SET status = 'completed', completed_at = CURRENT_TIMESTAMP, 
                 updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    await execute(sql, [id]);
  },

  delete: async (id) => {
    await execute("DELETE FROM tasks WHERE id = ?", [id]);
  },
};

// ============= PROFESSORES =============
export const Teachers = {
  create: async (data) => {
    const sql = `INSERT INTO teachers (name, email, phone, department) VALUES (?, ?, ?, ?)`;
    await execute(sql, [
      data.name,
      data.email || "",
      data.phone || "",
      data.department || "",
    ]);
  },

  getAll: () => {
    return query(
      'SELECT * FROM teachers WHERE status = "active" ORDER BY name',
    );
  },

  getById: (id) => {
    return query("SELECT * FROM teachers WHERE id = ?", [id]);
  },

  update: async (id, data) => {
    const sql = `UPDATE teachers SET name = ?, email = ?, phone = ?, department = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    await execute(sql, [
      data.name,
      data.email || "",
      data.phone || "",
      data.department || "",
      id,
    ]);
  },

  delete: async (id) => {
    const sql = `UPDATE teachers SET status = 'inactive', updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    await execute(sql, [id]);
  },
};

// ============= ALUNOS =============
export const Students = {
  create: async (data) => {
    const sql = `INSERT INTO students (name, registration, email, phone, grade) VALUES (?, ?, ?, ?, ?)`;
    await execute(sql, [
      data.name,
      data.registration,
      data.email || "",
      data.phone || "",
      data.grade || "",
    ]);
  },

  getAll: () => {
    return query(
      'SELECT * FROM students WHERE status = "active" ORDER BY name',
    );
  },

  getById: (id) => {
    return query("SELECT * FROM students WHERE id = ?", [id]);
  },

  getByRegistration: (registration) => {
    return query("SELECT * FROM students WHERE registration = ?", [
      registration,
    ]);
  },

  update: async (id, data) => {
    const sql = `UPDATE students SET name = ?, registration = ?, email = ?, phone = ?, grade = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    await execute(sql, [
      data.name,
      data.registration,
      data.email || "",
      data.phone || "",
      data.grade || "",
      id,
    ]);
  },

  delete: async (id) => {
    const sql = `UPDATE students SET status = 'inactive', updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    await execute(sql, [id]);
  },
};

export default {
  initDatabase,
  createTables,
  saveDatabaseToStorage,
  loadDatabaseFromStorage,
  Loans,
  Inventory,
  ServiceCalls,
  Tasks,
  Teachers,
  Students,
};

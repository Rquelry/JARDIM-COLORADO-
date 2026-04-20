/**
 * Exemplos de como usar o banco de dados local
 *
 * Importe o módulo database.js e use os métodos CRUD disponíveis
 */

import {
  initDatabase,
  Loans,
  Inventory,
  ServiceCalls,
  Tasks,
  Teachers,
  Students,
} from "./database.js";

// ============= INICIALIZAÇÃO =============
// Execute isso uma vez quando o app inicia (ex: em App.jsx ou main.jsx)
export const setupDatabase = async () => {
  try {
    await initDatabase();
    console.log("✅ Banco de dados inicializado com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao inicializar banco:", error);
  }
};

// ============= EXEMPLOS DE USO =============

// --- EMPRÉSTIMOS ---
export const exampleLoans = {
  // Criar novo empréstimo
  create: async () => {
    await Loans.create({
      student_id: 1,
      item_description: "Livro de Português",
      loan_date: new Date().toISOString().split("T")[0],
      notes: "Empréstimo de livro didático",
    });
  },

  // Listar todos empréstimos
  getAll: () => {
    const loans = Loans.getAll();
    console.log("Todos empréstimos:", loans);
    return loans;
  },

  // Listar apenas empréstimos ativos
  getActive: () => {
    const active = Loans.getActive();
    console.log("Empréstimos ativos:", active);
    return active;
  },

  // Devolver um empréstimo
  return: async (loanId) => {
    await Loans.return(loanId, new Date().toISOString().split("T")[0]);
  },

  // Atualizar empréstimo
  update: async (loanId) => {
    await Loans.update(loanId, {
      student_id: 1,
      item_description: "Livro atualizado",
      status: "active",
      notes: "Notas atualizadas",
    });
  },

  // Deletar empréstimo
  delete: async (loanId) => {
    await Loans.delete(loanId);
  },
};

// --- INVENTÁRIO ---
export const exampleInventory = {
  // Criar item
  create: async () => {
    await Inventory.create({
      code: "LIV001",
      name: "Livro de Matemática",
      category: "Livros",
      quantity: 50,
      min_quantity: 10,
      unit_price: 85.9,
      location: "Prateleira A1",
      notes: "Quantidade suficiente",
    });
  },

  // Listar todos itens
  getAll: () => {
    return Inventory.getAll();
  },

  // Itens com estoque baixo
  getLowStock: () => {
    return Inventory.getLowStock();
  },

  // Aumentar/diminuir quantidade
  updateQuantity: async (itemId, quantity) => {
    // quantity positivo = aumenta, negativo = diminui
    await Inventory.updateQuantity(itemId, quantity);
  },

  // Atualizar item
  update: async (itemId) => {
    await Inventory.update(itemId, {
      code: "LIV001",
      name: "Livro de Matemática",
      category: "Livros",
      quantity: 45,
      min_quantity: 10,
      unit_price: 85.9,
      location: "Prateleira A1",
    });
  },
};

// --- CHAMADOS DE SERVIÇO ---
export const exampleServiceCalls = {
  // Criar chamado
  create: async () => {
    await ServiceCalls.create({
      title: "Reparo no projetor",
      description: "Projetor da sala 101 não funciona",
      category: "Manutenção",
      priority: "high",
      assigned_to: "João Silva",
    });
  },

  // Listar todos
  getAll: () => {
    return ServiceCalls.getAll();
  },

  // Apenas abertos
  getOpen: () => {
    return ServiceCalls.getOpen();
  },

  // Marcar como completo
  complete: async (callId) => {
    await ServiceCalls.complete(callId);
  },

  // Atualizar
  update: async (callId) => {
    await ServiceCalls.update(callId, {
      title: "Reparo no projetor",
      description: "Projetor da sala 101 necessita manutenção",
      category: "Manutenção",
      priority: "medium",
      status: "in_progress",
      assigned_to: "Maria Santos",
    });
  },
};

// --- TAREFAS ---
export const exampleTasks = {
  // Criar tarefa
  create: async () => {
    await Tasks.create({
      title: "Preparar aula de Matemática",
      description: "Preparar slides e exercícios",
      assigned_to: "Prof. Carlos",
      due_date: "2026-04-25",
      priority: "high",
      category: "Pedagogia",
    });
  },

  // Listar todas
  getAll: () => {
    return Tasks.getAll();
  },

  // Apenas pendentes
  getPending: () => {
    return Tasks.getPending();
  },

  // Marcar como completa
  complete: async (taskId) => {
    await Tasks.complete(taskId);
  },

  // Atualizar
  update: async (taskId) => {
    await Tasks.update(taskId, {
      title: "Preparar aula de Matemática",
      description: "Slides, exercícios e prova",
      assigned_to: "Prof. Carlos",
      due_date: "2026-04-25",
      priority: "high",
      category: "Pedagogia",
      status: "completed",
    });
  },
};

// --- PROFESSORES ---
export const exampleTeachers = {
  // Criar professor
  create: async () => {
    await Teachers.create({
      name: "Prof. João Silva",
      email: "joao@escola.com",
      phone: "(11) 98765-4321",
      department: "Matemática",
    });
  },

  // Listar todos
  getAll: () => {
    return Teachers.getAll();
  },

  // Atualizar
  update: async (teacherId) => {
    await Teachers.update(teacherId, {
      name: "Prof. João Silva",
      email: "joao.silva@escola.com",
      phone: "(11) 98765-4321",
      department: "Ciências",
    });
  },
};

// --- ALUNOS ---
export const exampleStudents = {
  // Criar aluno
  create: async () => {
    await Students.create({
      name: "Ana Silva",
      registration: "ALU001",
      email: "ana.silva@escola.com",
      phone: "(11) 99876-5432",
      grade: "8A",
    });
  },

  // Listar todos
  getAll: () => {
    return Students.getAll();
  },

  // Buscar por matrícula
  getByRegistration: (registration) => {
    return Students.getByRegistration(registration);
  },

  // Atualizar
  update: async (studentId) => {
    await Students.update(studentId, {
      name: "Ana Silva",
      registration: "ALU001",
      email: "ana.silva.2026@escola.com",
      phone: "(11) 99876-5432",
      grade: "8B",
    });
  },
};

/**
 * COMO USAR EM UM COMPONENTE REACT:
 *
 * import { Tasks } from './lib/database.js';
 * import { useEffect, useState } from 'react';
 *
 * export function TasksPage() {
 *   const [tasks, setTasks] = useState([]);
 *
 *   useEffect(() => {
 *     // Carregar tarefas do banco ao montar
 *     const allTasks = Tasks.getAll();
 *     setTasks(allTasks);
 *   }, []);
 *
 *   const handleCreateTask = async () => {
 *     await Tasks.create({
 *       title: 'Nova tarefa',
 *       description: 'Descrição',
 *       assigned_to: 'Alguém',
 *       due_date: '2026-04-25',
 *       priority: 'normal'
 *     });
 *     // Recarregar lista
 *     setTasks(Tasks.getAll());
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={handleCreateTask}>Criar Tarefa</button>
 *       {tasks.map(task => (
 *         <div key={task.id}>
 *           <h3>{task.title}</h3>
 *           <p>{task.description}</p>
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 */

# 🗄️ Banco de Dados Local - SQLite

Este projeto agora possui um banco de dados local **SQLite** usando **sql.js** que roda completamente no navegador, sem necessidade de servidor backend.

## 📋 O que foi criado

- **`src/lib/database.js`** - Módulo principal do banco de dados
- **`src/lib/database-examples.js`** - Exemplos de como usar cada tabela
- Os dados são salvos automaticamente no **IndexedDB** do navegador

## 🗂️ Tabelas Disponíveis

### 1. **Loans** (Empréstimos)

```javascript
import { Loans } from './lib/database.js';

// Criar empréstimo
await Loans.create({
  student_id: 1,
  item_description: 'Livro de Português',
  loan_date: '2026-04-19',
  notes: 'Empréstimo de livro'
});

// Listar todos
Loans.getAll();

// Listar apenas ativos
Loans.getActive();

// Devolver empréstimo
await Loans.return(loanId, '2026-04-25');

// Atualizar
await Loans.update(loanId, { status: 'returned', ... });

// Deletar
await Loans.delete(loanId);
```

### 2. **Inventory** (Estoque)

```javascript
import { Inventory } from './lib/database.js';

// Criar item
await Inventory.create({
  code: 'LIV001',
  name: 'Livro de Matemática',
  category: 'Livros',
  quantity: 50,
  min_quantity: 10,
  unit_price: 85.90,
  location: 'Prateleira A1'
});

// Listar todos
Inventory.getAll();

// Itens com estoque baixo
Inventory.getLowStock();

// Aumentar quantidade (+5) ou diminuir (-3)
await Inventory.updateQuantity(itemId, 5);

// Atualizar
await Inventory.update(itemId, { quantity: 45, ... });
```

### 3. **ServiceCalls** (Chamados de Serviço)

```javascript
import { ServiceCalls } from './lib/database.js';

// Criar chamado
await ServiceCalls.create({
  title: 'Reparo no projetor',
  description: 'Projetor da sala 101 não funciona',
  category: 'Manutenção',
  priority: 'high',
  assigned_to: 'João Silva'
});

// Listar abertos
ServiceCalls.getOpen();

// Marcar como completo
await ServiceCalls.complete(callId);

// Atualizar
await ServiceCalls.update(callId, { status: 'in_progress', ... });
```

### 4. **Tasks** (Tarefas)

```javascript
import { Tasks } from "./lib/database.js";

// Criar tarefa
await Tasks.create({
  title: "Preparar aula",
  description: "Slides e exercícios",
  assigned_to: "Prof. Carlos",
  due_date: "2026-04-25",
  priority: "high",
  category: "Pedagogia",
});

// Listar pendentes
Tasks.getPending();

// Marcar como completa
await Tasks.complete(taskId);

// Por status
Tasks.getByStatus("pending");
```

### 5. **Teachers** (Professores)

```javascript
import { Teachers } from "./lib/database.js";

// Criar professor
await Teachers.create({
  name: "Prof. João Silva",
  email: "joao@escola.com",
  phone: "(11) 98765-4321",
  department: "Matemática",
});

// Listar todos
Teachers.getAll();

// Buscar por ID
Teachers.getById(teacherId);
```

### 6. **Students** (Alunos)

```javascript
import { Students } from "./lib/database.js";

// Criar aluno
await Students.create({
  name: "Ana Silva",
  registration: "ALU001",
  email: "ana@escola.com",
  phone: "(11) 99876-5432",
  grade: "8A",
});

// Listar todos
Students.getAll();

// Buscar por matrícula
Students.getByRegistration("ALU001");
```

## 💻 Exemplo Completo em um Componente

```jsx
import { useState, useEffect } from "react";
import { Tasks } from "../lib/database.js";

export function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Carregar tarefas ao montar
  useEffect(() => {
    try {
      const allTasks = Tasks.getAll();
      setTasks(allTasks);
    } catch (error) {
      console.error("Erro ao carregar tarefas:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Criar nova tarefa
  const handleCreateTask = async () => {
    try {
      await Tasks.create({
        title: "Nova tarefa",
        description: "Descrição da tarefa",
        assigned_to: "Alguém",
        due_date: "2026-04-25",
        priority: "normal",
      });

      // Recarregar lista
      setTasks(Tasks.getAll());
    } catch (error) {
      console.error("Erro ao criar tarefa:", error);
    }
  };

  // Marcar como completa
  const handleCompleteTask = async (taskId) => {
    try {
      await Tasks.complete(taskId);
      setTasks(Tasks.getAll());
    } catch (error) {
      console.error("Erro ao completar tarefa:", error);
    }
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div>
      <button onClick={handleCreateTask}>+ Nova Tarefa</button>

      {tasks.map((task) => (
        <div key={task.id}>
          <h3>{task.title}</h3>
          <p>{task.description}</p>
          <p>Status: {task.status}</p>
          <button onClick={() => handleCompleteTask(task.id)}>Completar</button>
        </div>
      ))}
    </div>
  );
}
```

## 🔄 Operações Disponíveis

Cada tabela tem estes métodos:

| Método          | Descrição                         |
| --------------- | --------------------------------- |
| `create()`      | Criar novo registro               |
| `getAll()`      | Listar todos os registros         |
| `getById()`     | Buscar por ID                     |
| `update()`      | Atualizar registro                |
| `delete()`      | Deletar registro                  |
| **Específicos** | Cada tabela tem métodos especiais |

## 💾 Armazenamento

- Os dados são salvos automaticamente no **IndexedDB** do navegador
- Persiste entre recarregamentos da página
- Cada navegador/aba tem seu próprio banco isolado
- Para compartilhar entre abas, você precisaria sincronizar via API

## 🚀 Próximos Passos

1. **Integrar com a API Colorado**: Você pode sincronizar dados do banco local com a API
2. **Offline First**: Guardar dados localmente e sincronizar quando voltar online
3. **Backup/Export**: Exportar dados para JSON ou CSV
4. **Validação**: Adicionar validações de dados antes de salvar

## ⚠️ Limitações

- **IndexedDB tem limite**: Geralmente 50-100MB por origem
- **Dados isolados por origem**: Cada domínio tem seu próprio banco
- **Sem acesso entre abas**: Cada aba tem seu próprio SQL.js em memória
  - Solução: usar SharedWorker ou Service Worker

## 🔧 Troubleshooting

Se o banco não funcionar:

1. Abra o console do navegador (F12)
2. Procure por mensagens de erro
3. Verifique se IndexedDB está habilitado
4. Limpe o cache/cookies

---

**Arquivo de exemplos**: Veja `src/lib/database-examples.js` para mais exemplos práticos!

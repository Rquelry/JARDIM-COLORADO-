# Backend Jardim Colorado

API local/LAN para atender o frontend React do projeto Jardim Colorado.

## Execucao

```bash
npm run backend
```

Por padrao a API escuta em todas as interfaces de rede:

```txt
http://0.0.0.0:3001
```

Para acessar de outro computador ou celular na mesma rede, use o IP da maquina
que esta rodando o projeto:

```txt
Frontend: http://SEU_IP:5173
Backend:  http://SEU_IP:3001
```

No Windows, descubra o IP com:

```powershell
ipconfig
```

Procure o `Endereco IPv4` da placa Wi-Fi ou Ethernet.

Se quiser rodar somente na propria maquina, use:

```bash
npm run backend:local
npm run dev:local
```

## Autenticacao

Usuario administrador inicial:

```txt
usuario: admin
senha: 12345678
```

Login:

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "12345678"
}
```

Use o `token` retornado no header:

```http
Authorization: Bearer <token>
```

## Recursos

Todos os recursos abaixo exigem autenticacao:

```txt
GET    /api/loans
POST   /api/loans
PATCH  /api/loans/:id
DELETE /api/loans/:id

GET    /api/teachers
POST   /api/teachers
PATCH  /api/teachers/:id
DELETE /api/teachers/:id

GET    /api/service-calls
POST   /api/service-calls
PATCH  /api/service-calls/:id
DELETE /api/service-calls/:id

GET    /api/inventory
POST   /api/inventory
PATCH  /api/inventory/:id
DELETE /api/inventory/:id

GET    /api/tasks
POST   /api/tasks
PATCH  /api/tasks/:id
DELETE /api/tasks/:id

GET    /api/passwords
POST   /api/passwords
PATCH  /api/passwords/:id
DELETE /api/passwords/:id

GET    /api/students
POST   /api/students
PATCH  /api/students/:id
DELETE /api/students/:id

GET    /api/notebooks
POST   /api/notebooks
PATCH  /api/notebooks/:id
DELETE /api/notebooks/:id
```

Listagens aceitam filtros por query string e ordenacao:

```http
GET /api/loans?status=emprestado&sort=-checkout_time&limit=100
```

O `POST` tambem aceita um array de registros para importacao em lote via CSV.

## Importacao CSV

O frontend aceita CSV com cabecalho. Os nomes das colunas podem estar em
portugues ou no nome tecnico do campo.

Alunos:

```csv
nome,codigo da carteirinha,turma,AlunoID
Maria Silva,12345,2 A,ALU-001
```

Equipamentos:

```csv
nome,categoria,marca,patrimonio,status,observacoes
Notebook Dell,Notebook,Dell,NB-001,disponivel,
```

Notebooks:

```csv
nome,modelo,serial number,patrimonio,carrinho,local atual,responsavel,status,observacoes
NOT.40,Dell Inspiron 15 5510_5518,SN123456,30087119,Carrinho 1,Secretaria,Pedro,disponivel,
```

Campos obrigatorios para notebooks:

- `modelo`: modelo real do equipamento, por exemplo `Dell Inspiron 15 5510_5518`.
- `serial number`: numero de serie unico do notebook.

Campos opcionais para notebooks:

- `nome`: nomenclatura interna, por exemplo `NOT.40`.
- `patrimonio`: numero de patrimonio/tombo.
- `carrinho`: gabinete de recarga onde o notebook fica agrupado.
- `local atual`: local onde o notebook deveria estar.
- `responsavel`: pessoa responsavel pelo equipamento.
- `status`: `disponivel`, `em_uso`, `manutencao`, `inativo` ou `nao_encontrado`.
- `observacoes`: notas gerais.

O diagnostico de problemas e os checklists de presenca sao registrados pela
tela de notebooks, pois guardam historico de datas por notebook.

Professores:

```csv
nome,disciplina,instituicao
Joao Santos,Matematica,SEDUC
```

Emprestimos:

```csv
nome,turma,tipo equipamento,codigo equipamento,status
Maria Silva,2 A,Notebook,NB-001,emprestado
```

Tarefas:

```csv
tarefa,responsavel,data limite,observacoes,status
Conferir notebooks,Pedro,2026-06-10,,pendente
```

Chamados:

```csv
titulo,categoria,descricao,equipamento,status
Teclado quebrado,Reparo,Tecla solta,NB-001,aberto
```

Senhas:

```csv
sistema,usuario,senha,url,observacoes
Google Admin,admin@example.com,123456,https://admin.google.com,
```

## Banco de Dados

O banco esta em `backend/data/database.json`.

Esta implementacao usa arquivo JSON para evitar dependencias externas e
facilitar manutencao inicial. A camada de persistencia fica isolada em
`backend/src/database.js`, entao e simples trocar por SQLite, PostgreSQL ou
outro banco depois sem alterar os controllers.

Colecoes:

- `loans`: emprestimos de equipamentos.
- `teachers`: professores cadastrados.
- `serviceCalls`: chamados de manutencao.
- `inventoryItems`: itens de estoque.
- `tasks`: tarefas internas.
- `accessPasswords`: senhas de acesso registradas pelo modulo de estoque.
- `students`: alunos importados para selecao em emprestimos.
- `notebooks`: controle dedicado de notebooks. Ao criar, editar ou excluir um
  notebook, o item correspondente em `inventoryItems` e sincronizado pelo campo
  `notebook_id`.

Campos principais de `notebooks`:

- `name`: nomenclatura interna opcional, como `NOT.40`.
- `model`: modelo real obrigatorio, como `Dell Latitude 3450`.
- `serial_number`: numero de serie obrigatorio.
- `asset_tag`: patrimonio/tombo.
- `cart`: carrinho/gabinete de recarga.
- `current_location`: local atual ou local esperado.
- `responsible`: responsavel atual.
- `status`: `disponivel`, `em_uso`, `manutencao`, `inativo` ou `nao_encontrado`.
- `problems`: diagnostico de problemas possiveis. Cada item guarda `label`,
  `checked` e `marked_at`.
- `presence_checklists`: historico de checagens de presenca na unidade, com
  `date`, `in_unit`, `checked_by` e `notes`.

## Variaveis de Ambiente

```txt
BACKEND_PORT=3001
BACKEND_HOST=0.0.0.0
BACKEND_DATA_FILE=backend/data/database.json
CORS_ORIGIN=*
ADMIN_USER=admin
ADMIN_PASSWORD=12345678
AUTH_TOKEN_TTL_MS=28800000
```

## Manutencao

- `backend/src/server.js`: bootstrap HTTP e CORS.
- `backend/src/router.js`: mapeamento das rotas.
- `backend/src/resources.js`: CRUD generico das entidades usadas pelo frontend.
- `backend/src/database.js`: leitura/escrita do banco e serializacao de gravacoes.
- `backend/src/auth.js`: login simples e sessoes Bearer em memoria.

As sessoes sao mantidas em memoria. Ao reiniciar o backend, o usuario precisa
fazer login novamente.

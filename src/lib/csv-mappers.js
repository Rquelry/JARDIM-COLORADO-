import { pickCsvValue, removeEmptyRecords } from "./csv";

const normalizeInventoryStatus = (value) => {
  const status = String(value || "").trim().toLowerCase();

  if (!status || status === "-") return "disponivel";
  if (["disponível", "disponivel", "ativo"].includes(status)) return "disponivel";
  if (["em uso", "em_uso", "uso"].includes(status)) return "em_uso";
  if (["manutenção", "manutencao"].includes(status)) return "manutencao";
  if (["inativo", "baixado"].includes(status)) return "inativo";
  if (["não encontrado", "nao encontrado", "nao_encontrado"].includes(status)) return "nao_encontrado";
  return status;
};

export const mapStudentsCsv = (rows) =>
  removeEmptyRecords(
    rows.map((row) => ({
      name: pickCsvValue(row, ["nome", "name", "aluno"]),
      card_code: pickCsvValue(row, [
        "codigo da carteirinha",
        "código da carteirinha",
        "codigo_carteirinha",
        "card_code",
      ]),
      grade: pickCsvValue(row, ["turma", "serie", "série", "grade"]),
      student_id: pickCsvValue(row, ["AlunoID", "aluno_id", "student_id", "id do aluno"]),
    })),
    ["name"],
  );

export const mapTeachersCsv = (rows) =>
  removeEmptyRecords(
    rows.map((row) => ({
      name: pickCsvValue(row, ["nome", "name", "professor"]),
      discipline: pickCsvValue(row, ["disciplina", "curso", "discipline"]),
      institution: pickCsvValue(row, ["instituicao", "instituição", "institution"]) || "SEDUC",
    })),
    ["name", "institution"],
  );

export const mapInventoryCsv = (rows) =>
  removeEmptyRecords(
    rows.map((row) => {
      const modelOrBrand = pickCsvValue(row, ["marca", "modelo", "model", "brand"]);
      const serialNumber = pickCsvValue(row, [
        "numero de serie",
        "número de série",
        "numero_serie",
        "serie",
        "n serie",
        "serial_number",
      ]);
      const assetTag = pickCsvValue(row, [
        "patrimonio",
        "patrimônio",
        "asset_tag",
        "tombo",
      ]);
      const category = pickCsvValue(row, ["categoria", "category", "tipo"]);

      return {
        name: pickCsvValue(row, [
          "nome",
          "nomeclatura",
          "nomenclatura",
          "equipamento",
          "descricao",
          "descrição",
          "name",
        ]) || modelOrBrand,
        category: category || (serialNumber || assetTag ? "Notebook" : ""),
        brand: modelOrBrand,
        serial_number: serialNumber,
        asset_tag: assetTag,
        cart: pickCsvValue(row, ["carrinho", "gabinete", "gabinete de recarga", "charging_cart", "cart"]),
        cable_length_m: pickCsvValue(row, ["comprimento", "comprimento_m", "cable_length_m"]),
        status: normalizeInventoryStatus(pickCsvValue(row, ["status"])),
        current_user: pickCsvValue(row, ["usuario atual", "current_user"]),
        user_type: pickCsvValue(row, ["tipo usuario", "user_type"]),
        notes: pickCsvValue(row, ["observacoes", "observações", "observacao", "observação", "notes"]),
      };
    }),
    ["name", "category"],
  );

export const mapNotebooksCsv = (rows) =>
  removeEmptyRecords(
    rows.map((row) => {
      const model = pickCsvValue(row, ["modelo", "marca", "model", "brand"]);

      return {
        name: pickCsvValue(row, [
          "nome",
          "nomeclatura",
          "nomenclatura",
          "identificacao",
          "identificação",
          "name",
        ]),
        model,
        serial_number: pickCsvValue(row, [
          "serial number",
          "numero de serie",
          "número de série",
          "numero_serie",
          "serie",
          "n serie",
          "serial_number",
        ]),
        asset_tag: pickCsvValue(row, ["patrimonio", "patrimônio", "asset_tag", "tombo"]),
        cart: pickCsvValue(row, ["carrinho", "gabinete", "gabinete de recarga", "charging_cart", "cart"]),
        current_location: pickCsvValue(row, ["local atual", "local", "localizacao", "localização", "current_location"]),
        responsible: pickCsvValue(row, ["responsavel", "responsável", "responsible"]),
        status: normalizeInventoryStatus(pickCsvValue(row, ["status"])),
        notes: pickCsvValue(row, ["observacoes", "observações", "observacao", "observação", "notes"]),
      };
    }),
    ["model", "serial_number"],
  );

export const mapPasswordsCsv = (rows) =>
  removeEmptyRecords(
    rows.map((row) => ({
      system_name: pickCsvValue(row, ["sistema", "aplicativo", "system_name"]),
      username: pickCsvValue(row, ["usuario", "usuário", "login", "username"]),
      password: pickCsvValue(row, ["senha", "password"]),
      url: pickCsvValue(row, ["url", "endereco", "endereço"]),
      notes: pickCsvValue(row, ["observacoes", "observações", "notes"]),
    })),
    ["system_name", "username", "password"],
  );

export const mapServiceCallsCsv = (rows) =>
  removeEmptyRecords(
    rows.map((row) => ({
      title: pickCsvValue(row, ["titulo", "título", "title"]),
      category: pickCsvValue(row, ["categoria", "category"]) || "Outro",
      description: pickCsvValue(row, ["descricao", "descrição", "description"]),
      equipment_id: pickCsvValue(row, ["equipamento", "equipment_id", "patrimonio"]),
      status: pickCsvValue(row, ["status"]) || "aberto",
    })),
    ["title", "category"],
  );

export const mapTasksCsv = (rows) =>
  removeEmptyRecords(
    rows.map((row) => ({
      title: pickCsvValue(row, ["tarefa", "titulo", "título", "title"]),
      assigned_to: pickCsvValue(row, ["responsavel", "responsável", "assigned_to"]),
      due_date: pickCsvValue(row, ["data limite", "data_limite", "due_date"]),
      notes: pickCsvValue(row, ["observacoes", "observações", "notes"]),
      status: pickCsvValue(row, ["status"]) || "pendente",
    })),
    ["title", "due_date"],
  );

export const mapLoansCsv = (rows) =>
  removeEmptyRecords(
    rows.map((row) => ({
      student_name: pickCsvValue(row, ["nome", "aluno", "student_name"]),
      grade: pickCsvValue(row, ["turma", "serie", "série", "grade"]),
      institution: pickCsvValue(row, ["instituicao", "instituição", "institution"]),
      equipment_type: pickCsvValue(row, ["tipo equipamento", "equipment_type", "equipamento"]),
      equipment_id: pickCsvValue(row, ["codigo equipamento", "equipment_id", "patrimonio"]),
      notes: pickCsvValue(row, ["observacoes", "observações", "notes"]),
      borrower_type: pickCsvValue(row, ["tipo pessoa", "borrower_type"]) || "aluno",
      checkout_time: pickCsvValue(row, ["retirada", "checkout_time"]) || new Date().toISOString(),
      status: pickCsvValue(row, ["status"]) || "emprestado",
    })),
    ["student_name", "equipment_type"],
  );

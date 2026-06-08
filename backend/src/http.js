export const sendJson = (res, statusCode, payload, headers = {}) => {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    ...headers,
  });
  res.end(body);
};

export const sendNoContent = (res) => {
  res.writeHead(204);
  res.end();
};

export const parseJsonBody = async (req) => {
  const chunks = [];

  for await (const chunk of req) {
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString("utf8").trim();
  if (!raw) return {};

  try {
    return JSON.parse(raw);
  } catch {
    const error = new Error("JSON inválido no corpo da requisição.");
    error.statusCode = 400;
    throw error;
  }
};

export const notFound = (res) => {
  sendJson(res, 404, { error: "Rota não encontrada." });
};

export const methodNotAllowed = (res) => {
  sendJson(res, 405, { error: "Método não permitido para esta rota." });
};

export const handleError = (res, error) => {
  const statusCode = error.statusCode || 500;
  const message =
    statusCode === 500 ? "Erro interno do servidor." : error.message;

  if (statusCode === 500) {
    console.error(error);
  }

  sendJson(res, statusCode, { error: message });
};

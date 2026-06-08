import crypto from "node:crypto";
import { config } from "./config.js";

const sessions = new Map();

const getBearerToken = (req) => {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  return scheme?.toLowerCase() === "bearer" ? token : null;
};

const safeEquals = (left, right) => {
  const leftBuffer = Buffer.from(String(left));
  const rightBuffer = Buffer.from(String(right));

  if (leftBuffer.length !== rightBuffer.length) return false;
  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
};

export const login = ({ username, password }) => {
  const isValidUser = safeEquals(username || "", config.adminUser);
  const isValidPassword = safeEquals(password || "", config.adminPassword);

  if (!isValidUser || !isValidPassword) {
    const error = new Error("Usuário ou senha inválidos.");
    error.statusCode = 401;
    throw error;
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = Date.now() + config.tokenTtlMs;
  const user = { id: "admin", username: config.adminUser, role: "admin" };

  sessions.set(token, { user, expiresAt });

  return {
    token,
    expires_at: new Date(expiresAt).toISOString(),
    user,
  };
};

export const logout = (req) => {
  const token = getBearerToken(req);
  if (token) sessions.delete(token);
};

export const getSession = (req) => {
  const token = getBearerToken(req);
  if (!token) return null;

  const session = sessions.get(token);
  if (!session) return null;

  if (session.expiresAt <= Date.now()) {
    sessions.delete(token);
    return null;
  }

  return session;
};

export const requireAuth = (req) => {
  const session = getSession(req);

  if (!session) {
    const error = new Error("Autenticação obrigatória.");
    error.statusCode = 401;
    throw error;
  }

  return session.user;
};

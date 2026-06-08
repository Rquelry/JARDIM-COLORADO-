import { login, logout, requireAuth } from "./auth.js";
import { parseJsonBody, sendJson, sendNoContent, methodNotAllowed } from "./http.js";
import {
  createResource,
  deleteResource,
  listResource,
  updateResource,
} from "./resources.js";

const resourcePattern =
  /^\/api\/(loans|teachers|service-calls|inventory|tasks|passwords|students|notebooks)(?:\/([^/]+))?$/;

export const routeRequest = async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === "/api/health" && req.method === "GET") {
    sendJson(res, 200, { status: "ok", service: "jardim-colorado-backend" });
    return true;
  }

  if (url.pathname === "/api/auth/login") {
    if (req.method !== "POST") return methodNotAllowed(res), true;
    const body = await parseJsonBody(req);
    sendJson(res, 200, login(body));
    return true;
  }

  if (url.pathname === "/api/auth/logout") {
    if (req.method !== "POST") return methodNotAllowed(res), true;
    logout(req);
    sendNoContent(res);
    return true;
  }

  if (url.pathname === "/api/auth/me") {
    if (req.method !== "GET") return methodNotAllowed(res), true;
    const user = requireAuth(req);
    sendJson(res, 200, { user });
    return true;
  }

  const resourceMatch = url.pathname.match(resourcePattern);
  if (!resourceMatch) return false;

  requireAuth(req);

  const [, resource, id] = resourceMatch;

  if (!id && req.method === "GET") {
    sendJson(res, 200, await listResource(resource, url.searchParams));
    return true;
  }

  if (!id && req.method === "POST") {
    sendJson(res, 201, await createResource(resource, await parseJsonBody(req)));
    return true;
  }

  if (id && ["PUT", "PATCH"].includes(req.method)) {
    sendJson(
      res,
      200,
      await updateResource(resource, decodeURIComponent(id), await parseJsonBody(req)),
    );
    return true;
  }

  if (id && req.method === "DELETE") {
    await deleteResource(resource, decodeURIComponent(id));
    sendNoContent(res);
    return true;
  }

  methodNotAllowed(res);
  return true;
};

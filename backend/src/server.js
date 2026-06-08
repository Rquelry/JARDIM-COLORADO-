import http from "node:http";
import { config } from "./config.js";
import { ensureDatabase } from "./database.js";
import { handleError, notFound } from "./http.js";
import { routeRequest } from "./router.js";

const corsHeaders = {
  "Access-Control-Allow-Origin": config.corsOrigin,
  "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
};

const server = http.createServer(async (req, res) => {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  try {
    const handled = await routeRequest(req, res);
    if (!handled) notFound(res);
  } catch (error) {
    handleError(res, error);
  }
});

await ensureDatabase();

server.listen(config.port, config.host, () => {
  console.log(
    `Backend Jardim Colorado disponivel em http://${config.host}:${config.port}`,
  );
  console.log(
    "Em LAN, acesse usando o IP desta maquina, por exemplo: http://SEU_IP:3001",
  );
});

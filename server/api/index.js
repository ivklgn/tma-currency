import { app } from "./app.js";

export default async function handler(req, reply) {
  await app.ready();
  app.server.emit("request", req, reply);
}

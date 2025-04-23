import { describe, it, expect } from "bun:test";
import { POST, GET, PUT, DELETE, PATCH } from "@/app/api/v2/pilotos/route";
import { NextRequest } from "next/server";

function createRequest(method: string, body?: any, url = "http://localhost/api/pilotos") {
  return new NextRequest(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
}

describe("Pilotos API", () => {
  let pilotoId: string;

  it("debe crear un nuevo piloto", async () => {
    const req = createRequest("POST", { nombre: "Juan Pérez", avion: null });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data).toHaveProperty("id");
    pilotoId = data.id;
  });

  it("debe obtener todos los pilotos", async () => {
    // En este caso, no es necesario enviar request porque GET no utiliza argumentos.
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });

  it("debe actualizar un piloto", async () => {
    const req = createRequest("PUT", { id: pilotoId, nombre: "Carlos López" });
    const res = await PUT(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty("nombre", "Carlos López");
  });

  it("debe actualizar parcialmente un piloto", async () => {
    // Supongamos que ya existe un piloto con id "test-piloto-id"
    const req = createRequest("PATCH", { id: pilotoId, nombre: "Nuevo Nombre" });
    const res = await PATCH(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty("nombre", "Nuevo Nombre");
  });

  it("debe eliminar un piloto", async () => {
    const req = createRequest("DELETE", { id: pilotoId });
    const res = await DELETE(req);
    expect(res.status).toBe(200);
  });
});

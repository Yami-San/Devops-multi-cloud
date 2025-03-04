import { describe, it, expect, beforeAll } from "bun:test";
import {
  POST as postAvion,
  GET as getAviones,
  PUT as putAvion,
  DELETE as deleteAvion,
} from "../../src/app/api/aviones/route";
import { POST as postPiloto } from "@/app/api/pilotos/route";
import { NextRequest } from "next/server";

function createRequest(method: string, body?: any, url = "http://localhost/api/aviones") {
  return new NextRequest(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
}

let pilotoId: string;
let avionId: string;

beforeAll(async () => {
  // Creamos un piloto para obtener un pilotoId válido
  const pilotoReq = new NextRequest("http://localhost/api/pilotos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombre: "Piloto Test", avion: null }),
  });
  const pilotoRes = await postPiloto(pilotoReq);
  const pilotoData = await pilotoRes.json();
  pilotoId = pilotoData.id;
});

describe("Aviones API", () => {
  it("debe crear un nuevo avión", async () => {
    const req = createRequest("POST", {
      modelo: "Boeing 737",
      matricula: "XYZ123",
      pilotoId: pilotoId, // Usamos el pilotoId obtenido
    });
    const res = await postAvion(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data).toHaveProperty("id");
    avionId = data.id;
  });

  it("debe obtener todos los aviones", async () => {
    const req = new NextRequest("http://localhost/api/aviones", { method: "GET" });
    const res = await getAviones(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });

  it("debe actualizar un avión", async () => {
    const req = createRequest("PUT", { id: avionId, modelo: "Airbus A320" });
    const res = await putAvion(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty("modelo", "Airbus A320");
  });

  it("debe eliminar un avión", async () => {
    const req = createRequest("DELETE", { id: avionId });
    const res = await deleteAvion(req);
    expect(res.status).toBe(200);
  });
});

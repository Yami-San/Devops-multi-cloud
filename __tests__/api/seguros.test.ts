import { describe, it, expect, beforeAll } from "bun:test";
import {
  POST as postSeguro,
  GET as getSeguros,
  PUT as putSeguro,
  DELETE as deleteSeguro, PATCH
} from "../../src/app/api/seguros/route";
import { POST as postAvion } from "@/app/api/aviones/route";
import { POST as postPiloto } from "@/app/api/pilotos/route";
import { NextRequest } from "next/server";

function createRequest(method: string, body?: any, url = "http://localhost/api/seguros") {
  return new NextRequest(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
}

let avionId: string;

beforeAll(async () => {
  // Primero, crea un piloto
  const pilotoReq = new NextRequest("http://localhost/api/pilotos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombre: "Piloto para Seguro", avion: null }),
  });
  const pilotoRes = await postPiloto(pilotoReq);
  const pilotoData = await pilotoRes.json();
  const pilotoId = pilotoData.id;

  // Luego, crea un avión utilizando el piloto creado
  const avionReq = new NextRequest("http://localhost/api/aviones", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      modelo: "Boeing 747",
      matricula: "ABC789",
      pilotoId: pilotoId,
    }),
  });
  const avionRes = await postAvion(avionReq);
  const avionData = await avionRes.json();
  avionId = avionData.id;
});

describe("Seguros API", () => {
  let seguroId: string;

  it("debe crear un nuevo seguro", async () => {
    const req = createRequest("POST", { poliza: "ABC123", avionId: avionId });
    const res = await postSeguro(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data).toHaveProperty("id");
    seguroId = data.id;
  });

  it("debe obtener todos los seguros", async () => {
    const req = new NextRequest("http://localhost/api/seguros", { method: "GET" });
    const res = await getSeguros(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });

  it("debe actualizar un seguro", async () => {
    const req = createRequest("PUT", { id: seguroId, poliza: "DEF456" });
    const res = await putSeguro(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty("poliza", "DEF456");
  });

  it("debe actualizar parcialmente un seguro", async () => {
    // Supongamos que ya existe un seguro con id "test-seguro-id"
    const req = createRequest("PATCH", { id: seguroId, poliza: "Nueva Poliza" });
    const res = await PATCH(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty("poliza", "Nueva Poliza");
  });

  it("debe eliminar un seguro", async () => {
    const req = createRequest("DELETE", { id: seguroId });
    const res = await deleteSeguro(req);
    expect(res.status).toBe(200);
  });
});

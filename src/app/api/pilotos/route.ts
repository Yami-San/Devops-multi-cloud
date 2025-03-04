// app/api/pilotos/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Obtener todos los pilotos (GET)
export async function GET() {
  try {
    const pilotos = await prisma.piloto.findMany({
      include: { aviones: true } // Incluye la relación con aviones si la requieres
    });
    return NextResponse.json(pilotos, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener los pilotos' }, { status: 500 });
  }
}

// Crear un nuevo piloto (POST)
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    // Puedes agregar validaciones de datos aquí
    const nuevoPiloto = await prisma.piloto.create({
      data: {
        nombre: data.nombre,
        // Si deseas crear aviones asociados, descomenta y ajusta:
        // aviones: data.aviones ? { create: data.aviones } : undefined,
      }
    });
    return NextResponse.json(nuevoPiloto, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear el piloto' }, { status: 500 });
  }
}

// Actualizar un piloto existente (PUT)
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const { id, ...updateData } = data;
    if (!id) {
      return NextResponse.json({ error: 'No se proporcionó el id del piloto' }, { status: 400 });
    }
    const pilotoActualizado = await prisma.piloto.update({
      where: { id },
      data: updateData,
    });
    return NextResponse.json(pilotoActualizado, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar el piloto' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const data = await request.json();
    const { id, ...updates } = data;

    if (!id) {
      return NextResponse.json({ error: "El campo 'id' es obligatorio." }, { status: 400 });
    }

    const updatedPiloto = await prisma.piloto.update({
      where: { id },
      data: updates,
    });

    return NextResponse.json(updatedPiloto, { status: 200 });
  } catch (error) {
    console.error("Error al actualizar Piloto:", error);
    return NextResponse.json({ error: "Error al actualizar el piloto." }, { status: 500 });
  }
}

// Eliminar un piloto (DELETE)
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'No se proporcionó el id del piloto' }, { status: 400 });
    }
    await prisma.piloto.delete({
      where: { id },
    });
    return NextResponse.json({ message: 'Piloto eliminado' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar el piloto' }, { status: 500 });
  }
}

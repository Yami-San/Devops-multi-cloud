// app/api/aviones/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Crear un nuevo avión (POST)
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const nuevoAvion = await prisma.avion.create({
      data,
    });
    return NextResponse.json(nuevoAvion, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear el avión' }, { status: 500 });
  }
}

// Obtener todos los aviones (GET)
export async function GET(request: NextRequest) {
  try {
    const aviones = await prisma.avion.findMany();
    return NextResponse.json(aviones, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener los aviones' }, { status: 500 });
  }
}

// Actualizar un avión existente (PUT)
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const { id, ...updates } = data;
    const avionActualizado = await prisma.avion.update({
      where: { id },
      data: updates,
    });
    return NextResponse.json(avionActualizado, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar el avión' }, { status: 500 });
  }
}

// Eliminar un avión (DELETE)
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    await prisma.avion.delete({
      where: { id },
    });
    return NextResponse.json({ message: 'Avión eliminado' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar el avión' }, { status: 500 });
  }
}

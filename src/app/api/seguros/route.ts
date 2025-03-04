import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Crear un nuevo seguro (POST)
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const nuevoSeguro = await prisma.seguro.create({
      data,
    });
    return NextResponse.json(nuevoSeguro, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear el seguro' }, { status: 500 });
  }
}

// Obtener todos los seguros (GET)
export async function GET(request: NextRequest) {
  try {
    const seguros = await prisma.seguro.findMany();
    return NextResponse.json(seguros, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener los seguros' }, { status: 500 });
  }
}

// Actualizar un seguro existente (PUT)
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const { id, ...updates } = data;
    const seguroActualizado = await prisma.seguro.update({
      where: { id },
      data: updates,
    });
    return NextResponse.json(seguroActualizado, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar el seguro' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const data = await request.json();
    const { id, ...updates } = data;

    if (!id) {
      return NextResponse.json({ error: "El campo 'id' es obligatorio." }, { status: 400 });
    }

    const updatedSeguro = await prisma.seguro.update({
      where: { id },
      data: updates,
    });

    return NextResponse.json(updatedSeguro, { status: 200 });
  } catch (error) {
    console.error("Error al actualizar Seguro:", error);
    return NextResponse.json({ error: "Error al actualizar el seguro." }, { status: 500 });
  }
}

// Eliminar un seguro (DELETE)
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    await prisma.seguro.delete({
      where: { id },
    });
    return NextResponse.json({ message: 'Seguro eliminado' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar el seguro' }, { status: 500 });
  }
}

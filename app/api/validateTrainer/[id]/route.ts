import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { RequestResponse } from '@/interfaces/api';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = Number(params?.id);
  console.log(userId)

  try {
    const userRole = await prisma.userRoles.findFirst({
      where: {
        userId: userId,
        roleId: 2 // ID del rol de entrenador
      }
    });

    if (userRole) {
      // El usuario es un entrenador, buscar sus clientes
      const trainerWithClients = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          clientes: true, // Incluir los clientes en la consulta
        },
      });

      return NextResponse.json<RequestResponse>({
        status: 200,
        message: "User is a trainer",
        data: {
          isTrainer: true,
          clients: trainerWithClients?.clientes || []
        },
      });
    } else {
      return NextResponse.json<RequestResponse>({
        status: 200,
        message: "User is not a trainer",
        data: {
          isTrainer: false,
          clients: []
        },
      });
    }

  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: `Error fetching entrenador status for user ${userId}`, message: error.message }, { status: 500 });
    }
  }
}


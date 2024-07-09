import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { RequestResponse } from '@/interfaces/api';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('id: ' + params?.id);
  const muscleId = Number(params?.id) || null;
  console.log('muscleId: ' + muscleId);

  try {
    // Buscar el músculo con sus áreas
    const muscleWithAreas = await prisma.muscle.findUnique({
      where: { id: Number(muscleId) },
      include: {
        areas: true,
      },
    });
    console.log('muscleWithAreas: ' + muscleWithAreas)

    if (!muscleWithAreas?.areas) {
      return NextResponse.json<RequestResponse>({
        status: 200,
        message: "Areas of this muscle not found",
      });
    }

    return NextResponse.json<RequestResponse>({
      status: 200,
      message: "Muscle and areas found",
      data: muscleWithAreas,
    });

  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: `Error fetching entrenador status for user ${muscleId}`, message: error.message }, { status: 500 });
    }
  }
}

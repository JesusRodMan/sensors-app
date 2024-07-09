import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request: NextApiRequest, res: NextApiResponse) {
  try {
    const muscles = await prisma.muscle.findMany();

    if (!muscles) {
      return NextResponse.json({
        status: 404,
        message: "Muscles not found",
      });
    }

    return NextResponse.json({
      status: 200,
      message: "Muscles found",
      data: muscles,
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({
        message: error.message,
        status: 500,
      });
    }
  }
}

// Ensure Prisma Client is properly closed when not needed
prisma.$disconnect();

import { PrismaClient, User } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { RequestResponse } from '@/interfaces/api';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = params?.id || 0;

  try {
    const user = (await prisma.user.findUnique({
      where: { id: Number(userId) }
    })) as User;

    if (!user) {
      return NextResponse.json<RequestResponse>({
        status: 404,
        message: "User not found",
      });
    }
    return NextResponse.json<RequestResponse>({
      status: 200,
      message: "User found",
      data: user,
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json<RequestResponse>({
        message: error.message,
        status: 500,
      });
    }
  }
}

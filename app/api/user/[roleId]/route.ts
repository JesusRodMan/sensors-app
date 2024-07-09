import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { RequestResponse } from '@/interfaces/api';
import { hashPassword } from '@/lib/utils';

const prisma = new PrismaClient();


export async function POST(request: NextRequest) {
  const body = await request.json();
  const { username, password, userRoles, entrenadorId } = body as {
    username: string;
    password: string;
    userRoles: { roleId: number }[];
    entrenadorId: number;
  };

  try {
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });
    if (existingUser) {
      return NextResponse.json({ message: 'El nombre de usuario ya existe' }, { status: 400 });
    }
    const hashedPassword = hashPassword(password);
    const newUser = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        entrenadorId: entrenadorId || null,
        registers: [],
        UserRoles: {
          create: userRoles.map(role => ({
            role: {
              connect: { id: role.roleId },
            },
          })),
        },
      },
      include: {
        UserRoles: true,
      },
    });
    console.log(newUser);

    return NextResponse.json({ data: newUser }, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      console.log(error)
      return NextResponse.json({ error: "User creation failed", message: error.message }, { status: 500 });
    }
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { roleId: string } }
) {
  try {
    const roleId = Number(params?.roleId) || null;
    console.log(roleId);
    let users;

    if (roleId && roleId !== 0) {
      users = await prisma.user.findMany({
        where: {
          UserRoles: {
            some: {
              roleId: roleId,
            },
          },
        },
        include: {
          UserRoles: true,
        },
      });
    } else {
      users = await prisma.user.findMany({
        include: {
          UserRoles: true,
        },
      });
    }

    if (!users) {
      return NextResponse.json<RequestResponse>({
        status: 404,
        message: "Users not found",
      }, { status: 404 });
    }

    return NextResponse.json<RequestResponse>({
      status: 200,
      message: "User found",
      data: users,
    });

  } catch (error: any) {
    console.error("Error fetching users:", error);

    // Detectar errores de conexión a la base de datos
    if (typeof error === 'object' && error.message?.includes("Can't reach database server")) {
      return NextResponse.json<RequestResponse>({
        message: "No hay conexión a la base de datos",
        status: 503, // Service Unavailable
      }, { status: 503 });
    }

    // Otros errores internos del servidor
    return NextResponse.json<RequestResponse>({
      message: "Error interno del servidor",
      status: 500,
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { userId, newData, muscleId, nameArea, exercise } = body as {
    userId: number;
    newData: number[];
    muscleId: string;
    nameArea: string;
    exercise: string;
  };

  console.log('data:', newData);

  try {
    const usuario = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!usuario) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Determinar el id más alto actual y asignar un nuevo id incremental
    const newId = usuario.registers.length + 1;

    // Crear el nuevo registro con timestamp y datos
    const newRegister = {
      id: newId,
      timestamp: new Date().toISOString(),
      data: newData,
      muscleId: muscleId,
      nameArea: nameArea,
      exercise: exercise,
    };

    // Asegurarse de que registers es un array antes de agregar nuevos datos
    const updatedRegisters = Array.isArray(usuario.registers) ? [...usuario.registers, newRegister] : [newRegister];

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        registers: updatedRegisters as any,
      },
    });

    return NextResponse.json({ data: updatedUser }, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      console.log(error);
      return NextResponse.json({ error: "Failed to update user", message: error.message }, { status: 500 });
    }
  }
}

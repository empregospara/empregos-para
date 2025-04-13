import { PrismaClient } from '@prisma/client'; // Importando o Prisma Client
import { NextResponse } from 'next/server';

const prisma = new PrismaClient(); // Instanciando o Prisma Client

// Método GET: Para buscar todos os usuários da tabela credentials
export async function GET() {
  try {
    const users = await prisma.credentials.findMany(); // Busca todos os usuários
    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Error fetching users' }, { status: 500 });
  }
}

// Método POST: Para criar um novo usuário (fullName e email)
export async function POST(request: Request) {
  try {
    const { fullName, email } = await request.json();

    // Validação básica dos dados
    if (!fullName || !email) {
      return NextResponse.json({ error: 'Full name and email are required' }, { status: 400 });
    }

    const newUser = await prisma.credentials.create({ // Criar um novo usuário
      data: {
        fullName,
        email,
        createdAt: new Date(), // Data de criação
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Error creating user' }, { status: 500 });
  } finally {
    await prisma.$disconnect(); // Desconectar o Prisma Client após as operações
  }
}

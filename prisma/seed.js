import 'dotenv/config';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 Iniciando seed...');


    await prisma.$executeRawUnsafe(
        `TRUNCATE TABLE "itemPedido", "pedido", "produto", "cliente" RESTART IDENTITY CASCADE;`,
    );

    console.log('📦 Inserindo clientes...');
    const clientes = await prisma.cliente.createMany({
        data: [
            {
                nome: 'João Silva',
                telefone: '11987654321',
                email: 'joao@email.com',
                cpf: '12345678901',
            },
            {
                nome: 'Maria Santos',
                telefone: '21987654321',
                email: 'maria@email.com',
                cpf: '12345678902',
            },
            {
                nome: 'Pedro Oliveira',
                telefone: '31987654321',
                email: 'pedro@email.com',
                cpf: '12345678903',
            },
            {
                nome: 'Ana Costa',
                telefone: '85987654321',
                email: 'ana@email.com',
                cpf: '12345678904',
            },
            {
                nome: 'Carlos Ferreira',
                telefone: '71987654321',
                email: 'carlos@email.com',
                cpf: '12345678905',
            },
        ],
    });

    console.log('📦 Inserindo produtos...');
    const produtos = await prisma.produto.createMany({
        data: [
            {
                nome: 'Hambúrguer Clássico',
                descricao: 'Queijo, alface, tomate e molho',
                categoria: 'LANCHE',
                preco: '18.50',
            },
            {
                nome: 'Refrigerante 2L',
                descricao: 'Garrafa de 2 litros',
                categoria: 'BEBIDA',
                preco: '9.90',
            },
            {
                nome: 'Pudim de Leite',
                descricao: 'Pudim caseiro',
                categoria: 'SOBREMESA',
                preco: '7.50',
            },
            {
                nome: 'Pizza Mussarela',
                descricao: 'Pizza grande',
                categoria: 'LANCHE',
                preco: '35.00',
            },
            {
                nome: 'Suco Natural',
                descricao: 'Frutas frescas',
                categoria: 'BEBIDA',
                preco: '8.50',
            },
        ],
    });

    console.log('✅ Seed concluído com sucesso!');
    console.log(`📊 ${clientes.count} clientes e ${produtos.count} produtos inseridos!`);
}

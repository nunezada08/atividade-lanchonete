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

    // Limpar dados existentes (ordem importa por causa das relações)
    await prisma.itemPedido.deleteMany();
    await prisma.pedido.deleteMany();
    await prisma.cliente.deleteMany();
    await prisma.produto.deleteMany();

    console.log('📦 Inserindo clientes...');
    const clientes = await prisma.cliente.createMany({
        data: [
            {
                nome: 'João Silva',
                telefone: '11987654321',
                email: 'joao@email.com',
                cpf: '12345678901',
                ativo: true,
            },
            {
                nome: 'Maria Santos',
                telefone: '21987654321',
                email: 'maria@email.com',
                cpf: '12345678902',
                ativo: true,
            },
            {
                nome: 'Pedro Oliveira',
                telefone: '31987654321',
                email: 'pedro@email.com',
                cpf: '12345678903',
                ativo: true,
            },
            {
                nome: 'Ana Costa',
                telefone: '85987654321',
                email: 'ana@email.com',
                cpf: '12345678904',
                ativo: true,
            },
            {
                nome: 'Carlos Ferreira',
                telefone: '71987654321',
                email: 'carlos@email.com',
                cpf: '12345678905',
                ativo: true,
            },
        ],
    });

    console.log('📦 Inserindo produtos...');
    const produtos = await prisma.produto.createMany({
        data: [
            {
                nome: 'Hambúrguer Clássico',
                descricao: 'Hambúrguer com queijo, alface, tomate e molho especial',
                categoria: 'LANCHE',
                preco: '18.50',
                disponivel: true,
            },
            {
                nome: 'Refrigerante 2L',
                descricao: 'Refrigerante gelado em garrafa de 2 litros',
                categoria: 'BEBIDA',
                preco: '9.90',
                disponivel: true,
            },
            {
                nome: 'Pudim de Leite',
                descricao: 'Delicioso pudim caseiro com calda de caramelo',
                categoria: 'SOBREMESA',
                preco: '7.50',
                disponivel: true,
            },
            {
                nome: 'Pizza Mussarela',
                descricao: 'Pizza grande com mussarela derretida e orégano',
                categoria: 'LANCHE',
                preco: '35.00',
                disponivel: true,
            },
            {
                nome: 'Suco Natural',
                descricao: 'Suco natural de frutas frescas',
                categoria: 'BEBIDA',
                preco: '8.50',
                disponivel: true,
            },
        ],
    });

    console.log('✅ Seed concluído com sucesso!');
    console.log(`📊 ${clientes.count + 2} clientes e ${produtos.count + 2} produtos inseridos!`);
}

main()
    .catch((e) => {
        console.error('❌ Erro no seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

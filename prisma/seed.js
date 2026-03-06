import 'dotenv/config';
import pkg from '@prisma/client';
const { PrismaClient, TipoStatus, TipoCategoria } = pkg;
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 Iniciando seed...');

    await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE "itemPedido", "pedidos", "cliente", "produtos"
    RESTART IDENTITY CASCADE;
  `);

    console.log('📦 Inserindo clientes...');
    await prisma.cliente.createMany({
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
        ],
    });

    console.log('📦 Inserindo produtos...');
    await prisma.produtos.createMany({
        data: [
            {
                nome: 'Hambúrguer Clássico',
                descricao: 'Hambúrguer com queijo, alface e tomate',
                categoria: TipoCategoria.LANCHE,
                preco: '18.50',
                disponivel: true,
            },
            {
                nome: 'Refrigerante 2L',
                descricao: 'Garrafa 2 litros',
                categoria: TipoCategoria.BEBIDA,
                preco: '9.90',
                disponivel: true,
            },
            {
                nome: 'Pudim de Leite',
                descricao: 'Pudim caseiro',
                categoria: TipoCategoria.SOBREMESA,
                preco: '7.50',
                disponivel: true,
            },
            {
                nome: 'Combo Burger + Refri',
                descricao: 'Hambúrguer + Refrigerante',
                categoria: TipoCategoria.COMBO,
                preco: '25.00',
                disponivel: true,
            },
        ],
    });

    console.log('📦 Inserindo pedidos...');
    await prisma.pedidos.createMany({
        data: [
            {
                clienteId: 1,
                total: '28.40',
                status: TipoStatus.ABERTO,
            },
            {
                clienteId: 2,
                total: '25.00',
                status: TipoStatus.PAGO,
            },
            {
                clienteId: 3,
                total: '15.00',
                status: TipoStatus.CANCELADO,
            },
        ],
    });

    console.log('📦 Inserindo itens dos pedidos...');
    await prisma.itemPedido.createMany({
        data: [
            // Pedido 1
            {
                pedidoId: 1,
                produtoId: 1,
                quantidade: 1,
                precoUnitario: '18.50',
            },
            {
                pedidoId: 1,
                produtoId: 2,
                quantidade: 1,
                precoUnitario: '9.90',
            },

            {
                pedidoId: 2,
                produtoId: 4,
                quantidade: 1,
                precoUnitario: '25.00',
            },

            {
                pedidoId: 3,
                produtoId: 3,
                quantidade: 2,
                precoUnitario: '7.50',
            },
        ],
    });

    console.log('✅ Seed concluído com sucesso!');
}

main()
    .catch((e) => {
        console.error('❌ Erro no seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

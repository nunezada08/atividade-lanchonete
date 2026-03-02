import prisma from '../utils/prismaClient.js';

export default class ItemPedidoModel {
    constructor({ id = null, pedidoId, produtoId, quantidade, precoUnitario = null } = {}) {
        this.id = id;
        this.pedidoId = pedidoId;
        this.produtoId = produtoId;
        this.quantidade = quantidade;
        this.precoUnitario = precoUnitario;
    }

    // Validações de regra de negócio
    validar() {
        if (!this.pedidoId || !this.produtoId || !this.quantidade) {
            throw new Error('pedidoId, produtoId e quantidade são obrigatórios');
        }

        if (this.quantidade <= 0) {
            throw new Error('A quantidade deve ser maior que 0');
        }

        return true;
    }

    async criar() {
        this.validar();

        // Se o precoUnitario não foi informado, buscar do produto
        if (!this.precoUnitario) {
            const produto = await prisma.produto.findUnique({
                where: { id: this.produtoId },
            });

            if (!produto) {
                throw new Error('Produto não encontrado');
            }

            this.precoUnitario = produto.preco;
        }

        return prisma.itemPedido.create({
            data: {
                pedidoId: this.pedidoId,
                produtoId: this.produtoId,
                quantidade: this.quantidade,
                precoUnitario: this.precoUnitario,
            },
            include: {
                produto: true,
                pedido: true,
            },
        });
    }

    async atualizar() {
        this.validar();

        return prisma.itemPedido.update({
            where: { id: this.id },
            data: {
                quantidade: this.quantidade,
                precoUnitario: this.precoUnitario,
            },
            include: {
                produto: true,
                pedido: true,
            },
        });
    }

    async deletar() {
        return prisma.itemPedido.delete({
            where: { id: this.id },
        });
    }

    static async buscarTodos(filtros = {}) {
        const where = {};

        if (filtros.pedidoId) where.pedidoId = parseInt(filtros.pedidoId);
        if (filtros.produtoId) where.produtoId = parseInt(filtros.produtoId);

        return prisma.itemPedido.findMany({
            where,
            include: {
                produto: true,
                pedido: true,
            },
        });
    }

    static async buscarPorId(id) {
        const data = await prisma.itemPedido.findUnique({
            where: { id },
            include: {
                produto: true,
                pedido: true,
            },
        });

        if (!data) return null;
        return new ItemPedidoModel(data);
    }

    static async buscarPorPedido(pedidoId) {
        return prisma.itemPedido.findMany({
            where: { pedidoId },
            include: {
                produto: true,
            },
        });
    }
}

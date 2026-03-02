import prisma from '../utils/prismaClient.js';

export default class ItemPedidoModel {
    constructor({ id = null, pedidoId = null, produtoId = null, quantidade = 0, precoUnitario = null } = {}) {
        this.id = id;
        this.pedidoId = pedidoId;
        this.produtoId = produtoId;
        this.quantidade = quantidade;
        this.precoUnitario = precoUnitario;
    }

    async criar() {
        return prisma.itemPedido.create({
            data: {
                pedidoId: this.pedidoId,
                produtoId: this.produtoId,
                quantidade: this.quantidade,
                precoUnitario: this.precoUnitario,
            },
        });
    }

    async atualizar() {
        const data = {};
        if (this.quantidade !== undefined) data.quantidade = this.quantidade;
        if (this.precoUnitario !== undefined) data.precoUnitario = this.precoUnitario;

        return prisma.itemPedido.update({
            where: { id: this.id },
            data,
        });
    }

    async deletar() {
        return prisma.itemPedido.delete({ where: { id: this.id } });
    }

    static async buscarTodos(filtros = {}) {
        const where = {};
        if (filtros.pedidoId) where.pedidoId = parseInt(filtros.pedidoId);
        if (filtros.produtoId) where.produtoId = parseInt(filtros.produtoId);
        return prisma.itemPedido.findMany({ where });
    }

    static async buscarPorId(id) {
        const data = await prisma.itemPedido.findUnique({ where: { id } });
        if (!data) return null;
        return new ItemPedidoModel(data);
    }
}

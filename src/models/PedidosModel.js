import prisma from '../utils/prismaClient.js';

export default class PedidoModel {
    constructor({ id = null, cliente = null, status = true, total = null } = {}) {
        this.id = id;
        this.cliente = cliente;
        this.status = status;
        this.total = total;
    }

    async criar() {
        return prisma.pedido.create({
            data: {
                cliente: this.cliente,
                status: this.status,
                total: this.total,
            },
        });
    }

    async atualizar() {
        return prisma.pedido.update({
            where: { id: this.id },
            data: { cliente: this.cliente, status: this.status, total: this.total },
        });
    }

    async deletar() {
        return prisma.pedido.delete({ where: { id: this.id } });
    }

    static async buscarTodos(filtros = {}) {
        const where = {};

        if (filtros.cliente) where.cliente = { contains: filtros.cliente, mode: 'insensitive' };
        if (filtros.status !== undefined) where.status = filtros.status === 'true';
        if (filtros.total !== undefined) where.total = parseFloat(filtros.total);

        return prisma.pedido.findMany({ where });
    }

    static async buscarPorId(id) {
        const data = await prisma.pedido.findUnique({ where: { id } });
        if (!data) return null;
        return new pedidoModel(data);
    }
}

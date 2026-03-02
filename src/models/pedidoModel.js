import prisma from '../utils/prismaClient.js';

export default class PedidoModel {
    constructor({ id = null, nome = null, status = true, total = null } = {}) {
        this.id = id;
        this.nome = nome;
        this.status = status;
        this.total = total;
    }

    async criar() {
        return prisma.pedido.create({
            data: {
                nome: this.nome,
                status: this.status,
                total: this.total,
            },
        });
    }

    async atualizar() {
        return prisma.pedido.update({
            where: { id: this.id },
            data: { nome: this.nome, status: this.status, total: this.total },
        });
    }

    async deletar() {
        return prisma.pedido.delete({ where: { id: this.id } });
    }

    static async buscarTodos(filtros = {}) {
        const where = {};

        if (filtros.nome) where.nome = { contains: filtros.nome, mode: 'insensitive' };
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

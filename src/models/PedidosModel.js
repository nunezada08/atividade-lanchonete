import prisma from '../utils/prismaClient.js';

export default class PedidoModel {
    constructor({ id = null, clienteId = null, status = 'ABERTO', total = 0, cliente = null } = {}) {
        this.id = id;
        this.clienteId = clienteId;
        this.status = status;
        this.total = total;
        this.cliente = cliente;
    }

    async criar() {
        // ensure clienteId is a number so Prisma can link correctly
        const clienteId = Number(this.clienteId);
        return prisma.pedidos.create({
            data: {
                // connect via relation instead of setting the foreign key directly
                cliente: { connect: { id: clienteId } },
                status: this.status || 'ABERTO',
                total: 0,
            },
            include: { cliente: true }, // return the related cliente object
        });
    }

    async atualizar() {
        const data = {};
        if (this.clienteId !== undefined) {
            // convert and connect to maintain relational integrity
            data.cliente = { connect: { id: Number(this.clienteId) } };
        }
        if (this.status !== undefined) data.status = this.status;
        if (this.total !== undefined) data.total = this.total;

        return prisma.pedidos.update({
            where: { id: this.id },
            data,
            include: { cliente: true },
        });
    }

    async deletar() {
        return prisma.pedidos.delete({ where: { id: this.id } });
    }

    static async buscarTodos(filtros = {}) {
        const where = {};

        if (filtros.cliente)
            where.cliente = { nome: { contains: filtros.cliente, mode: 'insensitive' } };
        if (filtros.status) where.status = filtros.status;
        if (filtros.total !== undefined) where.total = parseFloat(filtros.total);

        // always include the cliente relation so callers can see the linked customer
        return prisma.pedidos.findMany({ where, include: { cliente: true } });
    }

    static async buscarPorId(id) {
        const data = await prisma.pedidos.findUnique({
            where: { id },
            include: { cliente: true },
        });
        if (!data) return null;
        return new PedidoModel(data);
    }

    static async calcularTotal(pedidoId) {
        const itens = await prisma.itemPedido.findMany({ where: { pedidoId } });
        const total = itens.reduce((acc, item) => {
            return acc + parseFloat(item.precoUnitario) * item.quantidade;
        }, 0);

        const atualizado = await prisma.pedidos.update({
            where: { id: pedidoId },
            data: { total: Number(total.toFixed(2)) },
        });
        return atualizado.total;
    }


    static validarMudancaStatus(pedidoAtual, novoStatus) {
        if (
            (novoStatus === 'CANCELADO' || novoStatus === 'PAGO') &&
            pedidoAtual.status !== 'ABERTO'
        ) {
            throw new Error(
                'Só é possível alterar o status para PAGO ou CANCELADO quando o pedido estiver ABERTO.',
            );
        }
    }
}
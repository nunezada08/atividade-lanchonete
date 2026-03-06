import prisma from '../utils/prismaClient.js';

export default class PedidoModel {
    constructor({ id = null, clienteId = null, status = 'ABERTO', total = 0 } = {}) {
        this.id = id;
        this.clienteId = clienteId;
        this.status = status;
        this.total = total;
    }

    async criar() {
        return prisma.pedidos.create({
            data: {
                clienteId: this.cliente,
                status: 'ABERTO',
                total: 0,
            },
        });
    }

    async atualizar() {
        const data = {};
        if (this.clienteId !== undefined) data.clienteId = this.clienteId;
        if (this.status !== undefined) data.status = this.status;
        if (this.total !== undefined) data.total = this.total;

        return prisma.pedidos.update({
            where: { id: this.id },
            data,
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

        return prisma.pedidos.findMany({ where });
    }

    static async buscarPorId(id) {
        const data = await prisma.pedidos.findUnique({ where: { id } });
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
            data: { total: total.toFixed(2) },
        });
        return atualizado.total;
    }

    /**
     * Valida se a transição de status é permitida.
     */
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

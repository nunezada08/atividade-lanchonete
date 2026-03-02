import prisma from '../utils/prismaClient.js';

export default class PedidoModel {
    constructor({ id = null, cliente = null, status = 'ABERTO', total = 0 } = {}) {
        this.id = id;
        this.cliente = cliente;
        this.status = status; // TipoStatus enum: 'ABERTO'|'PAGO'|'CANCELADO'
        this.total = total;
    }

    async criar() {
        // novos pedidos sempre iniciam em ABERTO e total 0, ignorando valores passados
        return prisma.pedido.create({
            data: {
                cliente: this.cliente,
                status: 'ABERTO',
                total: 0,
            },
        });
    }

    async atualizar() {
        // o total não pode ser alterado arbitrariamente; será recalculado quando necessário
        const data = {};
        if (this.cliente !== undefined) data.cliente = this.cliente;
        if (this.status !== undefined) data.status = this.status;
        if (this.total !== undefined) data.total = this.total;

        return prisma.pedido.update({
            where: { id: this.id },
            data,
        });
    }

    async deletar() {
        return prisma.pedido.delete({ where: { id: this.id } });
    }

    static async buscarTodos(filtros = {}) {
        const where = {};

        if (filtros.cliente) where.cliente = { contains: filtros.cliente, mode: 'insensitive' };
        if (filtros.status) where.status = filtros.status; // espera 'ABERTO','PAGO' ou 'CANCELADO'
        if (filtros.total !== undefined) where.total = parseFloat(filtros.total);

        return prisma.pedido.findMany({ where });
    }

    static async buscarPorId(id) {
        const data = await prisma.pedido.findUnique({ where: { id } });
        if (!data) return null;
        return new PedidoModel(data);
    }

    /**
     * Recalcula o total do pedido somando todos os itens associados.
     * Atualiza a coluna no banco.
     */
    static async calcularTotal(pedidoId) {
        const itens = await prisma.itemPedido.findMany({ where: { pedidoId } });
        const total = itens.reduce((acc, item) => {
            return acc + parseFloat(item.precoUnitario) * item.quantidade;
        }, 0);

        const atualizado = await prisma.pedido.update({
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

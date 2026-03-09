import prisma from '../utils/prismaClient.js';

export default class ItemPedidoModel {
    constructor({
        id = null,
        pedidoId = null,
        produtoId = null,
        quantidade = 0,
        precoUnitario = null,
    } = {}) {
        this.id = id;
        this.pedidoId = pedidoId;
        this.produtoId = produtoId;
        this.quantidade = quantidade;
        this.precoUnitario = precoUnitario;
    }

    async validar(operacao = 'criar') {

        if (this.pedidoId) {
            const pedido = await prisma.pedidos.findUnique({ where: { id: this.pedidoId } });
            if (pedido && pedido.status !== 'ABERTO') {
                throw new Error('Não é possível adicionar ou alterar itens de um pedido que não esteja ABERTO');
            }
        }

        if (this.quantidade <= 0 || this.quantidade > 99) {
            throw new Error('A quantidade deve ser maior que 0 e no máximo 99');
        }

        if(this.produto){
            const produto = await prisma.produtos.findUnique({
                where: { id: this.produtoId },
            });

            if (!produto)
                throw new Error('Produto não encontrado');

            if (!produto.disponivel)
                throw new Error('Não é possível adicionar produto indisponível ao pedido');

            if (operacao === 'criar') {
                this.precoUnitario = produto.preco;
            }
        }
    }
    async criar() {
        await this.validar('criar');

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
        await this.validar('atualizar');

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
        return prisma.itemPedido.findMany({ where });
    }

    static async buscarPorId(id) {
        const data = await prisma.itemPedido.findUnique({ where: { id } });
        if (!data) return null;
        return new ItemPedidoModel(data);
    }
}

import prisma from '../utils/prismaClient.js';

export default class PedidoModel {
  constructor({ id = null, clienteId = null, status = 'ABERTO', total = 0 } = {}) {
    this.id = id;
    this.clienteId = clienteId;
    this.status = status;
    this.total = total;
  }

  static async validarClienteAtivo(clienteId) {
    const cliente = await prisma.cliente.findUnique({
      where: { id: Number(clienteId) }
    });

    if (!cliente) throw new Error('Cliente não encontrado');

    if (!cliente.ativo) {
      throw new Error('Não é possível criar pedido para cliente inativo');
    }
    return cliente;
  }

  static async validarEstadoParaAlteracao(pedidoId) {
    const pedido = await prisma.pedidos.findUnique({ where: { id: Number(pedidoId) } });
    if (!pedido) throw new Error('Pedido não encontrado');

    if (pedido.status !== 'ABERTO') {
      throw new Error(`Operação não permitida: O pedido está com status ${pedido.status}`);
    }
    return pedido;
  }


  async criar() {

    await PedidoModel.validarClienteAtivo(this.clienteId);

    return prisma.pedidos.create({
      data: {
        clienteId: Number(this.clienteId),
        status: 'ABERTO',
        total: 0
      },
      include: { cliente: true }
    });
  }

  static async calcularTotal(pedidoId) {

    const itens = await prisma.itemPedido.findMany({
      where: { pedidoId: Number(pedidoId) }
    });

    const totalCalculado = itens.reduce((acc, item) => {
      return acc + (parseFloat(item.precoUnitario) * item.quantidade);
    }, 0);

    return prisma.pedidos.update({
      where: { id: Number(pedidoId) },
      data: { total: Number(totalCalculado.toFixed(2)) }
    });
  }

  static async cancelar(pedidoId) {

    await PedidoModel.validarEstadoParaAlteracao(pedidoId);

    return prisma.pedidos.update({
      where: { id: Number(pedidoId) },
      data: { status: 'CANCELADO' }
    });
  }

  static async pagar(pedidoId) {

    await PedidoModel.validarEstadoParaAlteracao(pedidoId);

    return prisma.pedidos.update({
      where: { id: Number(pedidoId) },
      data: { status: 'PAGO' }
    });
  }


  static async buscarTodos() {
    const pedidos = await prisma.pedidos.findMany({ include: { cliente: true, itensPedidos: true } });
    return pedidos.map(pedido => ({
      ...pedido,
      total: pedido.itensPedidos.reduce((acc, item) => acc + (parseFloat(item.precoUnitario) * item.quantidade), 0).toFixed(2)
    }));
  }

  static async buscarPorId(id) {
    const pedido = await prisma.pedidos.findUnique({
      where: { id: Number(id) },
      include: { cliente: true, itensPedidos: true }
    });
    if (pedido) {
      pedido.total = pedido.itensPedidos.reduce((acc, item) => acc + (parseFloat(item.precoUnitario) * item.quantidade), 0).toFixed(2);
    }
    return pedido;
  }
}

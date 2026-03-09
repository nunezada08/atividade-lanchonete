import PedidoModel from '../models/PedidosModel.js';

export const criar = async (req, res) => {
  try {
    const { clienteId } = req.body;
    if (!clienteId) return res.status(400).json({ error: 'Informe o clienteId' });

    const pedido = new PedidoModel({ clienteId });
    const data = await pedido.criar();

    res.status(201).json({ message: 'Pedido criado com sucesso', data });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const buscarTodos = async (req, res) => {
  try {
    const pedidos = await PedidoModel.buscarTodos();
    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar pedidos' });
  }
};

export const buscarPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const pedido = await PedidoModel.buscarPorId(id);
    if (!pedido) return res.status(404).json({ error: 'Pedido não encontrado' });
    res.json(pedido);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar pedido' });
  }
};

export const atualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, clienteId } = req.body;

    const pedido = await PedidoModel.buscarPorId(id);
    if (!pedido) return res.status(404).json({ error: 'Pedido não encontrado' });

    let updateData = {};
    if (clienteId) updateData.clienteId = Number(clienteId);
    if (status) {
      if (['PAGO', 'CANCELADO'].includes(status) && pedido.status !== 'ABERTO') {
        return res.status(400).json({ error: 'Só é possível alterar status PAGO ou CANCELADO se ABERTO' });
      }
      updateData.status = status;
    }

    const atualizado = await prisma.pedidos.update({ where: { id: Number(id) }, data: updateData });
    res.json({ message: 'Pedido atualizado com sucesso', data: atualizado });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deletar = async (req, res) => {
  try {
    const { id } = req.params;
    const pedido = await PedidoModel.buscarPorId(id);
    if (!pedido) return res.status(404).json({ error: 'Pedido não encontrado' });

    if (pedido.status !== 'ABERTO') return res.status(400).json({ error: 'Só é possível deletar pedido ABERTO' });

    await prisma.itemPedido.deleteMany({ where: { pedidoId: Number(id) } });
    await prisma.pedidos.delete({ where: { id: Number(id) } });

    res.json({ message: 'Pedido deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const cancelar = async (req, res) => {
  try {
    const { id } = req.params;
    const pedido = await PedidoModel.cancelar(Number(id));
    res.json({ message: 'Pedido cancelado com sucesso', data: pedido });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const pagar = async (req, res) => {
  try {
    const { id } = req.params;
    const pedido = await PedidoModel.pagar(Number(id));
    res.json({ message: 'Pedido pago com sucesso', data: pedido });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

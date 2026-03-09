import ItemPedidoModel from '../models/ItemPedidoModel.js';
import PedidoModel from '../models/PedidosModel.js';

export const criar = async (req, res) => {
    try {
        const { pedidoId, produtoId, quantidade } = req.body;

        if (!pedidoId || !produtoId || !quantidade) {
            return res.status(400).json({
                error: 'Os campos pedidoId, produtoId e quantidade são obrigatórios!',
            });
        }

        const pedido = await PedidoModel.buscarPorId(pedidoId);
        if (!pedido) return res.status(404).json({
            error: 'Pedido não encontrado.'
        });


        const item = new ItemPedidoModel({ pedidoId, produtoId, quantidade });

        const data = await item.criar();

        await PedidoModel.calcularTotal(pedidoId);

        res.status(201).json(data);
    } catch (error) {
        res.status(400).json({
            error: error.message,
        });
    }
};

export const buscarTodos = async (req, res) => {
    try {
        const registros = await ItemPedidoModel.buscarTodos(req.query);

        if (!registros || registros.length === 0) {
            return res.status(200).json({ message: 'Nenhum item encontrado.' });
        }

        res.status(200).json(registros);
    } catch (error) {
        console.error('Erro ao buscar:', error);
        res.status(500).json({ error: 'Erro ao buscar itens.' });
    }
};

export const buscarPorId = async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) {
            return res.status(400).json({
                error: 'O ID enviado não é um número válido.',
            });
        }

        const item = await ItemPedidoModel.buscarPorId(id);

        if (!item) {
            return res.status(404).json({
                error: 'ItemPedido não encontrado.',
            });
        }

        res.status(200).json(item);
    } catch (error) {
        console.error('Erro ao buscar:', error);
        res.status(500).json({
            error: 'Erro ao buscar item.',
        });
    }
};

export const atualizar = async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) {
            return res.status(400).json({
                error: 'ID inválido.',
            });
        }

        const existente = await ItemPedidoModel.buscarPorId(parseInt(id));
        if (!existente) {
            return res.status(404).json({ error: 'Item não encontrado.' });
        }

        const item = new ItemPedidoModel({
            id,
            quantidade:
                req.body.quantidade !== undefined ? req.body.quantidade : existente.quantidade,
            precoUnitario: existente.precoUnitario,
        });

        const data = await item.atualizar();
        await PedidoModel.calcularTotal(existente.pedidoId);

        res.status(200).json({
            message: 'Item atualizado com sucesso!',
            data,
        });
    } catch (error) {
        res.status(400).json({
            error: error.message,
        });
    }
};

export const deletar = async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) return res.status(400).json({ error: 'ID inválido.' });

        const item = await ItemPedidoModel.buscarPorId(parseInt(id));

        if (!item) {
            return res.status(404).json({ error: 'Item não encontrado para deletar.' });
        }

        const pedido = await PedidoModel.buscarPorId(item.pedidoId);
        if (pedido && (pedido.status === 'PAGO' || pedido.status === 'CANCELADO')) {
            return res
                .status(400)
                .json({ error: 'Não é possível remover itens de um pedido PAGO ou CANCELADO.' });
        }

        await item.deletar();
        await PedidoModel.calcularTotal(item.pedidoId);

        res.json({ message: `O item foi deletado com sucesso!`, deletado: item });
    } catch (error) {
        console.error('Erro ao deletar:', error);
        res.status(500).json({ error: 'Erro ao deletar item.' });
    }
};

import ItemPedidoModel from '../models/ItemPedidoModel.js';

export const criar = async (req, res) => {
    try {

        const { pedidoId, produtoId, quantidade } = req.body;

        if (!pedidoId || !produtoId || !quantidade) {
            return res.status(400).json({
                error: 'Os campos pedidoId, produtoId e quantidade são obrigatórios!'
            });
        }

        const item = new ItemPedidoModel({ pedidoId, produtoId, quantidade });
        const data = await item.criar();

        res.status(201).json(data);

    } catch (error) {
        res.status(400).json({
            error: error.message
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
                error: 'O ID enviado não é um número válido.'
            });
        }

        const item = await ItemPedidoModel.buscarPorId(id);

        if (!item) {
            return res.status(404).json({
                error: 'ItemPedido não encontrado.'
            });
        }

        res.status(200).json(item);

    } catch (error) {
        console.error('Erro ao buscar:', error);
        res.status(500).json({
            error: 'Erro ao buscar item.'
        });
    }
};

export const atualizar = async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) {
            return res.status(400).json({
                error: 'ID inválido.'
            });
        }

        const item = new ItemPedidoModel({
            id,
            quantidade: req.body.quantidade
        });

        const data = await item.atualizar();

        res.status(200).json({
            message: 'Item atualizado com sucesso!',
            data
        });

    } catch (error) {
        res.status(400).json({
            error: error.message
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

        await item.deletar();

        res.json({ message: `O item "${item.nome}" foi deletado com sucesso!`, deletado: item });
    } catch (error) {
        console.error('Erro ao deletar:', error);
        res.status(500).json({ error: 'Erro ao deletar item.' });
    }
};

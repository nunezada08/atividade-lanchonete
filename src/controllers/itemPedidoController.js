import ItemPedidoModel from '../models/ItemPedidoModel.js';

export const criar = async (req, res) => {
    try {
        if (!req.body) return res.status(400).json({ error: 'Corpo vazio!' });

        const { pedidoId, produtoId, quantidade, precoUnitario } = req.body;

        // 1. Validação amigável antes de enviar ao Prisma
        if (!pedidoId || !produtoId || !quantidade) {
            return res.status(400).json({
                error: 'Ops! Faltam informações obrigatórias (pedidoId, produtoId e quantidade).',
            });
        }

        if (quantidade <= 0) {
            return res.status(400).json({
                error: 'A quantidade deve ser maior que 0.',
            });
        }

        const itemPedido = new ItemPedidoModel({
            pedidoId: parseInt(pedidoId),
            produtoId: parseInt(produtoId),
            quantidade: parseInt(quantidade),
            precoUnitario: precoUnitario ? parseFloat(precoUnitario) : null,
        });

        const data = await itemPedido.criar();
        res.status(201).json({ message: 'Item do pedido criado com sucesso!', data });
    } catch (error) {
        console.error('Erro ao criar item do pedido:', error);

        // Tratando erros específicos
        if (error.message.includes('Produto não encontrado')) {
            return res.status(404).json({
                error: 'O produto especificado não existe em nossa base.',
            });
        }

        if (error.code === 'P2003') {
            return res.status(400).json({
                error: 'O pedido ou produto referenciado não existe.',
            });
        }

        res.status(500).json({
            error: 'Desculpe, ocorreu um erro interno ao salvar o item do pedido.',
        });
    }
};

export const buscarTodos = async (req, res) => {
    try {
        const registros = await ItemPedidoModel.buscarTodos(req.query);

        if (!registros || registros.length === 0) {
            return res.status(200).json({ message: 'Nenhum item de pedido encontrado.' });
        }

        res.json(registros);
    } catch (error) {
        console.error('Erro ao buscar:', error);
        res.status(500).json({ error: 'Erro ao buscar itens do pedido.' });
    }
};

export const buscarPorId = async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) {
            return res.status(400).json({ error: 'O ID enviado não é um número válido.' });
        }

        const itemPesquisado = await ItemPedidoModel.buscarPorId(parseInt(id));

        if (!itemPesquisado) {
            return res.status(404).json({ error: 'Item do pedido não encontrado.' });
        }

        res.json({ data: itemPesquisado });
    } catch (error) {
        console.error('Erro ao buscar:', error);
        res.status(500).json({ error: 'Erro ao buscar item do pedido.' });
    }
};

export const atualizar = async (req, res) => {
    try {
        const { id } = req.params;
        const idNumerico = parseInt(id);

        if (isNaN(idNumerico)) {
            return res.status(400).json({ error: 'ID inválido.' });
        }

        const itemPedido = await ItemPedidoModel.buscarPorId(idNumerico);

        if (!itemPedido) {
            return res.status(404).json({ error: 'Item do pedido não encontrado.' });
        }

        // Atualizamos as propriedades com os dados do body
        if (req.body.quantidade !== undefined) {
            if (req.body.quantidade <= 0) {
                return res.status(400).json({
                    error: 'A quantidade deve ser maior que 0.',
                });
            }
            itemPedido.quantidade = parseInt(req.body.quantidade);
        }

        if (req.body.precoUnitario !== undefined) {
            itemPedido.precoUnitario = parseFloat(req.body.precoUnitario);
        }

        const data = await itemPedido.atualizar();

        if (!data) {
            return res
                .status(500)
                .json({ error: 'O banco não retornou dados após a atualização.' });
        }

        res.json({
            message: 'O item do pedido foi atualizado com sucesso!',
            data,
        });
    } catch (error) {
        console.error('ERRO DETALHADO NO TERMINAL:', error);
        res.status(500).json({ error: 'Erro interno ao atualizar item do pedido.' });
    }
};

export const deletar = async (req, res) => {
    try {
        const { id } = req.params;
        const itemPedidoDeletar = await ItemPedidoModel.buscarPorId(parseInt(id));

        if (!itemPedidoDeletar) {
            return res.status(404).json({ error: 'Item do pedido não encontrado.' });
        }

        await itemPedidoDeletar.deletar();

        res.json({ message: 'Item do pedido deletado com sucesso!' });
    } catch (error) {
        console.error('Erro ao deletar:', error);
        res.status(400).json({ error: error.message });
    }
};

export const buscarPorPedido = async (req, res) => {
    try {
        const { pedidoId } = req.params;

        if (isNaN(pedidoId)) {
            return res
                .status(400)
                .json({ error: 'O ID do pedido enviado não é um número válido.' });
        }

        const itens = await ItemPedidoModel.buscarPorPedido(parseInt(pedidoId));

        if (!itens || itens.length === 0) {
            return res.status(200).json({ message: 'Nenhum item encontrado para este pedido.' });
        }

        res.json(itens);
    } catch (error) {
        console.error('Erro ao buscar itens do pedido:', error);
        res.status(500).json({ error: 'Erro ao buscar itens do pedido.' });
    }
};

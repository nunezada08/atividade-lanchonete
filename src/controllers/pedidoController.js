import PedidoModel from '../models/PedidoModel.js';

export const criar = async (req, res) => {
    try {
        if (!req.body) {
            return res.status(400).json({ error: 'Corpo da requisição vazio. Envie os dados!' });
        }

        const { nome, status, total } = req.body;

        if (!nome) return res.status(400).json({ error: 'O campo "nome" é obrigatório!' });
        if (total === undefined || total === null)
            return res.status(400).json({ error: 'O campo "total" é obrigatório!' });

        const pedido = new PedidoModel({ nome, status, total: parseFloat(total) });
        const data = await pedido.criar();

        res.status(201).json({ message: 'Registro criado com sucesso!', data });
    } catch (error) {
        console.error('Erro ao criar:', error);
        res.status(500).json({ error: 'Erro interno ao salvar o pedido.' });
    }
};

export const buscarTodos = async (req, res) => {
    try {
        const registros = await PedidoModel.buscarTodos(req.query);

        if (!registros || registros.length === 0) {
            return res.status(200).json({ message: 'Nenhum pedido encontrado.' });
        }

        res.json(registros);
    } catch (error) {
        console.error('Erro ao buscar:', error);
        res.status(500).json({ error: 'Erro ao buscar registros.' });
    }
};

export const buscarPorId = async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) {
            return res.status(400).json({ error: 'O ID enviado não é um número válido.' });
        }

        const pedido = await PedidoModel.buscarPorId(parseInt(id));

        if (!pedido) {
            return res.status(404).json({ error: 'Pedido não encontrado.' });
        }

        res.json({ data: pedido });
    } catch (error) {
        console.error('Erro ao buscar:', error);
        res.status(500).json({ error: 'Erro ao buscar pedido.' });
    }
};

export const buscarPorIdPedido = async (req, res) => {
    try {
        const { clienteId } = req.params;

        if (isNaN(clienteId)) {
            return res.status(400).json({ error: 'O ID enviado não é um número válido.' });
        }

        const pedido = await PedidoModel.buscarPorId(parseInt(clienteId));

        if (!pedido) {
            return res.status(404).json({ error: 'Pedido não encontrado.' });
        }

        res.json({ data: pedido });
    } catch (error) {
        console.error('Erro ao buscar:', error);
        res.status(500).json({ error: 'Erro ao buscar pedido.' });
    }
};

export const atualizar = async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) return res.status(400).json({ error: 'ID inválido.' });

        if (!req.body) {
            return res.status(400).json({ error: 'Corpo da requisição vazio. Envie os dados!' });
        }

        const pedido = await PedidoModel.buscarPorId(parseInt(id));

        if (!pedido) {
            return res.status(404).json({ error: 'Pedido não encontrado para atualizar.' });
        }

        if (req.body.nome !== undefined) pedido.nome = req.body.nome;
        if (req.body.status !== undefined) pedido.status = req.body.status;
        if (req.body.total !== undefined) pedido.total = parseFloat(req.body.total);

        const data = await pedido.atualizar();

        res.json({ message: `O pedido "${data.nome}" foi atualizado com sucesso!`, data });
    } catch (error) {
        console.error('Erro ao atualizar:', error);
        res.status(500).json({ error: 'Erro ao atualizar pedido.' });
    }
};

export const deletar = async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) return res.status(400).json({ error: 'ID inválido.' });

        const pedido = await PedidoModel.buscarPorId(parseInt(id));

        if (!pedido) {
            return res.status(404).json({ error: 'Registro não encontrado para deletar.' });
        }

        await pedido.deletar();

        res.json({
            message: `O pedido "${pedido.nome}" foi deletado com sucesso!`,
            deletado: pedido,
        });
    } catch (error) {
        console.error('Erro ao deletar:', error);
        res.status(500).json({ error: 'Erro ao deletar pedido.' });
    }
};

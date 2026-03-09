import PedidoModel from '../models/PedidosModel.js';
import ClienteModel from '../models/clienteModel.js';

export const criar = async (req, res) => {
    try {
        if (!req.body) {
            return res.status(400).json({ error: 'Corpo da requisição vazio. Envie os dados!' });
        }

        // accept either `cliente` or `clienteId` in the body for backwards compatibility
        const { cliente, clienteId } = req.body;
        const rawCliente = cliente ?? clienteId;
        const clienteNum = Number(rawCliente);

        if (!rawCliente || isNaN(clienteNum)) {
            return res.status(400).json({ error: 'ID de cliente inválido. Envie um número válido.' });
        }

        const clienteObj = await ClienteModel.buscarPorId(clienteNum);
        if (!clienteObj) return res.status(404).json({ error: 'Cliente não encontrado.' });
        if (clienteObj.ativo === false) return res.status(400).json({ error: 'Não é possível criar pedido para cliente inativo.' });

        const pedido = new PedidoModel({ clienteId });
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

        if (req.body.cliente !== undefined) pedido.clienteId = Number(req.body.cliente);

        if (req.body.status !== undefined) {
            PedidoModel.validarMudancaStatus(pedido, req.body.status);
            pedido.status = req.body.status;
        }

        const data = await pedido.atualizar();

        await PedidoModel.calcularTotal(pedido.id);

        res.json({ message: `O pedido "${pedido.id}" foi atualizado com sucesso!`, data });
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

        if (pedido.status !== 'ABERTO') {
            return res.status(400).json({ error: 'Só é possível deletar pedidos em aberto.' });
        }

        await pedido.deletar();

        res.json({
            message: `O pedido do cliente "${pedido.cliente ? pedido.cliente.nome : pedido.clienteId}" foi deletado com sucesso!`,
            deletado: pedido,
        });
    } catch (error) {
        console.error('Erro ao deletar:', error);
        res.status(500).json({ error: 'Erro ao deletar pedido.' });
    }
};


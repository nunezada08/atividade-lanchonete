import ProdutosModel from '../models/ProdutosModel.js';

export const criar = async (req, res) => {
    try {
        if (!req.body) {
            return res.status(400).json({ error: 'Corpo da requisição vazio. Envie os dados!' });
        }

        const { nome, descricao, categoria, preco, disponivel } = req.body;

        //Campos obrigatórios

        if (!nome) return res.status(400).json({
            status: 400,
            error: 'O campo "nome" é obrigatório!'
        });
        if (preco === undefined || preco === null) return res.status(400).json({
            status: 400,
            error: 'O campo "preco" é obrigatório!'
        });
        if (!descricao)
            return res.status(400).json({
                status: 400,
                error: 'O campo "descricao" é obrigatório',
            });
        if (!categoria) return res.status(400).json({
            status: 400,
            error: 'O campo "categoria" é obrigatório'
        })
        if (disponivel === null || disponivel === undefined) return res.status(400).json({
            status: 400,
            error: 'O campo "disponível" é obrigatório'
        }) 

        const produtos = new ProdutosModel({
            nome,
            descricao,
            categoria,
            preco: parseFloat(preco),
            disponivel
        });
        const data = await produtos.criar();

        res.status(201).json({ message: 'Registro criado com sucesso!', data });
    } catch (error) {
        console.error('Erro ao criar:', error);

        if (error.message) {
            return res.status(400).json({
                status: 400,
                error: "Erro de validação",
                message: error.message
            })
        }

        res.status(500).json({ error: 'Erro interno ao salvar o registro.' });
    }
};

export const buscarTodos = async (req, res) => {
    try {
        const registros = await ProdutosModel.buscarTodos(req.query);

        if (!registros || registros.length === 0) {
            return res.status(200).json({ message: 'Nenhum registro encontrado.' });
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

        const produtos = await ProdutosModel.buscarPorId(parseInt(id));

        if (!produtos) {
            return res.status(404).json({ error: 'Registro não encontrado.' });
        }

        res.json({ data: produtos });
    } catch (error) {
        console.error('Erro ao buscar:', error);
        res.status(500).json({ error: 'Erro ao buscar registro.' });
    }
};

export const atualizar = async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) return res.status(400).json({ error: 'ID inválido.' });

        if (!req.body) {
            return res.status(400).json({ error: 'Corpo da requisição vazio. Envie os dados!' });
        }

        const produtos = await ProdutosModel.buscarPorId(parseInt(id));

        if (!produtos) {
            return res.status(404).json({ error: 'Registro não encontrado para atualizar.' });
        }

        if (req.body.nome !== undefined) produtos.nome = req.body.nome;
        if (req.body.descricao !== undefined) produtos.descricao = req.body.descricao;
        if (req.body.categoria !== undefined) produtos.categoria = req.body.categoria;
        if (req.body.preco !== undefined) produtos.preco = parseFloat(req.body.preco);
        if (req.body.disponivel !== undefined) produtos.disponivel = req.body.disponivel

        const data = await produtos.atualizar();

        res.json({ message: `O registro "${data.nome}" foi atualizado com sucesso!`, data });
    } catch (error) {
        console.error('Erro ao atualizar:', error);

        if (error.message) {
            return res.status(400).json({
                status: 400,
                error: "Erro de validação",
                message: error.message
            })
        }

        res.status(500).json({ error: 'Erro ao atualizar registro.' });
    }
};

export const deletar = async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) return res.status(400).json({ error: 'ID inválido.' });

        const exemplo = await ExemploModel.buscarPorId(parseInt(id));

        if (!exemplo) {
            return res.status(404).json({ error: 'Registro não encontrado para deletar.' });
        }

        await exemplo.deletar();

        res.json({ message: `O registro "${exemplo.nome}" foi deletado com sucesso!`, deletado: exemplo });
    } catch (error) {
        console.error('Erro ao deletar:', error);
        res.status(500).json({ error: 'Erro ao deletar registro.' });
    }
};

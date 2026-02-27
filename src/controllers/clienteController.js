import ClienteModel from '../models/clienteModel.js';     

export const criar = async (req, res) => {
    try {
        if (!req.body) return res.status(400).json({ error: 'Corpo vazio!' });

        const { nome, telefone, email, cpf, cep, logradouro, bairro, localidade, uf } = req.body;

        // 1. Validação amigável antes de enviar ao Prisma
        if (!nome || !cpf || !telefone || !email || !logradouro) {
            return res.status(400).json({
                error: 'Ops! Faltam informações obrigatórias (Nome, CPF, Telefone, Email e Logradouro).',
            });
        }

        const cliente = new ClienteModel({
            nome,
            telefone,
            email,
            cpf,
            cep,
            logradouro,
            bairro,
            localidade,
            uf,
        });

        const data = await cliente.criar();
        res.status(201).json({ message: 'Cliente criado com sucesso!', data });
    } catch (error) {
        // 2. Tratando erros específicos do Prisma (P2002 = Único / P2012 = Obrigatório)
        if (error.code === 'P2002') {
            return res.status(400).json({
                error: 'Este CPF, Telefone ou Email já está cadastrado em nossa base.',
            });
        }

        if (error.message.includes('must not be null')) {
            return res.status(400).json({
                error: 'Erro de validação: Verifique se todos os campos obrigatórios foram preenchidos corretamente.',
            });
        }

        // Erro genérico para qualquer outra falha inesperada
        console.error('Erro interno:', error);
        res.status(500).json({ error: 'Desculpe, ocorreu um erro interno ao salvar o cliente.' });
    }
};

export const buscarTodos = async (req, res) => {
    try {
        const registros = await ClienteModel.buscarTodos(req.query);

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

        const clientePesquisado = await ClienteModel.buscarPorId(parseInt(id));

        if (!clientePesquisado) {
            return res.status(404).json({ error: 'Registro não encontrado.' });
        }

        res.json({ data: clientePesquisado });
    } catch (error) {
        console.error('Erro ao buscar:', error);
        res.status(500).json({ error: 'Erro ao buscar registro.' });
    }
};

export const atualizar = async (req, res) => {
    try {
        const { id } = req.params;
        const idNumerico = parseInt(id);

        if (isNaN(idNumerico)) {
            return res.status(400).json({ error: 'ID inválido.' });
        }

        // Buscamos o cliente e guardamos na variável 'cliente'
        const cliente = await ClienteModel.buscarPorId(idNumerico);

        if (!cliente) {
            return res.status(404).json({ error: 'Cliente não encontrado.' });
        }

        // Atualizamos as propriedades da instância 'cliente' com os dados do body
        if (req.body.nome !== undefined) cliente.nome = req.body.nome;
        if (req.body.telefone !== undefined) cliente.telefone = req.body.telefone;
        if (req.body.email !== undefined) cliente.email = req.body.email;
        if (req.body.cep !== undefined) cliente.cep = req.body.cep;
        if (req.body.ativo !== undefined) {
            cliente.ativo = req.body.ativo === true || req.body.ativo === 'true';
        }

        // Chamamos o método atualizar da instância 'cliente'
        const data = await cliente.atualizar();

        if (!data) {
            return res
                .status(500)
                .json({ error: 'O banco não retornou dados após a atualização.' });
        }

        res.json({
            message: `O registro "${data.nome}" foi atualizado com sucesso!`,
            data,
        });
    } catch (error) {
        console.error('ERRO DETALHADO NO TERMINAL:', error);
        res.status(500).json({ error: 'Erro interno ao atualizar registro.' });
    }
};

export const deletar = async (req, res) => {
    try {
        const { id } = req.params;
        const clienteDeletar = await ClienteModel.buscarPorId(id);
        if (!clienteDeletar) return res.status(404).json({ error: 'Registro não encontrado.' });

        await clienteDeletar.deletar();

        res.json({ message: `Registro "${clienteDeletar.nome}" deletado com sucesso!` });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

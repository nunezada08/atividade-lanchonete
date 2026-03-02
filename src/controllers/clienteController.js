import ClienteModel from '../models/clienteModel.js';

const buscarEnderecoNoViaCep = async (cep) => {
    // Mantemos apenas uma validação básica para não enviar lixo para a API
    if (!cep || cep.length < 8) return null;

    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        return data.erro ? null : data;
    } catch (error) {
        throw new Error('VIA_CEP_OFFLINE');
    }
};

export const criar = async (req, res) => {
    try {
        if (!req.body) return res.status(400).json({ error: 'Corpo vazio!' });

        const { nome, telefone, email, cpf, cep } = req.body;

        if (!nome || !cpf || !telefone || !email || !cep) {
            return res.status(400).json({
                error: 'Ops! Faltam informações obrigatórias (Nome, CPF, Telefone, Email e CEP).',
            });
        }

        let dadosEndereco;
        try {
            dadosEndereco = await buscarEnderecoNoViaCep(cep);
        } catch (err) {
            return res.status(400).json({ error: 'Serviço de CEP indisponível.' });
        }

        if (!dadosEndereco) {
            return res.status(400).json({ error: 'CEP inválido ou não encontrado.' });
        }

       //Montagem direta com os dados vindos da API (com pontuação se houver)
        const cliente = new ClienteModel({
            nome,
            telefone,
            email,
            cpf,
            cep: dadosEndereco.cep,
            logradouro: dadosEndereco.logradouro,
            bairro: dadosEndereco.bairro,
            localidade: dadosEndereco.localidade,
            uf: dadosEndereco.uf,
        });

        const data = await cliente.criar();
        res.status(201).json({ message: 'Cliente criado com sucesso!', data });

    } catch (error) {
        if (error.code === 'P2000') {
            console.error("ERRO: Um dos campos é grande demais para o banco de dados.");
            return res.status(400).json({
                error: 'Erro de tamanho: Verifique se o CPF ou CEP não excedem o limite do banco.'
            });
        }

        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Dados já cadastrados (CPF/Email/Tel).' });
        }

        console.error('Erro interno:', error);
        res.status(500).json({ error: 'Erro interno ao salvar o cliente.' });
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

        const cliente = await ClienteModel.buscarPorId(idNumerico);

        if (!cliente) {
            return res.status(404).json({ error: 'Cliente não encontrado.' });
        }

        if (req.body.cep && req.body.cep !== cliente.cep) {
            const dadosEndereco = await buscarEnderecoNoViaCep(req.body.cep);

            if (!dadosEndereco) {
                return res.status(400).json({ error: 'CEP inválido ou não encontrado.' });
            }

            // Atualiza os campos de endereço com o retorno direto da API
            cliente.cep = dadosEndereco.cep;
            cliente.logradouro = dadosEndereco.logradouro;
            cliente.bairro = dadosEndereco.bairro;
            cliente.localidade = dadosEndereco.localidade;
            cliente.uf = dadosEndereco.uf;
        }

        if (req.body.nome !== undefined) cliente.nome = req.body.nome;
        if (req.body.telefone !== undefined) cliente.telefone = req.body.telefone;
        if (req.body.email !== undefined) cliente.email = req.body.email;
        if (req.body.cpf !== undefined) cliente.cpf = req.body.cpf;

        if (req.body.ativo !== undefined) {
            cliente.ativo = req.body.ativo === true || req.body.ativo === 'true';
        }

        const data = await cliente.atualizar();

        res.json({
            message: `Registro "${data.nome}" atualizado com sucesso!`,
            data,
        });
    } catch (error) {
        if (error.code === 'P2000') {
            return res.status(400).json({
                error: 'Erro de tamanho: O dado retornado pela API ou enviado no CPF excede o limite do banco (@db.Char).',
            });
        }

        console.error('Erro ao atualizar:', error);
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

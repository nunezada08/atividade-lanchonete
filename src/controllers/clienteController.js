import ClienteModel from "../models/clienteModel.js";
import buscarEnderecoNoViaCep from '../utils/viaCep.js';

export const criar = async (req, res) => {
  try {
    if (!req.body) return res.status(400).json({ error: "Corpo vazio!" });

    const { nome, telefone, email, cpf, cep } = req.body;

    // 1. Campos Obrigatórios
    if (!nome || !cpf || !telefone || !email || !cep) {
      return res.status(400).json({
        error: "Ops! Faltam informações obrigatórias (Nome, CPF, Telefone, Email e CEP).",
      });
    }

    // 2. Regra: Nome (3 a 100 caracteres)
    if (nome.length < 3 || nome.length > 100) {
      return res.status(400).json({ error: "O nome deve ter entre 3 e 100 caracteres." });
    }

    // 3. Regra: E-mail (deve conter @ e .)
    if (!email.includes("@") || !email.includes(".")) {
      return res.status(400).json({ error: "E-mail inválido! Deve conter '@' e '.'" });
    }

    // 4. Regra: CPF (Exatamente 11 números)
    const cpfLimpo = cpf.split('').filter(char => char >= '0' && char <= '9').join('');
    if (cpfLimpo.length !== 11) {
      return res.status(400).json({ error: "O CPF deve ter exatamente 11 números." });
    }

    // 5. Regra: Telefone (10 ou 11 números)
    const telLimpo = telefone.split('').filter(char => char >= '0' && char <= '9').join('');
    if (telLimpo.length < 10 || telLimpo.length > 11) {
      return res.status(400).json({ error: "O telefone deve ter 10 ou 11 números." });
    }

    // Busca Endereço
    let dadosEndereco;
    try {
      dadosEndereco = await buscarEnderecoNoViaCep(cep);
    } catch (err) {
      return res.status(400).json({ error: "Serviço de CEP indisponível." });
    }

    if (!dadosEndereco) {
      return res.status(400).json({ error: "CEP inválido ou não encontrado." });
    }

    const cliente = new ClienteModel({
      nome,
      telefone: telLimpo,
      email,
      cpf: cpfLimpo,
      cep: dadosEndereco.cep,
      logradouro: dadosEndereco.logradouro,
      bairro: dadosEndereco.bairro,
      localidade: dadosEndereco.localidade,
      uf: dadosEndereco.uf,
    });

    const data = await cliente.criar();
    res.status(201).json({ message: "Cliente criado com sucesso!", data });

  } catch (error) {
    if (error.code === "P2002") {
      return res.status(400).json({ error: "Dados já cadastrados (CPF ou Email)." });
    }
    console.error("Erro interno:", error);
    res.status(500).json({ error: "Erro interno ao salvar." });
  }
};

export const buscarTodos = async (req, res) => {
  try {
    const registros = await ClienteModel.buscarTodos(req.query);
    if (!registros || registros.length === 0) {
      return res.status(200).json({ message: "Nenhum registro encontrado." });
    }
    res.json(registros);
  } catch (error) {
    console.error("Erro ao buscar:", error);
    res.status(500).json({ error: "Erro ao buscar registros." });
  }
};

export const buscarPorId = async (req, res) => {
  try {
    const { id } = req.params;
    if (isNaN(id)) {
      return res.status(400).json({ error: "O ID enviado não é um número válido." });
    }
    const clientePesquisado = await ClienteModel.buscarPorId(parseInt(id));
    if (!clientePesquisado) {
      return res.status(404).json({ error: "Registro não encontrado." });
    }
    res.json({ data: clientePesquisado });
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar registro." });
  }
};

export const atualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const cliente = await ClienteModel.buscarPorId(parseInt(id));

    if (!cliente) return res.status(404).json({ error: "Cliente não encontrado." });

    if (req.body.cep && req.body.cep !== cliente.cep) {
      const dadosEndereco = await buscarEnderecoNoViaCep(req.body.cep);
      if (!dadosEndereco) return res.status(400).json({ error: "CEP inválido." });
      
      cliente.cep = dadosEndereco.cep;
      cliente.logradouro = dadosEndereco.logradouro;
      cliente.bairro = dadosEndereco.bairro;
      cliente.localidade = dadosEndereco.localidade;
      cliente.uf = dadosEndereco.uf;
    }

    if (req.body.nome) cliente.nome = req.body.nome;
    if (req.body.email) cliente.email = req.body.email;
    if (req.body.ativo !== undefined) cliente.ativo = req.body.ativo === true || req.body.ativo === "true";

    const data = await cliente.atualizar();
    res.json({ message: "Atualizado com sucesso!", data });
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar." });
  }
};

export const buscarClimaPorCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const cliente = await ClienteModel.buscarPorId(id);
    if (!cliente) return res.status(404).json({ error: "Cliente não encontrado." });

    let climaInfo = null;
    try {
      // 1. ViaCEP para pegar a cidade
      const vRes = await fetch(`https://viacep.com.br/ws/${cliente.cep}/json/`);
      const vData = await vRes.json();
      
      // 2. Geocoding
      const gRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(vData.localidade)}&count=1&language=pt&countryCode=BR`);
      const gData = await gRes.json();

      if (gData.results) {
        const { latitude, longitude } = gData.results[0];
        // 3. Clima
        const wRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weathercode&timezone=America/Sao_Paulo`);
        const wData = await wRes.json();

        const temp = wData.current.temperature_2m;
        const code = wData.current.weathercode;

        let sug = "🌤 Clima agradável! Aproveite para divulgar combos da casa.";
        if (code >= 51) sug = "🌧 Dia chuvoso! Ofereça promoções para delivery.";
        else if (temp >= 28) sug = "🌞 Dia quente! Destaque combos com bebida gelada.";
        else if (temp <= 18) sug = "🥶 Dia frio! Destaque cafés e lanches quentes.";

        climaInfo = { temperatura: temp, chove: code >= 51, quente: temp >= 28, sugestao: sug };
      }
    } catch (e) { console.error("API Clima Offline"); }

    res.json({
      cliente: { id: cliente.id, nome: cliente.nome, cidade: cliente.localidade },
      clima: climaInfo
    });
  } catch (error) {
    res.status(500).json({ error: "Erro ao processar clima." });
  }
};

export const deletar = async (req, res) => {
  try {
    const { id } = req.params;
    const cliente = await ClienteModel.buscarPorId(id);
    if (!cliente) return res.status(404).json({ error: "Não encontrado." });
    await cliente.deletar();
    res.json({ message: "Deletado com sucesso!" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

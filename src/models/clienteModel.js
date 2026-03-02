import prisma from '../utils/prismaClient.js';

export default class ClienteModel {
    constructor({
        id = null,
        nome,
        telefone = null,
        email = null,
        cpf = null,
        cep = null,
        logradouro = null,
        bairro = null,
        localidade = null,
        uf = null,
        ativo = true,
    } = {}) {
        this.id = id;
        this.nome = nome;
        this.telefone = telefone;
        this.email = email;
        this.cpf = cpf;
        this.cep = cep;
        this.logradouro = logradouro;
        this.bairro = bairro;
        this.localidade = localidade;
        this.uf = uf;
        this.ativo = ativo;
    }

    async criar() {
        return prisma.cliente.create({
            data: {
                nome: this.nome,
                telefone: this.telefone,
                email: this.email,
                cpf: this.cpf,
                cep: this.cep,
                logradouro: this.logradouro,
                bairro: this.bairro,
                localidade: this.localidade,
                uf: this.uf,
                ativo: this.ativo,
            },
        });
    }

    // Regra de Negócio, pedido tem que estar fechado para deletar
    async deletar() {
        const pedidoAberto = await prisma.pedido.findFirst({
            where: {
                clienteId: this.id,
                status: 'ABERTO',
            },
        });

        if (pedidoAberto) {
            throw new Error('Não é possível deletar cliente com pedidos em aberto.');
        }

        return prisma.cliente.delete({ where: { id: this.id } });
    }

    static async buscarTodos(filtros = {}) {
        const where = {};

        // Regra: Filtro por nome (insensitive e contains)
        if (filtros.nome) {
            where.nome = { contains: filtros.nome, mode: 'insensitive' };
        }

        if (filtros.cpf) where.cpf = filtros.cpf;

        if (filtros.ativo !== undefined) {
            where.ativo = filtros.ativo === 'true';
        }

        return prisma.cliente.findMany({ where });
    }

    static async buscarPorId(id) {
        const data = await prisma.cliente.findUnique({ where: { id: Number(id) } });
        if (!data) return null;
        return new ClienteModel(data);
    }

    async atualizar() {
        try {
            return await prisma.cliente.update({
                where: { id: Number(this.id) },
                data: {
                    nome: this.nome,
                    telefone: this.telefone,
                    email: this.email,
                    cpf: this.cpf,
                    cep: this.cep,
                    logradouro: this.logradouro,
                    bairro: this.bairro,
                    localidade: this.localidade,
                    uf: this.uf,
                    ativo: this.ativo,
                },
            });
        } catch (error) {
            console.error('Erro no Prisma ao atualizar:', error);
            throw error;
        }
    }
}

import prisma from '../utils/prismaClient.js';

export default class ProdutosModel {
    constructor({
        id = null,
        nome = null,
        descricao = null,
        categoria = null,
        preco = null,
        disponivel = true,
    } = {}) {
        this.id = id;
        this.nome = nome;
        this.descricao = descricao;
        this.categoria = categoria;
        this.preco = preco;
        this.disponivel = disponivel;
    }

    async criar() {
        const registro = await prisma.produtos.create({
            data: {
                nome: this.nome,
                descricao: this.descricao,
                categoria: this.categoria,
                preco: this.preco,
                disponivel: this.disponivel,
            },
        });

        if (this.preco <= 0) {
            throw new Error('O preco deve ser maior que 0');
        }
        if ((this.disponivel = false)) {
            throw new Error('Produto só pode ser adicionado com disponivel = false');
        }

        this.id = registro.id;
        return registro;
    }

    async atualizar() {
        return prisma.exemplo.update({
            where: { id: this.id },
            data: { nome: this.nome, estatus: this.estatus, preco: this.preco },
        });
    }

    async deletar() {
        return prisma.exemplo.delete({ where: { id: this.id } });
    }

    static async buscarTodos(filtros = {}) {
        const { nome, categoria, disponivel, precoMin, precoMax } = filtros;
        const where = {};

        if (nome) where.nome = { contains: filtros.nome, mode: 'insensitive' };
        if (categoria) where.categoria = categoria;
        if (disponivel !== undefined) where.disponivel = filtros.disponivel === 'true';
        if (precoMin !== undefined) {
            where.preco = {
                gte: Number(precoMin),
            };
        }
        if (precoMax !== undefined) {
            where.preco = {
                lte: Number(precoMax),
            };
        }

        return prisma.produtos.findMany({ where });
    }

    static async buscarPorId(id) {
        const data = await prisma.produtos.findUnique({ where: { id } });
        if (!data) return null;
        return new ProdutosModel(data);
    }
}

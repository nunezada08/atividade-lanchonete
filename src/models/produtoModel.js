import prisma from '../utils/prismaClient.js';

export default class ProdutoModel {
    constructor({ id = null, nome, descricao, categoria, preco, disponivel = true } = {}) {
        this.id = id;
        this.nome = nome;
        this.descricao = descricao;
        this.categoria = categoria;
        this.preco = preco;
        this.disponivel = disponivel;
    }

    async criar() {
        const registo = await prisma.produto.create({
            data: {
                nome: this.nome,
                descricao: this.descricao,
                categoria: this.categoria,
                preco: this.preco,
                disponivel: this.disponivel
            },
        })
        this.id = registro.id;
        return registro
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
        if (filtros.nome) where.categoria = { contains: filtros.categoria, mode: 'insensitive' };
        if (filtros.disponivel !== undefined) where.disponivel = filtros.disponivel === 'true';



        return prisma.produto.findMany({ where });
    }

    static async buscarPorId(id) {
        const data = await prisma.produto.findUnique({ where: { id } });
        if (!data) return null;
        return new ProdutoModel(data);
    }
}

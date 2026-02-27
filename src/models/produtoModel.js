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
        const where = {};


        return prisma.produto.findMany({ where });
    }

    static async buscarPorId(id) {
        if (!this.id) throw new Error('ID não definido para busca');
        const registro = await prisma.produto.findUnique({
            where: { id: this.id }
        })
        if (!registro) return null;
        this.id = registro.id;
        thid.nome = registro.nome;
        this.descricao = registro.descricao;
        this.categoria = registro.categoria;
        this.preco = registro.preco;
        this.disponivel = registro.disponivel;
        return this;
    }
}
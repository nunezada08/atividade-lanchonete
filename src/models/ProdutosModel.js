import prisma from '../utils/prismaClient.js';

//Categorias válias
        const categoriasValidas = ["LANCHE", "BEBIDA", 'SOBREMESA', "COMBO"]

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

    validar() {
        //Regras de negócio

        if (this.nome.length < 3) {
            throw new Error('O nome deve ter no mínimo 3 caracteres')
        }
        if (this.descricao.length > 255) {
            throw new Error('A descrição deve ter no máximo 255 caracteres')
        }
        if (this.preco <= 0) {
            throw new Error('O preco deve ser maior que 0');
        }
        if (!Number.isInteger(this.preco * 100)) {
            throw new Error('O preco deve ser um número e ter no máximo duas casas decimais');
        }
        if (!categoriasValidas.includes(this.categoria)) {
             throw new Error(`Categoria inválida. Use uma das categorias válidas: ${categoriasValidas}`);
        }
    }

    async criar() {

        this.validar()

        const registro = await prisma.produtos.create({
            data: {
                nome: this.nome,
                descricao: this.descricao,
                categoria: this.categoria,
                preco: this.preco,
                disponivel: this.disponivel
            },
        });

        this.id = registro.id;
        return registro;
    }

    async atualizar() {

        this.validar()

        return prisma.produtos.update({
            where: { id: this.id },
            data: { 
                nome: this.nome,
                descricao: this.descricao,
                categoria: this.categoria,
                preco: this.preco,
                disponivel: this.disponivel
             },
        });
    }

    async deletar() {

        const item = await prisma.itemPedido.findFirst({
            where: {
                produtoId: this.id,
                pedido: {
                    status: "ABERTO"
                }
            }
        });

        if (item) {
            throw new Error("Não é possível deletar produto vinculado a pedido ABERTO")
        }

        return prisma.produtos.delete({ where: { id: this.id } });
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

import express from 'express';
import * as controller from '../controllers/itemPedidoController.js';

const router = express.Router();

router.post('/pedidos/:id/itens', controller.criar);
router.get('/pedidos/itens', controller.buscarTodos);
router.get('/pedidos/itens/:id', controller.buscarPorId);
router.put('/pedidos/itens/:id', controller.atualizar);
router.delete('/pedidos/:id/itens/:itemId', controller.deletar);

export default router;

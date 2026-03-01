import express from 'express';
import * as itemPedidoController from '../controllers/itemPedidoController.js';

const router = express.Router();

router.post('/', itemPedidoController.criar);
router.get('/', itemPedidoController.buscarTodos);
router.get('/:id', itemPedidoController.buscarPorId);
router.put('/:id', itemPedidoController.atualizar);
router.delete('/:id', itemPedidoController.deletar);

export default router;

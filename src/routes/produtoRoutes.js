import express from 'express';
import * as controller from '../controllers/produtoController.js';

const router = express.Router();

router.post('/produto', controller.criar);
router.get('/produto', controller.buscarTodos);
router.get('/produto/:id', controller.buscarPorId);
router.put('/produto/:id', controller.atualizar);
router.delete('/produto/:id', controller.deletar);

export default router;
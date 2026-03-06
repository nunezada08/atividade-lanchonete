import express from 'express';
import * as controller from '../controllers/clienteController.js';

const router = express.Router();

router.post('/cliente', controller.criar);
router.get('/cliente', controller.buscarTodos);
router.get('/cliente/:id', controller.buscarPorId);
router.put('/cliente/:id', controller.atualizar);
router.delete('/cliente/:id', controller.deletar);
router.get('/cliente/:id/clima', controller.buscarClimaPorCliente);

export default router;

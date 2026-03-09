import express from 'express';
import 'dotenv/config';
import produtosRoutes from './routes/produtosRoutes.js';
import clienteRoutes from './routes/clienteRoutes.js';
import pedidosRoutes from './routes/pedidosRoute.js';
import itemPedidoRoutes from './routes/itemPedidoRoute.js';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;

app.get('/', (req, res) => {
    res.send('🚀 API funcionando');
});

// Rotas
app.use('/', clienteRoutes);
app.use('/', produtosRoutes);
app.use('/', pedidosRoutes);
app.use('/', itemPedidoRoutes);

app.use((req, res) => {
    res.status(404).json({ error: 'Rota não encontrada' });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});

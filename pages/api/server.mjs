import express from 'express';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import 'dotenv/config';

const app = express();
const port = 3000;

app.use(express.json());

const client = new MercadoPagoConfig({
    accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
    options: {
        timeout: 3600,
    },
});

app.post('/api/create-payment.jsx', async (req, res) => {
    const body = {
        transaction_amount: 11.0,
        description: 'Pagamento',
        payment_method_id: 'pix',
        payer: {
            email: 'pagamento@gmail.com',
        },
    };

    try {
        const payment = new Payment(client);
        const response = await payment.create({ body });
        const ticketUrl = response.body.point_of_interaction.transaction_data.ticket_url;
        res.status(200).json({ ticketUrl });
    } catch (error) {
        console.error('Erro ao criar o pagamento:', error);
        res.status(500).json({ error: 'Erro ao criar o pagamento' });
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
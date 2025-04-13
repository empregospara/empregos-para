
require('dotenv').config();
const { MercadoPagoConfig, Payment } = require('mercadopago');

const client = new MercadoPagoConfig({
    accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
    options: {
        timeout: 3600,
    },
});

module.exports = async function handler(req, res) {
    if (req.method === 'POST') {
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

            return res.status(200).json({ ticketUrl });
        } catch (error) {
            console.error('Erro ao criar o pagamento:', error);
            return res.status(500).json({ error: 'Erro ao criar o pagamento' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
};
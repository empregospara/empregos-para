require('dotenv').config();
const { MercadoPagoConfig, Payment } = require('mercadopago');

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
  options: { timeout: 3600 },
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
      
      // Validação da estrutura da resposta antes de acessar o ticket_url
      const pointOfInteraction = response.body?.point_of_interaction;
      if (!pointOfInteraction || !pointOfInteraction.transaction_data) {
        console.error('Estrutura de resposta inesperada:', response.body);
        return res.status(500).json({ error: 'Estrutura de resposta inesperada' });
      }
      
      const ticketUrl = pointOfInteraction.transaction_data.ticket_url;
      if (!ticketUrl) {
        console.error('Ticket URL não encontrado na resposta:', response.body);
        return res.status(500).json({ error: 'Ticket URL não encontrado' });
      }
      
      return res.status(200).json({ ticketUrl });
    } catch (error) {
      console.error('Erro ao criar o pagamento:', error.response ? error.response.data : error.message);
      return res.status(500).json({ error: 'Erro ao criar o pagamento' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

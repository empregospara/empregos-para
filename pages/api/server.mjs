// pages/api/server.mjs
import express from 'express';
import cors from 'cors';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import 'dotenv/config';

const app = express();
const port = process.env.PORT || 3000;

// Se FRONTEND_URL estiver configurado, usamos para restringir a origem; caso contrário, liberamos tudo
const allowedOrigin = process.env.FRONTEND_URL || '*';

app.use(cors({
  origin: allowedOrigin,
}));

app.use(express.json());

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
  options: {
    timeout: 3600,
  },
});

// Rota para criar pagamento (sem extensão no endpoint)
app.post('/api/create-payment', async (req, res) => {
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
    
    // Verifica se a resposta contém os dados esperados
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
    
    res.status(200).json({ ticketUrl });
  } catch (error) {
    console.error('Erro ao criar o pagamento:', error);
    res.status(500).json({ error: 'Erro ao criar o pagamento' });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});

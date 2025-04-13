// db.ts
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config(); // Carregar variáveis de ambiente

// Criação do pool de conexões
const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Atribua o objeto a uma variável
const db = {
  connect: async () => {
    return await pool.connect(); // Retorna um cliente
  },
  query: (text: string, params?: any[]) => pool.query(text, params), // Função para realizar consultas
};

// Exporte a variável como default
export default db;

'use client'
import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Usuario {
  id: string;
  fullName: string;
  email: string;
  createdAt: string; // Campo que armazena a data de criação
}

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        // Faz a requisição GET para buscar os usuários na rota '/api/usuarios'
        const response = await axios.get('/api/usuarios');
        const data = response.data;

        if (Array.isArray(data)) {
          setUsuarios(data); // Atualiza o estado com a lista de usuários
        } else {
          setError('Os dados recebidos não são uma lista');
        }
      } catch (error) {
        setError('Erro ao buscar usuários');
      } finally {
        setLoading(false);
      }
    };

    fetchUsuarios();
  }, []);

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white shadow-lg rounded-lg p-4 w-full max-w-4xl">
        <h1 className="text-2xl font-bold text-primary mb-4 text-center">Lista de Usuários</h1>
        
        <div className="overflow-x-auto">
          <table className="table-fixed w-full bg-gray-100 rounded-lg">
            <thead>
              <tr className="text-center bg-primary text-white">
                <th className="px-4 py-2 w-1/3">Nome Completo</th>
                <th className="px-4 py-2 w-1/3">Email</th>
                <th className="px-4 py-2 w-1/3">Data e Hora</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.length > 0 ? (
                usuarios.map((usuario) => (
                  <tr key={usuario.id} className="text-center border-t">
                    <td className="px-4 py-2">{usuario.fullName}</td>
                    <td className="px-4 py-2">{usuario.email}</td>
                    <td className="px-4 py-2">
                      {new Date(usuario.createdAt).toLocaleString()} {/* Formata a data e hora */}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-4 py-2 text-center">
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Usuarios;

'use client';

import Head from 'next/head';
import WebSocketComponent from '../components/WebSocketComponent.';

const Home = () => {
  return (
    <div>
      <Head>
        <title>WebSocket com Next.js</title>
        <meta name="description" content="Exemplo de WebSocket em Next.js" />
      </Head>
      <main className="flex flex-col gap-10 bg-gray-100 p-6 md:p-10 text-primary">
      <section>
    <div className="mb-8 text-center items-center md:text-left space-y-4 md:space-y-6">
      <h2 className="text-primary font-bold text-xl md:text-2xl mb-4">
        Atenção:
      </h2>
      {/* Aplicando a classe justified-list */}
      <div className="flex flex-col space-y-2 justified-list">
      <p className="font-semibold text-sm md:text-base">
          <strong className="text-primary">Insira Nome e Email válidos</strong>
        </p>
        <p className="font-semibold text-sm md:text-base">
          <strong className="text-primary">Gerar QR Code PIX</strong>
        </p>
        <p className="font-semibold text-sm md:text-base">
          <strong className="text-primary">Efetuar o Pagamento</strong>
        </p>
        <p className="font-semibold text-sm md:text-base">
          <strong className="text-primary">Verificar o recebimento e confirmar</strong>
        </p>
        <p className="font-semibold text-sm md:text-base">
          <strong className="text-primary">Após o pagamento, você será redirecionado, e o botão <strong className='bg-primary rounded-md'>Baixar Curriculo</strong>{' '}
          estará ativo.</strong>
        </p>
      </div>
    </div>
  </section>

        <section className="flex justify-center mt-8 sm:mt-10">
          <div className="w-full max-w-md md:max-w-lg">
            <WebSocketComponent />
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
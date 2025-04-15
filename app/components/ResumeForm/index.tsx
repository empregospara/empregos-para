'use client';

import { cx } from "@/app/lib/cx";
import {
  useAppSelector,
  useSaveStateToLocalStorageOnChange,
  useSetInitialStore,
} from "@/app/lib/redux/hooks";
import { useState, useEffect } from "react";
import { ProfileForm } from "./ProfileForm";
import { ShowForm, selectFormsOrder } from "@/app/lib/redux/settingsSlice";
import { WorkExperiencesForm } from "./WorkExperiencesForm";
import { EducationsForm } from "./EducationsForm";
import { ProjectsForm } from "./ProjectsForm";
import { SkillsForm } from "./SkillsForm";
import { CustomForm } from "./CustomForm";
import { ThemeForm } from "./ThemeForm";
import { downloadCurriculoPDF } from "@/app/lib/downloadCurriculoPDF";

const formTypeToComponent: { [type in ShowForm]: () => JSX.Element } = {
  workExperiences: WorkExperiencesForm,
  educations: EducationsForm,
  projects: ProjectsForm,
  skills: SkillsForm,
  custom: CustomForm,
};

export const ResumeForm = () => {
  useSetInitialStore();
  useSaveStateToLocalStorageOnChange();

  const [isHover, setIsHover] = useState(false);
  const [paymentId, setPaymentId] = useState<string>("");
  const [paid, setPaid] = useState(false);
  const [timeoutExceeded, setTimeoutExceeded] = useState(false);
  const [showStatusScreen, setShowStatusScreen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const formsOrder = useAppSelector(selectFormsOrder);

  const loadMercadoPagoScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      console.log("📜 [MP Script] Iniciando carregamento do script do Mercado Pago");
      if (document.querySelector('script[src="https://sdk.mercadopago.com/js/v2"]')) {
        console.log("📜 [MP Script] Script já presente no DOM");
        // Aguarda até que MercadoPago esteja disponível
        const checkMercadoPago = setInterval(() => {
          if ((window as any).MercadoPago) {
            console.log("📜 [MP Script] MercadoPago disponível");
            clearInterval(checkMercadoPago);
            resolve();
          }
        }, 100);
        setTimeout(() => {
          if (!(window as any).MercadoPago) {
            console.warn("📜 [MP Script] Timeout: MercadoPago não carregado");
            clearInterval(checkMercadoPago);
            reject(new Error("MercadoPago não disponível após timeout"));
          }
        }, 5000);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://sdk.mercadopago.com/js/v2";
      script.async = true;
      script.onload = () => {
        console.log("📜 [MP Script] Script carregado com sucesso");
        resolve();
      };
      script.onerror = () => {
        console.error("📜 [MP Script] Erro ao carregar script do Mercado Pago");
        reject(new Error("Erro ao carregar script do Mercado Pago"));
      };
      document.body.appendChild(script);
    });
  };

  useEffect(() => {
    const initPaymentBrick = async () => {
      try {
        console.log("🚀 [Payment Brick] Iniciando inicialização");
        await loadMercadoPagoScript();
        console.log("✅ [Payment Brick] Script do Mercado Pago carregado");

        console.log("📡 [Payment Brick] Enviando requisição para criar preferência");
        const response = await fetch("https://api-mercadopago-nqye.onrender.com/criar-preferencia", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // Não envia amount, pois o valor é fixo no servidor
        });

        console.log("📡 [Payment Brick] Resposta recebida:", response.status, response.statusText);
        if (!response.ok) {
          throw new Error(`Erro ao buscar preferência: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log("📡 [Payment Brick] Dados recebidos:", data);
        const { preferenceId } = data;

        if (!preferenceId) {
          throw new Error("Nenhum preferenceId retornado pelo servidor");
        }
        console.log("✅ [Payment Brick] Preference ID:", preferenceId);

        const container = document.getElementById("payment-brick");
        if (!container) {
          throw new Error("Contêiner payment-brick não encontrado no DOM");
        }
        console.log("📍 [Payment Brick] Contêiner encontrado");
        container.innerHTML = "";

        console.log("🔧 [Payment Brick] Inicializando MercadoPago");
        const mp = new (window as any).MercadoPago("APP_USR-761098bf-af6c-4dd1-bb74-354ce46735f0");

        console.log("🛠️ [Payment Brick] Criando Payment Brick");
        mp.bricks().create("payment", "payment-brick", {
          initialization: {
            preferenceId,
          },
          customization: {
            paymentMethods: {
              types: ["pix"], // Apenas Pix visível
            },
          },
          callbacks: {
            onReady: () => console.log("💳 [Payment Brick] Carregado com sucesso"),
            onSubmit: async ({ formData }: any) => {
              console.log("📤 [Payment Brick] Formulário enviado:", formData);
              if (formData?.payment?.id) {
                console.log("✅ [Payment Brick] Payment ID:", formData.payment.id);
                setPaymentId(formData.payment.id);
                setShowStatusScreen(true);
                setTimeoutExceeded(false);
              } else {
                console.warn("⚠️ [Payment Brick] Payment ID não encontrado");
              }
            },
            onError: (error: any) => console.error("❌ [Payment Brick] Erro:", error),
          },
        });
        console.log("🛠️ [Payment Brick] Criação concluída, aguardando renderização");
      } catch (error: unknown) {
        console.error("❌ [Payment Brick] Erro ao iniciar:", error);
        const message = error instanceof Error ? error.message : "Erro desconhecido ao iniciar o pagamento";
        setErrorMessage(message);
      }
    };

    initPaymentBrick();
  }, []);

  useEffect(() => {
    if (!paymentId) return;
    console.log("🔄 [Payment Check] Iniciando verificação para ID:", paymentId);
    const interval = setInterval(async () => {
      try {
        const res = await fetch("https://api-mercadopago-nqye.onrender.com/check-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: paymentId }),
        });
        const data = await res.json();
        console.log("📊 [Payment Check] Status:", data);
        if (data.paid) {
          console.log("✅ [Payment Check] Pagamento confirmado");
          setPaid(true);
          clearInterval(interval);
        }
      } catch (error: unknown) {
        console.error("❌ [Payment Check] Erro ao verificar:", error);
      }
    }, 5000);

    const timeout = setTimeout(() => {
      console.log("⏰ [Payment Check] Timeout atingido");
      setTimeoutExceeded(true);
      clearInterval(interval);
    }, 10 * 60 * 1000);

    return () => {
      console.log("🧹 [Payment Check] Limpando intervalos");
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [paymentId]);

  useEffect(() => {
    if (!showStatusScreen || !paymentId) return;

    console.log("🚀 [Status Screen] Iniciando inicialização");
    const initStatusScreenBrick = async () => {
      try {
        await loadMercadoPagoScript();
        console.log("✅ [Status Screen] Script do Mercado Pago carregado");

        const container = document.getElementById("status-screen-brick");
        if (!container) {
          throw new Error("Contêiner status-screen-brick não encontrado no DOM");
        }
        console.log("📍 [Status Screen] Contêiner encontrado");
        container.innerHTML = "";

        console.log("🔧 [Status Screen] Inicializando MercadoPago");
        const mp = new (window as any).MercadoPago("APP_USR-761098bf-af6c-4dd1-bb74-354ce46735f0");

        console.log("🛠️ [Status Screen] Criando Status Screen Brick");
        mp.bricks().create("statusScreen", "status-screen-brick", {
          initialization: { paymentId },
          callbacks: {
            onReady: () => console.log("💳 [Status Screen] Carregado com sucesso"),
            onError: (error: any) => console.error("❌ [Status Screen] Erro:", error),
          },
        });
        console.log("🛠️ [Status Screen] Criação concluída");
      } catch (error: unknown) {
        console.error("❌ [Status Screen] Erro ao iniciar:", error);
        const message = error instanceof Error ? error.message : "Erro desconhecido ao iniciar o status screen";
        setErrorMessage(message);
      }
    };

    initStatusScreenBrick();
  }, [showStatusScreen, paymentId]);

  console.log("🔍 [Render] Estados: ", { paid, timeoutExceeded, errorMessage, showStatusScreen });

  return (
    <div
      className={cx(
        "flex justify-center scrollbar scrollbar-track-gray-100 scrollbar-w-3 md:h-[calc(100vh-var(--top-nav-bar-height))] md:justify-end md:overflow-y-scroll",
        isHover && "scrollbar-thumb-gray-200"
      )}
      onMouseOver={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      <section className="flex flex-col max-w-2xl gap-8 p-[var(--resume-padding)] mb-10">
        <ProfileForm />
        {formsOrder.map((form) => {
          const Component = formTypeToComponent[form];
          return <Component key={form} />;
        })}
        <ThemeForm />

        <div className="flex flex-col items-center gap-4 mt-8">
          {errorMessage && (
            <div className="text-red-600">{errorMessage}</div>
          )}

          {!paid && !timeoutExceeded && (
            <>
              <div id="payment-brick" className="w-full" />
              {showStatusScreen && <div id="status-screen-brick" className="w-full" />}
            </>
          )}

          {timeoutExceeded && (
            <div className="text-center text-red-600">
              Tempo expirado. Nenhum pagamento foi confirmado.<br />
              <button
                onClick={() => window.location.reload()}
                className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Gerar novo pagamento
              </button>
            </div>
          )}

          {paid && (
            <>
              <p className="text-green-600 font-semibold">✅ Pagamento confirmado!</p>
              <button
                onClick={downloadCurriculoPDF}
                className="bg-green-600 text-white font-bold px-5 py-3 rounded-lg hover:bg-green-700"
              >
                Baixar Currículo
              </button>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

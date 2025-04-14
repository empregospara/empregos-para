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

  const formsOrder = useAppSelector(selectFormsOrder);

  const loadMercadoPagoScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (document.querySelector('script[src="https://sdk.mercadopago.com/js/v2"]')) {
        resolve();
        return;
      }
      const script = document.createElement("script");
      script.src = "https://sdk.mercadopago.com/js/v2";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Erro ao carregar script do Mercado Pago"));
      document.body.appendChild(script);
    });
  };

  useEffect(() => {
    const initPaymentBrick = async () => {
      try {
        await loadMercadoPagoScript();
        const response = await fetch("https://api-mercadopago-nqye.onrender.com/criar-preferencia", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) throw new Error("Erro na requisição ao backend");
        const { preferenceId } = await response.json();

        const container = document.getElementById("payment-brick");
        if (container) container.innerHTML = "";

        const mp = new (window as any).MercadoPago("APP_USR-761098bf-af6c-4dd1-bb74-354ce46735f0");
        const bricksBuilder = mp.bricks();
        bricksBuilder.create("payment", "payment-brick", {
          initialization: {
            preferenceId,
          },
          callbacks: {
            onReady: () => console.log("💳 Payment Brick carregado"),
            onSubmit: async ({ formData }: any) => {
              if (formData?.payment?.id) {
                setPaymentId(formData.payment.id);
                setShowStatusScreen(true);
                setTimeoutExceeded(false);
              }
            },
            onError: (error: any) => console.error("❌ Erro no Payment Brick:", error),
          },
        });
      } catch (error) {
        console.error("Erro ao inicializar Payment Brick:", error);
      }
    };

    initPaymentBrick();
  }, []);

  useEffect(() => {
    if (!paymentId) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch("https://api-mercadopago-nqye.onrender.com/check-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: paymentId }),
        });
        const data = await res.json();
        if (data.paid) {
          setPaid(true);
          clearInterval(interval);
        }
      } catch (error) {
        console.error("Erro ao verificar pagamento:", error);
      }
    }, 5000);

    const timeout = setTimeout(() => {
      setTimeoutExceeded(true);
      clearInterval(interval);
    }, 10 * 60 * 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [paymentId]);

  useEffect(() => {
    if (!showStatusScreen || !paymentId) return;
    const initStatusScreenBrick = async () => {
      try {
        await loadMercadoPagoScript();
        const statusContainer = document.getElementById("status-screen-brick");
        if (statusContainer) statusContainer.innerHTML = "";
        const mp = new (window as any).MercadoPago("APP_USR-761098bf-af6c-4dd1-bb74-354ce46735f0");
        mp.bricks().create("statusScreen", "status-screen-brick", {
          initialization: { paymentId },
          callbacks: {
            onError: (error: any) => console.error("❌ Erro no Status Screen Brick:", error),
          },
        });
      } catch (error) {
        console.error("Erro ao inicializar Status Screen Brick:", error);
      }
    };

    initStatusScreenBrick();
  }, [showStatusScreen, paymentId]);

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

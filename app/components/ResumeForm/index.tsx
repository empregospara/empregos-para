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
  const [paymentId, setPaymentId] = useState("");
  const [paid, setPaid] = useState(false);
  const [timeoutExceeded, setTimeoutExceeded] = useState(false);
  const [showStatusScreen, setShowStatusScreen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const formsOrder = useAppSelector(selectFormsOrder);

  const MP_PUBLIC_KEY = "APP_USR-761098bf-af6c-4dd1-bb74-354ce46735f0"; // sua chave pública de PRODUÇÃO aqui
  const API_BASE_URL = "https://api-mercadopago-nqye.onrender.com"; // confirme que essa é URL correta de produção

  const loadMercadoPagoScript = (): Promise<void> => new Promise((resolve, reject) => {
    if (document.querySelector('script[src="https://sdk.mercadopago.com/js/v2.0"]')) return resolve();
    const script = document.createElement("script");
    script.src = "https://sdk.mercadopago.com/js/v2.0";
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });

  useEffect(() => {
    (async () => {
      try {
        await loadMercadoPagoScript();

        const response = await fetch(`${API_BASE_URL}/criar-preferencia`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          throw new Error(`Erro ao criar preferência: ${response.statusText}`);
        }

        const { preferenceId } = await response.json();
        if (!preferenceId) throw new Error("PreferenceId não recebido.");

        const mp = new (window as any).MercadoPago(MP_PUBLIC_KEY, { locale: "pt-BR" });

        const bricksBuilder = mp.bricks();
        await bricksBuilder.create("payment", "payment-brick", {
          initialization: {
            preferenceId,
            amount: 2.0, // valor fixo correspondente ao servidor
          },
          customization: {
            paymentMethods: { types: ["pix"] },
            visual: { style: { theme: "default" } },
          },
          callbacks: {
            onSubmit: ({ formData }: any) => {
              if (formData?.payment?.id) {
                setPaymentId(formData.payment.id);
                setShowStatusScreen(true);
              } else {
                throw new Error("ID do pagamento não foi recebido corretamente.");
              }
            },
            onError: (error: any) => {
              setErrorMessage(`Erro no pagamento: ${error}`);
            },
          },
        });
      } catch (error: any) {
        setErrorMessage(error.message);
      }
    })();
  }, []);

  useEffect(() => {
    if (!paymentId) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/check-payment`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: paymentId }),
        });

        const { paid } = await res.json();
        if (paid) {
          setPaid(true);
          clearInterval(interval);
        }
      } catch (error: any) {
        console.error("Erro ao verificar pagamento:", error.message);
      }
    }, 5000);

    const timeout = setTimeout(() => {
      setTimeoutExceeded(true);
      clearInterval(interval);
    }, 600000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [paymentId]);

  useEffect(() => {
    if (!showStatusScreen || !paymentId) return;
    (async () => {
      try {
        await loadMercadoPagoScript();
        const mp = new (window as any).MercadoPago(MP_PUBLIC_KEY, { locale: "pt-BR" });

        mp.bricks().create("statusScreen", "status-screen-brick", {
          initialization: { paymentId },
          callbacks: {
            onError: (error: any) => {
              setErrorMessage(`Erro no status screen: ${error}`);
            },
          },
        });
      } catch (error: any) {
        setErrorMessage(error.message);
      }
    })();
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
          {errorMessage && <div className="text-red-600">{errorMessage}</div>}

          {!paid && !timeoutExceeded && (
            <>
              <div id="payment-brick" className="w-full min-h-[300px]" />
              {showStatusScreen && <div id="status-screen-brick" className="w-full" />}
            </>
          )}

          {timeoutExceeded && (
            <div className="text-red-600 text-center">
              Tempo expirado. Nenhum pagamento foi confirmado.
              <button onClick={() => window.location.reload()} className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                Gerar novo pagamento
              </button>
            </div>
          )}

          {paid && (
            <>
              <p className="text-green-600 font-semibold">✅ Pagamento confirmado!</p>
              <button onClick={downloadCurriculoPDF} className="bg-green-600 text-white font-bold px-5 py-3 rounded-lg hover:bg-green-700">
                Baixar Currículo
              </button>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

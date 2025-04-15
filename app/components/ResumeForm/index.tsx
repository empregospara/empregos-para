'use client';

import { useState, useEffect } from "react";
import { cx } from "@/app/lib/cx";
import { useAppSelector, useSaveStateToLocalStorageOnChange, useSetInitialStore } from "@/app/lib/redux/hooks";
import { selectFormsOrder, ShowForm } from "@/app/lib/redux/settingsSlice";
import { ProfileForm } from "./ProfileForm";
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

  const formsOrder = useAppSelector(selectFormsOrder);
  const [paymentId, setPaymentId] = useState("");
  const [paid, setPaid] = useState(false);
  const [timeoutExceeded, setTimeoutExceeded] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const MP_PUBLIC_KEY = "APP_USR-761098bf-af6c-4dd1-bb74-354ce46735f0";
  const API_BASE_URL = "https://api-mercadopago-nqye.onrender.com";

  const loadScript = () => {
    return new Promise<void>((resolve, reject) => {
      if (document.querySelector('script[src="https://sdk.mercadopago.com/js/v2"]')) {
        resolve();
        return;
      }
      const script = document.createElement("script");
      script.src = "https://sdk.mercadopago.com/js/v2";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject("Erro ao carregar MercadoPago JS SDK");
      document.body.appendChild(script);
    });
  };

  useEffect(() => {
    (async () => {
      try {
        await loadScript();

        const response = await fetch(`${API_BASE_URL}/criar-preferencia`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        const data = await response.json();
        if (!data.preferenceId) throw new Error("preferenceId ausente");

        const mp = new (window as any).MercadoPago(MP_PUBLIC_KEY, { locale: "pt-BR" });
        const bricksBuilder = mp.bricks();

        await bricksBuilder.create("payment", "paymentBrick_container", {
          initialization: {
            preferenceId: data.preferenceId,
            amount: 2.0,
          },
          customization: {
            paymentMethods: {
              types: ["pix"],
            },
            visual: { style: { theme: "bootstrap" } },
          },
          callbacks: {
            onReady: () => console.log("✅ Brick pronto"),
            onSubmit: ({ formData }: any) => {
              if (formData?.payment?.id) {
                setPaymentId(formData.payment.id);
              }
              return Promise.resolve();
            },
            onError: (error: any) => {
              console.error("Erro no brick:", error);
              setErrorMessage("Erro no pagamento. Tente novamente.");
            },
          },
        });
      } catch (err: any) {
        setErrorMessage(err.message || "Erro inesperado");
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
      } catch (err) {
        console.error("Erro ao verificar status:", err);
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

  return (
    <div className={cx("flex justify-center scrollbar scrollbar-track-gray-100 scrollbar-w-3 md:h-[calc(100vh-var(--top-nav-bar-height))] md:justify-end md:overflow-y-scroll")}>
      <section className="flex flex-col max-w-2xl gap-8 p-[var(--resume-padding)] mb-10">
        <ProfileForm />
        {formsOrder.map((form) => {
          const Component = formTypeToComponent[form];
          return <Component key={form} />;
        })}
        <ThemeForm />
        <div className="flex flex-col items-center gap-4 mt-8">
          {errorMessage && <div className="text-red-600">{errorMessage}</div>}
          {!paid && !timeoutExceeded && <div id="paymentBrick_container" className="w-full min-h-[300px]" />}
          {timeoutExceeded && (
            <div className="text-red-600 text-center">
              Tempo expirado. Nenhum pagamento foi confirmado.
              <button onClick={() => window.location.reload()} className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Gerar novo pagamento</button>
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

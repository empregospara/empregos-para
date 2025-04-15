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

        // Definir o valor do pagamento (exemplo: 100 centavos = R$1,00)
        const amount = 100; // Ajuste este valor conforme necessário

        if (amount <= 0) {
          throw new Error("O valor do pagamento deve ser maior que zero.");
        }

        const response = await fetch("https://api-mercadopago-nqye.onrender.com/criar-preferencia", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount }), // Enviar o valor no corpo da requisição
        });

        if (!response.ok) throw new Error("Erro ao buscar preferência");
        const { preferenceId } = await response.json();

        const container = document.getElementById("payment-brick");
        if (container) container.innerHTML = "";

        const mp = new (window as any).MercadoPago("APP_USR-761098bf-af6c-4dd1-bb74-354ce46735f0");
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
        console.error("Erro ao iniciar brick:", error);
        setErrorMessage(error.message || "Erro ao iniciar o pagamento.");
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
        const container = document.getElementById("status-screen-brick");
        if (container) container.innerHTML = "";

        const mp = new (window as any).MercadoPago("APP_USR-761098bf-af6c-4dd1-bb74-354ce46735f0");
        mp.bricks().create("statusScreen", "status-screen-br

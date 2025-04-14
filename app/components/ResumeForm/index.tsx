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

declare global {
  interface Window {
    MercadoPago: any;
  }
}

export const ResumeForm = () => {
  useSetInitialStore();
  useSaveStateToLocalStorageOnChange();

  const [isHover, setIsHover] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [pixCode, setPixCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [txid, setTxid] = useState("");
  const [pago, setPago] = useState(false);

  const formsOrder = useAppSelector(selectFormsOrder);

  useEffect(() => {
    if (!txid) return;
    const interval = setInterval(async () => {
      const res = await fetch("https://api-gerencianet.onrender.com/check-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ txid }),
      });
      const data = await res.json();
      if (data.paid) {
        setPago(true);
        clearInterval(interval);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [txid]);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://sdk.mercadopago.com/js/v2";
    script.async = true;
    script.onload = async () => {
      const mp = new window.MercadoPago("APP_USR-761098bf-af6c-4dd1-bb74-354ce46735f0");
      const pref = await fetch("https://api-mercadopago-nqye.onrender.com/criar-preferencia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const { preferenceId } = await pref.json();

      mp.bricks().create("payment", "payment-brick-container", {
        initialization: {
          amount: 0.01,
          preferenceId,
        },
        customization: {
          paymentMethods: {
            ticket: "all",
            bankTransfer: "all",
            pix: "all",
          },
        },
        callbacks: {
          onReady: () => console.log("💳 Payment Brick carregado"),
          onSubmit: async ({
            selectedPaymentMethod,
            formData,
          }: {
            selectedPaymentMethod: string;
            formData: Record<string, any>;
          }) => {
            console.log("🔁 Pagamento submetido:", selectedPaymentMethod, formData);
          },
          onError: (error: any) => console.error("❌ Erro no Payment Brick:", error),
        },
      });
    };
    document.body.appendChild(script);
  }, []);

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
          <button
            onClick={async () => {
              setCopied(false);
              setPago(false);
              setQrCode("");
              setPixCode("");
              const res = await fetch("https://api-gerencianet.onrender.com/pagar");
              const data = await res.json();
              setQrCode(data.qrCodeBase64);
              setPixCode(data.pixString);
              setTxid(data.txid);
            }}
            className="bg-gradient-to-r from-pink-500 to-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90"
          >
            Gerar PIX
          </button>

          {qrCode && (
            <div className="text-center">
              <img src={qrCode} alt="QR Code PIX" className="mx-auto max-w-[260px]" />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(pixCode);
                  setCopied(true);
                }}
                className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Copiar código Pix Copia e Cola
              </button>
              {copied && (
                <p className="text-green-600 mt-1">Código copiado com sucesso!</p>
              )}
            </div>
          )}

          {pago && (
            <button
              onClick={downloadCurriculoPDF}
              className="bg-green-600 text-white font-bold px-5 py-3 mt-4 rounded-lg hover:bg-green-700"
            >
              Baixar Currículo
            </button>
          )}

          <div id="payment-brick-container" className="w-full mt-6" />
        </div>
      </section>
    </div>
  );
};

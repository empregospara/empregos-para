'use client'

import { cx } from "@/app/lib/cx";
import {
  useAppSelector,
  useSaveStateToLocalStorageOnChange,
  useSetInitialStore,
} from "@/app/lib/redux/hooks";
import { useState } from "react";
import { ProfileForm } from "./ProfileForm";
import { ShowForm, selectFormsOrder } from "@/app/lib/redux/settingsSlice";
import { WorkExperiencesForm } from "./WorkExperiencesForm";
import { EducationsForm } from "./EducationsForm";
import { ProjectsForm } from "./ProjectsForm";
import { SkillsForm } from "./SkillsForm";
import { CustomForm } from "./CustomForm";
import { ThemeForm } from "./ThemeForm";

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
  const [qrCodeBase64, setQrCodeBase64] = useState("");
  const [pixString, setPixString] = useState("");
  const [txid, setTxid] = useState(""); // Para verificar o pagamento
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);

  const formsOrder = useAppSelector(selectFormsOrder);

  const handleGeneratePix = async () => {
    try {
      setCopied(false);
      setError("");
      const res = await fetch("https://api-gerencianet.onrender.com/pagar");
      const data = await res.json();
      setQrCodeBase64(data.qrCodeBase64);
      setPixString(data.pixString);
      setTxid(data.txid); // Armazena o txid para verificação
    } catch (err) {
      setError("Não foi possível gerar o PIX. Tente novamente.");
      setQrCodeBase64("");
      setPixString("");
      setTxid("");
    }
  };

  const handleCheckPayment = async () => {
    try {
      const res = await fetch("https://api-gerencianet.onrender.com/check-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ txid }),
      });
      const data = await res.json();
      if (data.paid) {
        setPaymentConfirmed(true);
      } else {
        setError("Pagamento ainda não confirmado. Tente novamente.");
      }
    } catch (err) {
      setError("Erro ao verificar pagamento. Tente novamente.");
    }
  };

  const handleDownload = () => {
    // Ajuste o caminho do PDF conforme sua lógica
    window.location.href = "/curriculo.pdf";
  };

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

        {/* Novo botão de gerar PIX + QR Code */}
        <div className="flex flex-col items-center gap-4 mt-8 mb-10">
          <button
            onClick={handleGeneratePix}
            className="bg-gradient-to-r from-pink-500 to-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90"
          >
            Gerar PIX
          </button>

          {error && <p className="text-red-600 font-bold">{error}</p>}

          {qrCodeBase64 && (
            <div className="text-center">
              <img src={qrCodeBase64} alt="QR Code PIX" className="mx-auto mb-4" />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(pixString);
                  setCopied(true);
                }}
                className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Copiar código Pix Copia e Cola
              </button>
              {copied && <p className="text-green-600 mt-1">Código copiado com sucesso!</p>}
              <button
                onClick={handleCheckPayment}
                className="mt-4 bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
              >
                Verificar Pagamento
              </button>
            </div>
          )}

          {paymentConfirmed && (
            <button
              onClick={handleDownload}
              className="mt-4 bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
            >
              Download Currículo
            </button>
          )}
        </div>
      </section>
    </div>
  );
};

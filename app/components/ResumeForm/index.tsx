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
  const [qrCode, setQrCode] = useState("");
  const [copied, setCopied] = useState(false);

  const formsOrder = useAppSelector(selectFormsOrder);

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
        <div className="flex flex-col items-center gap-4 mt-8">
          <button
            onClick={async () => {
              try {
                const res = await fetch("https://api-gerencianet.onrender.com/pagar");
                const data = await res.json();
                navigator.clipboard.writeText(data.qr_code);
                setQrCode(data.imagem_base64);
                setCopied(true);
              } catch (err) {
                console.error("Erro ao gerar PIX", err);
              }
            }}
            className="bg-gradient-to-r from-pink-500 to-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90"
          >
            Gerar PIX
          </button>

          {qrCode && (
            <div className="text-center">
              <img src={qrCode} alt="QR Code PIX" className="mx-auto" />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(qrCode);
                  setCopied(true);
                }}
                className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Copiar código Pix Copia e Cola
              </button>
              {copied && <p className="text-green-600 mt-1">Código copiado com sucesso!</p>}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

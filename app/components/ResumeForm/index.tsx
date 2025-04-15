'use client';

import { useState, useEffect } from "react";
import { cx } from "@/app/lib/cx";
import {
  useAppSelector,
  useSaveStateToLocalStorageOnChange,
  useSetInitialStore,
} from "@/app/lib/redux/hooks";
import { selectFormsOrder, ShowForm } from "@/app/lib/redux/settingsSlice";

import { ProfileForm } from "@/app/components/ResumeForm/ProfileForm";
import { WorkExperiencesForm } from "@/app/components/ResumeForm/WorkExperiencesForm";
import { EducationsForm } from "@/app/components/ResumeForm/EducationsForm";
import { ProjectsForm } from "@/app/components/ResumeForm/ProjectsForm";
import { SkillsForm } from "@/app/components/ResumeForm/SkillsForm";
import { CustomForm } from "@/app/components/ResumeForm/CustomForm";
import { ThemeForm } from "@/app/components/ResumeForm/ThemeForm";

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
  // Removemos variáveis relacionadas a pagamentos, pois iremos reintegrar do zero.
  // const [paymentId, setPaymentId] = useState("");
  // const [paid, setPaid] = useState(false);
  // const [timeoutExceeded, setTimeoutExceeded] = useState(false);
  // const [errorMessage, setErrorMessage] = useState<string | null>(null);

  return (
    <div
      className={cx(
        "flex justify-center scrollbar scrollbar-track-gray-100 scrollbar-w-3 md:h-[calc(100vh-var(--top-nav-bar-height))] md:justify-end md:overflow-y-scroll"
      )}
    >
      <section className="flex flex-col max-w-2xl gap-8 p-[var(--resume-padding)] mb-10">
        <ProfileForm />
        {formsOrder.map((form) => {
          const Component = formTypeToComponent[form];
          return <Component key={form} />;
        })}
        <ThemeForm />
        {/* Removemos o container do Brick, que não será mais utilizado. */}
        <div className="flex flex-col items-center gap-4 mt-8">
          <p className="text-gray-600">Pagamento não configurado.</p>
          <button
            onClick={downloadCurriculoPDF}
            className="bg-green-600 text-white font-bold px-5 py-3 rounded-lg hover:bg-green-700"
          >
            Baixar Currículo
          </button>
        </div>
      </section>
    </div>
  );
};

export default ResumeForm;

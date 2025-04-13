"use client";

import { pdf } from "@react-pdf/renderer";
import CurriculoPDF from "@/app/components/PDF/CurriculoPDF";
import { saveAs } from "file-saver";
import { store } from "@/app/lib/redux/store";

export async function downloadCurriculoPDF() {
  const state = store.getState();
  const profile = state.resume.profile;
  const experiences = state.resume.workExperiences;
  const skills = state.resume.skills;

  // Agora só usamos profile.name (em vez de profile.firstName / profile.lastName):
  const blob = await pdf(
    <CurriculoPDF
      fullName={profile.name}
      email={profile.email}
      experiences={experiences.map((exp) => ({
        title: exp.jobTitle,
        company: exp.company,
        period: exp.date,
      }))}
      skills={skills.featuredSkills.map((fs) => fs.skill)}
    />
  ).toBlob();

  saveAs(blob, "curriculo.pdf");
}

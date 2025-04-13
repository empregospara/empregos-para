"use client";

import { pdf } from "@react-pdf/renderer";
import CurriculoPDF from "@/app/components/PDF/CurriculoPDF";
import { saveAs } from "file-saver";
import { store } from "@/app/lib/redux/store";

export async function downloadCurriculoPDF() {
  const state = store.getState();
  const profile = state.profile;
  const experiences = state.workExperiences.items;
  const skills = state.skills.items;

  const blob = await pdf(
    <CurriculoPDF
      fullName={profile.fullName}
      email={profile.email}
      experiences={experiences.map((exp) => ({
        title: exp.title,
        company: exp.company,
        period: exp.date,
      }))}
      skills={skills.map((s) => s.name)}
    />
  ).toBlob();

  saveAs(blob, "curriculo.pdf");
}

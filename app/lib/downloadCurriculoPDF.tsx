"use client";

import { saveAs } from "file-saver";

export async function downloadCurriculoPDF() {
  try {
    // Substitua a URL abaixo pela URL do seu backend (por exemplo, a do Render)
    const backendUrl = "https://api-mercadopago-nqye.onrender.com";

    const response = await fetch(`${backendUrl}/gerar-pdf`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Falha ao gerar o PDF");
    }

    const blob = await response.blob();
    saveAs(blob, "curriculo.pdf");
  } catch (error) {
    console.error("Erro no download do PDF:", error);
  }
}

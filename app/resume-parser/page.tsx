"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { TextItems } from "../lib/parse-resume-from-pdf/types";
import { groupTextItemsIntoLines } from "../lib/parse-resume-from-pdf/group-text-items-into-lines";
import { groupLinesIntoSections } from "../lib/parse-resume-from-pdf/group-lines-into-sections";
import { extractResumeFromSections } from "../lib/parse-resume-from-pdf/extract-resume-from-sections";
import { FlexboxSpacer } from "../components/FlexboxSpacer";
import { Heading } from "../components/documentation/Heading";
import { Paragraph } from "../components/documentation/Paragraph";
import { cx } from "../lib/cx";
import ResumeDropzone from "../components/ResumeDropzone";
import { ResumeTable } from "./ResumeTable";
import { readPdf } from "../lib/parse-resume-from-pdf/read-pdf";

const RESUME_EXAMPLES = [
  {
    fileUrl: "resume-example/public-resume.pdf",
    description: <span>Um modelo mais simples</span>,
  },
  {
    fileUrl: "resume-example/inhouse-resume.pdf",
    description: (
      <span className="text-primary">
        Um modelo mais robusto, com um design  mais bonito - {" "}
        <Link href="/resume-builder">Acessar</Link>
      </span>
    ),
  },
];

const defaultFileUrl = RESUME_EXAMPLES[1]["fileUrl"];

export default function ResumeParser() {
  const [fileUrl, setFileUrl] = useState(defaultFileUrl);

  const [textItems, setTextItems] = useState<TextItems>([]);
  const lines = groupTextItemsIntoLines(textItems || []);
  const sections = groupLinesIntoSections(lines);
  const resume = extractResumeFromSections(sections);

  useEffect(() => {
    async function parse() {
      const textItems = await readPdf(fileUrl);
      setTextItems(textItems);
    }
    parse();
  }, [fileUrl]);

  return (
    <main className="h-full w-full overflow-hidden">
      <div className="grid md:grid-cols-6">
        <div className="flex justify-center px-2 md:col-span-3 md-h-[calc(100vh-var(--top-nav-bar-height))] md:justify-end">
          <section className="mt-5 grow px-4 md:max-w-[600px] md:px-0">
            <div className="aspect-h-[9.5] aspect-w-7">
              <iframe src={`${fileUrl}#navpanes=0`} className="h-full w-full" />
            </div>
          </section>
          <FlexboxSpacer maxWidth={45} className="hidden md:block" />
        </div>
        <div className="flex px-6 text-gray-900 md:col-span-3 md-h-[calc(100vh-var(--top-nav-bar-height))] md:overflow-y-scroll">
          <FlexboxSpacer maxWidth={45} className="hidden md:block" />
          <section className="max-w-[600px] grow">
            <Heading className="text-primary !mt-4">
              Currículo Parser
            </Heading>
            <Paragraph smallMarginTop={true}>
            Este Parser apresenta o analisador de currículo interno e sua
              capacidade de analisar informações de um PDF de currículo. Clique ao redor do
              Exemplos de PDF abaixo para observar diferentes resultados de análise.
            </Paragraph>
            <div className="mt-3 flex gap-3">
              {RESUME_EXAMPLES.map((example, idx) => (
                <article
                  key={idx}
                  className={cx(
                    "flex-1 cursor-pointer rounded-md border-2 px-4 py-3 shadow-sm outline-none hover:bg-gray-50 focus:bg-gray-50",
                    example.fileUrl === fileUrl
                      ? "border-blue-400"
                      : "border-gray-300"
                  )}
                  onClick={() => setFileUrl(example.fileUrl)}
                  onKeyDown={(e) => {
                    if (["Enter", " "].includes(e.key))
                      setFileUrl(example.fileUrl);
                  }}
                  tabIndex={0}
                >
                  <h1 className="font-semibold">Exemplo {idx + 1}</h1>
                  <p className="mt-2 text-sm text-gray-500">
                    {example.description}
                  </p>
                </article>
              ))}
            </div>
            <Paragraph>
              Você também pode{" "}
              <span className="font-semibold">adicionar seu currículo abaixo</span> para 
              ver o quão eficiente é o nosso Parser, assegurando informações precisas e de alta qualidade.
            </Paragraph>
            <div className="mt-3">
              <ResumeDropzone
                onFileUrlChange={(fileUrl) =>
                  setFileUrl(fileUrl || defaultFileUrl)
                }
                playgroundView={true}
              />
            </div>
            <Heading level={2} className="!mt-[1.2em]">
              Resultados do Parser
            </Heading>
            <ResumeTable resume={resume} />
          </section>
        </div>
      </div>
    </main>
  );
}

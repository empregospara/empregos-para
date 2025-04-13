// app/components/ResumeForm/ProfileForm.tsx

import React from "react";
import { useAppDispatch, useAppSelector } from "@/app/lib/redux/hooks";
import { changeProfile, selectProfile } from "@/app/lib/redux/resumeSlice";
import { BaseForm } from "./Form";
import { Input } from "./Form/InputGroup";

// Se quiser deixar tudo em UM arquivo, pode declarar o tipo aqui mesmo.
// Caso já tenha em outro lugar, basta remover daqui:
interface ResumeProfile {
  name: string;
  summary: string;
  email: string;
  phone: string;
  url: string;
  location: string;
}

export const ProfileForm = () => {
  const dispatch = useAppDispatch();
  const profile = useAppSelector(selectProfile);

  // Desestruturamos as props do perfil vindas do Redux:
  const { name, summary, email, phone, url, location } = profile;

  // Função para atualizar qualquer campo do perfil:
  const handleProfileChange = (field: keyof ResumeProfile, value: string) => {
    dispatch(changeProfile({ field, value }));
  };

  return (
    <BaseForm>
      <div className="grid grid-cols-6 gap-3">
        <Input
          label="Nome"
          labelClassName="col-span-full"
          name="name"
          placeholder="Seu Nome"
          value={name}
          onChange={handleProfileChange}
        />
        <Input
          label="Objetivo"
          labelClassName="col-span-full"
          name="summary"
          placeholder="Explique mais sobre seus objetivos futuros"
          value={summary}
          onChange={handleProfileChange}
        />
        <Input
          label="Email"
          labelClassName="col-span-4"
          name="email"
          placeholder="seu.email@email.com"
          value={email}
          onChange={handleProfileChange}
        />
        <Input
          label="Telefone"
          labelClassName="col-span-2"
          name="phone"
          placeholder="(00)91234-5678"
          value={phone}
          onChange={handleProfileChange}
        />
        <Input
          label="Site"
          labelClassName="col-span-4"
          name="url"
          placeholder="linkedin.com/seuLinkedin"
          value={url}
          onChange={handleProfileChange}
        />
        <Input
          label="Endereço"
          labelClassName="col-span-2"
          name="location"
          placeholder="Cidade, Estado"
          value={location}
          onChange={handleProfileChange}
        />
      </div>
    </BaseForm>
  );
};

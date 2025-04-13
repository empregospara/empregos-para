import { useAppDispatch, useAppSelector } from "@/app/lib/redux/hooks";
import {
  changeWorkExperience,
  selectWorkExperiences,
} from "@/app/lib/redux/resumeSlice";
import { Form, FormSection } from "./Form";
import { CreateHandleChangeArgsWithDescriptions } from "./types";
import { ResumeWorkExperience } from "@/app/lib/redux/types";
import { BulletListTextArea, Input } from "./Form/InputGroup";

export const WorkExperiencesForm = () => {
  const workExperiences = useAppSelector(selectWorkExperiences);
  const dispatch = useAppDispatch();

  const showDelete = workExperiences.length > 1;

  return (
    <Form form="workExperiences" addButtonText="Experiência">
      {workExperiences.map(({ company, jobTitle, date, descriptions }, idx) => {
        const handleWorkExperienceChange = (
          ...[
            field,
            value,
          ]: CreateHandleChangeArgsWithDescriptions<ResumeWorkExperience>
        ) => {
          dispatch(changeWorkExperience({ idx, field, value } as any));
        };

        const showMoveUp = idx !== 0;
        const showMoveDown = idx !== workExperiences.length - 1;

        return (
          <FormSection
            key={idx}
            form="workExperiences"
            idx={idx}
            showMoveUp={showMoveUp}
            showMoveDown={showMoveDown}
            showDelete={showDelete}
            deleteButtonTooltipText="Apagar Experiência"
          >
            <Input
              label="Empresas"
              labelClassName="col-span-full"
              name="company"
              placeholder="Empresas que trabalhou"
              value={company}
              onChange={handleWorkExperienceChange}
            />
            <Input
              label="Cargo"
              labelClassName="col-span-4"
              name="jobTitle"
              placeholder="Assistente, auxiliar"
              value={jobTitle}
              onChange={handleWorkExperienceChange}
            />
            <Input
              label="Data"
              labelClassName="col-span-2"
              name="date"
              placeholder="Jan 2024 - Atual"
              value={date}
              onChange={handleWorkExperienceChange}
            />
            <BulletListTextArea
              label="Descrição"
              labelClassName="col-span-full"
              name="descriptions"
              placeholder="Com o que atuava"
              value={descriptions}
              onChange={handleWorkExperienceChange}
            />
          </FormSection>
        );
      })}
    </Form>
  );
};

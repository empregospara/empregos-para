import { useAppDispatch, useAppSelector } from "@/app/lib/redux/hooks";
import {
  changeEducations,
  selectEducations,
} from "@/app/lib/redux/resumeSlice";
import {
  changeShowBulletPoints,
  selectShowBulletPoints,
} from "@/app/lib/redux/settingsSlice";
import { Form, FormSection } from "./Form";
import { CreateHandleChangeArgsWithDescriptions } from "./types";
import { ResumeEducation } from "@/app/lib/redux/types";
import { BulletListTextArea, Input } from "./Form/InputGroup";
import { BulletListIconButton } from "./Form/IconButton";

export const EducationsForm = () => {
  const educations = useAppSelector(selectEducations);
  const dispatch = useAppDispatch();
  const showDelete = educations.length > 1;
  const form = "educations";
  const showBulletPoints = useAppSelector(selectShowBulletPoints(form));

  return (
    <Form form={form} addButtonText="Formação">
      {educations.map(({ school, degree, gpa, date, descriptions }, idx) => {
        const handleWorkExperienceChange = (
          ...[
            field,
            value,
          ]: CreateHandleChangeArgsWithDescriptions<ResumeEducation>
        ) => {
          dispatch(changeEducations({ idx, field, value } as any));
        };

        const handleShowBulletPoints = (value: boolean) => {
          dispatch(changeShowBulletPoints({ field: form, value }));
        };

        const showMoveUp = idx !== 0;
        const showMoveDown = idx !== educations.length - 1;

        return (
          <FormSection
            key={idx}
            form="educations"
            idx={idx}
            showMoveUp={showMoveUp}
            showMoveDown={showMoveDown}
            showDelete={showDelete}
            deleteButtonTooltipText="Delete school"
          >
            <Input
              label="Escola"
              labelClassName="col-span-4"
              name="school"
              placeholder="Universidade, Escola Regular"
              value={school}
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
            <Input
              label="Graduação"
              labelClassName="col-span-4"
              name="degree"
              placeholder="Bacharelado, Licenciatura"
              value={degree}
              onChange={handleWorkExperienceChange}
            />
            <div className="relative col-span-full">
              <BulletListTextArea
                label="Informações Adicionais (Opcional)"
                labelClassName="col-span-full"
                name="descriptions"
                placeholder="Sinta-se livre para complementar"
                value={descriptions}
                onChange={handleWorkExperienceChange}
                showBulletPoints={showBulletPoints}
              />
              <div className="absolute left-[17rem] top-[0.07rem]">
                <BulletListIconButton
                  showBulletPoints={showBulletPoints}
                  onClick={handleShowBulletPoints}
                />
              </div>
            </div>
          </FormSection>
        );
      })}
    </Form>
  );
};

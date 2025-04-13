import { changeSettings, DEFAULT_THEME_COLOR, GeneralSetting, selectSettings } from "@/app/lib/redux/settingsSlice";
import { FontFamily } from "../../fonts/constants";
import { InputGroupWrapper } from "../Form/InputGroup";
import { THEME_COLORS } from "./constants";
import { InlineInput } from "./InlineInput";
import { DocumentSizeSelections, FontFamilySelectionCSR, FontSizeSelections } from "./Selection";
import { Cog6ToothIcon } from "@heroicons/react/24/solid";
import { useAppDispatch, useAppSelector } from "@/app/lib/redux/hooks";
import { useState } from "react";

export const ThemeForm = () => {
  const userId = useAppSelector(state => state.settings);
  const settings = useAppSelector(selectSettings);
  const { fontSize, fontFamily, documentSize } = settings;
  const themeColor = settings.themeColor || DEFAULT_THEME_COLOR;
  const dispatch = useAppDispatch();
  const [qrcodeUrl, setQrcodeUrl] = useState<string | null>(null);

  const handleSettingsChange = (field: GeneralSetting, value: string) => {
    dispatch(changeSettings({ field, value }));
  };

  return (
    <form className="p-4 sm:p-6 md:p-8 lg:p-10">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <Cog6ToothIcon className="h-6 w-6 text-gray-600" aria-hidden="true" />
          <h1 className="text-lg font-semibold tracking-wide text-gray-900">
            Configurações do Currículo
          </h1>
        </div>
        
        <div>
          <InlineInput
            label="Cor Tema"
            name="themeColor"
            value={settings.themeColor}
            placeholder={DEFAULT_THEME_COLOR}
            onChange={handleSettingsChange}
            inputStyle={{ color: themeColor }}
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {THEME_COLORS.map((color, idx) => (
              <div
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md text-sm text-white"
                style={{ backgroundColor: color }}
                key={idx}
                onClick={() => handleSettingsChange("themeColor", color)}
                onKeyDown={(e) => {
                  if (["Enter", " "].includes(e.key)) {
                    handleSettingsChange("themeColor", color);
                  }
                }}
                tabIndex={0}
              >
                {settings.themeColor === color ? "$" : ""}
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <InputGroupWrapper label="Fontes" />
          <FontFamilySelectionCSR
            selectedFontFamily={fontFamily}
            themeColor={themeColor}
            handleSettingsChange={handleSettingsChange}
          />
        </div>
        
        <div>
          <InlineInput
            label="Tamanho da Fonte (pt)"
            name="fontSize"
            value={fontSize}
            placeholder="11"
            onChange={handleSettingsChange}
          />
          <FontSizeSelections
            fontFamily={fontFamily as FontFamily}
            themeColor={themeColor}
            selectedFontSize={fontSize}
            handleSettingsChange={handleSettingsChange}
          />
        </div>
        
        <div>
          <InputGroupWrapper label="Tamanho do Documento" />
          <DocumentSizeSelections
            themeColor={themeColor}
            selectedDocumentSize={documentSize}
            handleSettingsChange={handleSettingsChange}
          />
        </div>
      </div>
      
      <div className="mt-7">
        <h3 className="uppercase text-primary font-bold">
          Confirme os campos antes de Gerar o Currículo:
        </h3>
      </div>
      
      <div className="flex flex-col items-center gap-7 mt-3 mb-4 rounded-md">
        <button
          type="button"
          className="ml-5 font-bold h-14 w-full max-w-xs justify-center items-center cursor-pointer rounded-2xl text-white flex gap-2 border bg-primary px-3 py-0.5 hover:bg-gray-100 lg:max-w-md"
        >
          <a href="https://pix.empregospara.com/pix">Gerar PIX</a>
        </button>
      </div>
    </form>
  );
};

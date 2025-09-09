import { useSettings } from "./use-settings";
import { useTranslation as useI18nTranslation } from "@/lib/i18n";

export function useTranslation() {
  const { settings } = useSettings();
  const { t } = useI18nTranslation(settings.language);
  
  return { t, language: settings.language };
}
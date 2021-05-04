import { setupI18n } from "@lingui/core";

// Importing locale messages
import catalogCS from "./locales/cs/messages";
import catalogDE from "./locales/de/messages";
import catalogEN from "./locales/en/messages";
import catalogES from "./locales/es/messages";
import catalogFR from "./locales/fr/messages";
import catalogHU from "./locales/hu/messages";
import catalogIT from "./locales/it/messages";
import catalogJA from "./locales/ja/messages";
import catalogKO from "./locales/ko/messages";
import catalogPL from "./locales/pl/messages";
import catalogPtBr from "./locales/pt-BR/messages";
import catalogRU from "./locales/ru/messages";
import catalogZhCn from "./locales/zh-CN/messages";
import catalogZhTw from "./locales/zh-TW/messages";

// Creating a catalog of languages
export const catalogs = {
  cs: catalogCS,
  de: catalogDE,
  en: catalogEN,
  es: catalogES,
  fr: catalogFR,
  hu: catalogHU,
  it: catalogIT,
  ja: catalogJA,
  ko: catalogKO,
  pl: catalogPL,
  pt_BR: catalogPtBr,
  ru: catalogRU,
  zh_CN: catalogZhCn,
  zh_TW: catalogZhTw
};

export const i18n = setupI18n({
  catalogs
});

export const geti18n = () => i18n;

export const setI18nLocale = (lang) => {
  i18n.activate(lang);
};

export const defaultLocale = "en";

// Getting the browser language
// let lang = window.navigator.language;

// if (lang.indexOf("-") !== -1) {
//   [lang] = lang.split("-");
// }

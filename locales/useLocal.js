import en from './en';
import zh_CN from './zh_CN';

let defaultLanguage = 'en';

const useLocal = (language = defaultLanguage) => {
  defaultLanguage = language;
  const t = (key) => {
    if (language === 'en') {
      return en[key]
    }
    if (language === 'zh_CN') {
      return zh_CN[key]
    }
  }
  return t;
};

export {
  useLocal
}
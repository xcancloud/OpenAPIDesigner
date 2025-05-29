import { createApp } from 'vue';
import { createI18n } from 'vue-i18n';
import App from '../core/App.vue';
import '../dist/open-api-designer.css';
import 'tailwindcss/tailwind.css';
import 'tailwindcss/components.css';
import 'tailwindcss/utilities.css';
import '../core/ant-reset.css';

const init = async () => {
  const en_messages = (await import(`../locales/en.js`)).default;
  const zh_message = (await import(`../locales/zh_CN.js`)).default;
  const i18n = createI18n({
    locale: 'zh_CN',
    legacy: false,
    messages: {
      zh_CN: zh_message,
      en: en_messages
    }
  });
  createApp(App).use(i18n).mount('#app');
}

init();




import { defineCustomElement, h } from 'vue';
import { createI18n } from 'vue-i18n';
import MyComponent from './core/index.ts';
import styleList from './assets/style';


class OpenApiDesign {
  container: HTMLElement|null| undefined;

  innerSlot:  NodeListOf<ChildNode>|null| undefined|string;
  option: {
    onMountedCallback?: Function; // 渲染完成 callback
  }
  reloadAccount: number;
  constructor (option = {}) {

    this.reloadAccount = 0;
    this.option = option;
    this.init()
  }

  async init () {
    const en_messages = (await import(`./locales/en.js`)).default;
    const zh_message = (await import(`./locales/zh_CN.js`)).default;

    const i18n = createI18n({
      locale: 'en',
      legacy: false,
      messages: {
        zh_CN: zh_message,
        en: en_messages
      }
    });

    const MyCustomElement = defineCustomElement(MyComponent, {
      styles: [`.api-root {heigth: 100%;}`, ...styleList],
      configureApp: (app) => {
        app.provide('getAppFunc', (appFunc: {name: string; func: Function})=> {
          this[appFunc.name] = appFunc.func;
        });
      },
      shadowRoot: true
    });

    if (!customElements.get(`open-api-design`)) {
      customElements.define( `open-api-design`, MyCustomElement)
    }
    
    if (typeof this.option.onMountedCallback === 'function') {
      this.option.onMountedCallback();
    }
  }

  // Change Language
  changeLanguage: (language: 'en' | 'zh_CN') => void;

  // get openapidoc JSON Object
  getDocApi: Function

  // Update the form information to the openapidoc object
  // When you leave this page, the form will be updated automatically
  updateData: Function;

}


export default OpenApiDesign;
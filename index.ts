
import { defineCustomElement } from 'vue';
import { createI18n } from 'vue-i18n';
import MyComponent from './core/index.ts';
import styleList from './assets/style';

function resolveSelector(selector: string | HTMLElement | null | undefined) {
  return typeof selector === 'string'
    ? document.querySelector<HTMLElement>(selector)
    : selector;
}

const defaultOption = {
  language: 'zh_CN'
}

class OpenApiDesign {
  container: HTMLElement|null| undefined;
  option: {
    language?:'en'|'zh_CN',
    openApiDoc: Record<string, any>;
    onMountedCallback?: Function; // 渲染完成 callback
  }
  constructor (container: HTMLElement | string, option: {language:'en'|'zh_CN'}) {
    this.container = resolveSelector(container);
    this.option = Object.assign(defaultOption, option);
    if (this.container) {
      this.init()
    }
  }

  async init () {
    const wrapWidth = this.container?.clientWidth;
    const wrapHeight = this.container?.clientHeight;
    const en_messages = (await import(`./locales/en.js`)).default;
    const zh_message = (await import(`./locales/zh_CN.js`)).default;
    const locale = this.option.language || 'en';
    const i18n = createI18n({
      locale: locale,
      legacy: false,
      messages: {
        zh_CN: zh_message,
        en: en_messages
      }
    });
    const MyCustomElement = defineCustomElement(MyComponent, {
      styles: [`.api-root{width: ${wrapWidth}px; height: ${wrapHeight}px;}`, ...styleList],
      nonce: 'my-custome',
      configureApp: (app) => {
        app.use(i18n);
        app.provide('getAppFunc', (appFunc: {name: string; func: Function})=> {
          this[appFunc.name] = appFunc.func;
        });
        app.provide('openApiDoc', this.option.openApiDoc);
        app.provide('i18n', i18n);
      },
      shadowRoot: false
    });

    customElements.define('open-api-design', MyCustomElement);
    const innerSlot = this.container?.innerHTML;
  
    this.container && (this.container.innerHTML = `<open-api-design>${innerSlot}</open-api-design>`);
    if (typeof this.option.onMountedCallback === 'function') {
      this.option.onMountedCallback()
    }
    // const sheetList: CSSStyleSheet[] = [];
    // styleList.forEach(styleText => {
    //   const sheet = new CSSStyleSheet();
    //   sheet.replaceSync(styleText);
    //   sheetList.push(sheet);
    // });
    // const shadowHost = document.querySelector('open-api-design');
    // const shadowRoot = shadowHost?.shadowRoot;
    // if (shadowRoot) {
    //   shadowRoot.adoptedStyleSheets = [...sheetList];
    // }
  }

  // get openapidoc JSON Object
  getDocApi: Function


  // Update the form information to the openapidoc object
  // When you leave this page, the form will be updated automatically
  updateData: Function;

}


export default OpenApiDesign;
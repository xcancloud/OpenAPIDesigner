
import { defineCustomElement, h } from 'vue';
import { createI18n } from 'vue-i18n';
import MyComponent from './core/index.ts';
import styleList from './assets/style';

function resolveSelector(selector: string | HTMLElement | null | undefined) {
  return typeof selector === 'string'
    ? document.querySelector<HTMLElement>(selector)
    : selector;
}

const defaultOption = {
  language: 'en',
}

class OpenApiDesign {
  container: HTMLElement|null| undefined;

  innerSlot:  NodeListOf<ChildNode>|null| undefined|string;

  app: any;
  option: {
    language?:'en'|'zh_CN',
    openApiDoc: Record<string, any> | URL;
    onMountedCallback?: Function; // 渲染完成 callback
  }
  reloadAccount: number;
  constructor (container: HTMLElement | string, option: {language:'en'}) {
    this.container = resolveSelector(container);
    this.reloadAccount = 0;
    this.option = Object.assign(defaultOption, option);
    if (this.container) {
      this.init(true)
    }
  }

  async init (isConstructor = false) {
    if (typeof this.option.openApiDoc === 'string') {
      try {
        new URL(this.option.openApiDoc);
      } catch {
        this.option.openApiDoc = {};
      }
    }
    if (typeof this.option.openApiDoc === 'string') {
      const response = await fetch(this.option.openApiDoc, {
        'Content-Type': "application/json"
      });
      this.option.openApiDoc = await response.json();
    }
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
      styles: [`
      .api-root{width: ${wrapWidth}px; height: ${wrapHeight}px;}
      `, ...styleList],
      configureApp: (app) => {
        app.use(i18n);
        app.provide('getAppFunc', (appFunc: {name: string; func: Function})=> {
          this[appFunc.name] = appFunc.func;
        });
        app.provide('openApiDoc', this.option.openApiDoc);
        app.provide(Symbol.for('i18n'), i18n);
      },
      shadowRoot: true
    });

    // while (customElements.get(`open-api-design-${this.reloadAccount}`)) {
    //   this.reloadAccount += 1;
    // }
    if (!customElements.get(`open-api-design`)) {
      customElements.define( `open-api-design`, MyCustomElement)
    }

    // customElements.define( `open-api-design-${this.reloadAccount}`, MyCustomElement);

  
    // if (!this.innerSlot && isConstructor) {
    //   this.innerSlot = this.container?.innerHTML;
    // }

    // this.container && (this.container.innerHTML = `<open-api-design-${this.reloadAccount}></open-api-design-${this.reloadAccount}>`);
    
    if (typeof this.option.onMountedCallback === 'function') {
      this.option.onMountedCallback();
    }
  }

  changeLanguage: (language: 'en' | 'zh_CN') => void;
  // public changeLanguage (language: 'en' | 'zh_CN') {
  //   if (language === this.option.language || !['en', 'zh_CN'].includes(language)) {
  //     return;
  //   }
  //   this.option.language = language;
  //   if (this.updateData && typeof this.updateData === 'function') {
  //     this.updateData();
  //   }
  //   this.reload();
  // }

  public reload () {
    const openApiDocData = this.getDocApi();
    this.option.openApiDoc = openApiDocData;
    this.container && (this.container.innerHTML = '');
    this.init();
  }


  // get openapidoc JSON Object
  getDocApi: Function


  // Update the form information to the openapidoc object
  // When you leave this page, the form will be updated automatically
  updateData: Function;

}


export default OpenApiDesign;
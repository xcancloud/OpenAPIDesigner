
import { defineCustomElement } from 'vue';
import MyComponent from './core/index';
import styleList from './assets/style';

function resolveSelector(selector: string | HTMLElement | null | undefined) {
  return typeof selector === 'string'
    ? document.querySelector<HTMLElement>(selector)
    : selector;
}

class OpenApiDesign {
  container: HTMLElement|null| undefined;
  constructor (container: HTMLElement | string, ) {
    this.container = resolveSelector(container);
    if (this.container) {
      this.init()
    }
  }

  async init () {
    const wrapWidth = this.container?.clientWidth;
    const wrapHeight = this.container?.clientHeight;
    const MyCustomElement = defineCustomElement(MyComponent, {
      styles: [`.api-root{width: ${wrapWidth}px; height: ${wrapHeight}px;}`],
      nonce: 'my-custome',
      configureApp: (app) => {
        console.log(app);
        app.provide('getAppFunc', (appFunc: {name: string; func: Function})=> {
          this[appFunc.name] = appFunc.func;
        });
      },
      shadowRoot: true
    });

    customElements.define('open-api-design', MyCustomElement);
    const innerSlot = this.container.innerHTML;
  
    this.container.innerHTML = `<open-api-design>${innerSlot}</open-api-design>`;

    const sheetList: CSSStyleSheet[] = [];
    styleList.forEach(styleText => {
      const sheet = new CSSStyleSheet();
      sheet.replaceSync(styleText);
      sheetList.push(sheet);
    });
    const shadowHost = document.querySelector('open-api-design');
    const shadowRoot = shadowHost?.shadowRoot;
    if (shadowRoot) {
      shadowRoot.adoptedStyleSheets = [...shadowRoot.adoptedStyleSheets, ...sheetList];
    }
  }

  // 获取文档信息表单信息
  getDocInfoFormData: Function;

}


export default OpenApiDesign;
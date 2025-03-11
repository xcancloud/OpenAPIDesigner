
import { defineCustomElement } from 'vue';
import MyComponent from './core/index';
import styleText from './assets/style';

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
    const MyCustomElement = defineCustomElement(MyComponent, {
      nonce: 'my-custome'
    });
    customElements.define('open-api-design', MyCustomElement);
    const innerSlot = this.container.innerHTML;
    this.container.innerHTML = `<open-api-design>${innerSlot}</open-api-design>`;
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(styleText);

    const shadowHost = document.querySelector('open-api-design');
    const shadowRoot = shadowHost?.shadowRoot;
    if (shadowRoot) {
      shadowRoot.adoptedStyleSheets = [...shadowRoot.adoptedStyleSheets, sheet];
    }
  }
}


export default OpenApiDesign;
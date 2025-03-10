
import { defineCustomElement } from 'vue';
import MyComponent from './core/index';
import {resolve} from 'path';


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
    const styles = await this.fetchStyle();
    const MyCustomElement = defineCustomElement(MyComponent, {
      styles: [styles],
      nonce: 'my-custome'
    });
    customElements.define('my-component', MyCustomElement);
    const innerSlot = this.container.innerHTML;
    this.container.innerHTML = `<my-component>${innerSlot}</my-component>`
  }



  async fetchStyle () {
    const styleText = await fetch(resolve('./node_modules/ant-design-vue/dist/antd.css'))
    return styleText.text();
  }
}


export default OpenApiDesign;
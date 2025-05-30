
import { defineCustomElement, h } from 'vue';
// import { createI18n } from 'vue-i18n';
import MyComponent from './core/index.ts';
import styleList from './assets/style';
import AppWrapper from './core/AppWrapper.vue';

class DesignInstance {
  // Change Language
  changeLanguage: (language: 'en' | 'zh_CN') => void;

  // get openapidoc JSON Object
  getDocApi: Function

  // Update the form information to the openapidoc object
  // When you leave this page, the form will be updated automatically
  updateData: Function;
}

const defaultOption = {
  defaultFontSize: 14
};

class OpenApiDesign {
  container: HTMLElement|null| undefined;

  innerSlot:  NodeListOf<ChildNode>|null| undefined|string;
  option: {
    onMountedCallback?: Function; // 渲染完成 callback
    defaultFontSize?: number;
  } = {};
  reloadAccount: number = 0;
  compName: string;

  instance: any;

  constructor (option = {}) {

    this.reloadAccount += 1;
    // this.option = option;
    Object.assign(this.option, {...defaultOption, ...option});
    this.init();
  }

  init () {

    // while (customElements.get(`design-${this.reloadAccount}`)) {
    //   this.reloadAccount += 1;
    // }
    const MyCustomElement = defineCustomElement(MyComponent, {
      styles: [...styleList, `.api-root {heigth: 100%; font-size: ${this.option.defaultFontSize}px}`],
      configureApp: (app) => {
        app.provide('getAppFunc', (appFunc: {name: string; func: Function})=> {
          this[appFunc.name] = appFunc.func;
        });
      },
      shadowRoot: true
    });

    // customElements.define( `design-${this.reloadAccount}`, MyCustomElement)

    while (customElements.get(`open-api-design-${this.reloadAccount}`)) {
      this.reloadAccount += 1;
    }

    this.compName = `open-api-design-${this.reloadAccount}`;

    customElements.define( `open-api-design-${this.reloadAccount}`, MyCustomElement);

    // this.compName = `design-${this.reloadAccount}`;
    // if (!customElements.get(`open-api-design`)) {
      // const apiWrapperElement = defineCustomElement(AppWrapper, {
      //   shadowRoot: false
      // });
      // customElements.define( `open-api-design`, MyCustomElement);
    // }
    // const wrapperEle = document.querySelector('open-api-design');
    // wrapperEle?.setAttribute('comp-name', `design-${this.reloadAccount}`);

    
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
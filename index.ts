
import { defineCustomElement } from 'vue';
// import { createI18n } from 'vue-i18n';
import MyComponent from './core/index.ts';
import styleList from './assets/style';

/**
 * <p>Expose functions injected by the inner Vue application.</p>
 * <p>This interface describes the callbacks that will be provided via <code>provide/inject</code>.</p>
 */
interface DesignInstance {
  /** <p>Switch the UI language.</p> */
  changeLanguage: (language: 'en' | 'zh_CN') => void;

  /** <p>Retrieve the current OpenAPI document object.</p> */
  getDocApi: () => Record<string, unknown>;

  /** <p>Synchronise the form data back to the OpenAPI document.</p>
   * <p>This method is automatically invoked when the component is un-mounted.</p> */
  updateData: () => void;
}

const defaultOption = {
  defaultFontSize: 14
};

/**
 * <p>Public façade used by external consumers to embed the OpenAPI designer as a Web Component.</p>
 * <p>The implementation wraps a Vue application in a custom element so it can be mounted anywhere.</p>
 */
class OpenApiDesign {
  /** <p>Reference to the mounting container.</p> */
  container: HTMLElement | null | undefined;

  /** <p>Slot content initially present inside the container.</p> */
  innerSlot: NodeListOf<ChildNode> | string | null | undefined;

  /** <p>Runtime options.</p> */
  option: {
    /** <p>Callback executed once the Web Component has been mounted.</p> */
    onMountedCallback?: () => void;
    /** <p>Base font size, applied to <code>.api-root</code>.</p> */
    defaultFontSize?: number;
  } = {};

  /** <p>Ensures a unique component name when multiple instances coexist.</p> */
  reloadAccount = 0;

  /** <p>Computed tag name for the generated custom element.</p> */
  compName!: string;

  /** <p>Vue instance returned by <code>defineCustomElement</code>.</p> */
  instance: any;

  /**
   * <p>Create a new design instance.</p>
   * <p>Runtime <code>options</code> override the built-in defaults.</p>
   */
  constructor (options: Partial<{ onMountedCallback: () => void; defaultFontSize: number }> = {}) {
    this.reloadAccount += 1;
    this.option = { ...defaultOption, ...options };
    this.init();
  }

  /**
   * <p>Initialise and register the inner Web Component.</p>
   * <p>This method is automatically invoked by the constructor.</p>
   */
  init (): void {

    // while (customElements.get(`design-${this.reloadAccount}`)) {
    //   this.reloadAccount += 1;
    // }
    const MyCustomElement = defineCustomElement(MyComponent, {
      styles: [...styleList, `.api-root {height: 100%; font-size: ${this.option.defaultFontSize}px}`],
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

  /** <p>Injected callback: change the current language.</p> */
  changeLanguage!: (language: 'en' | 'zh_CN') => void;

  /** <p>Injected callback: obtain the current OpenAPI document.</p> */
  getDocApi!: () => Record<string, unknown>;

  /** <p>Injected callback: persist form data back to the document.</p> */
  updateData!: () => void;

  

}


export default OpenApiDesign;
// TypeScript version of html-compo.js library

interface ComponentObject {
  node: HTMLElement;
  attrConstants: string[];
  nodeName: string;
}

interface ComponentPassVars {
  [key: string]: any;
  self: CompoSelf;
}

interface CompoSelf {
  componentName: string;
  data?: string;
  componentObject?: HTMLElement | ShadowRoot;
}

interface UseComponentOptions {
  fragment: boolean;
}

interface NodeReferences {
  [key: string]: HTMLElement;
}

class HtmlCompoFunc {
  private readonly no_parameter = Symbol('no_paramerter');
  private mainNode: HTMLElement;
  private validNode: HTMLElement | ShadowRoot;
  private node: HTMLElement;

  constructor(node: HTMLElement) {
    this.mainNode = node;
    this.validNode = node.shadowRoot || node;
    this.node = node;
  }

  html(): string;
  html(cont: string): void;
  html(cont: string | symbol = this.no_parameter): string | void {
    if (cont === this.no_parameter) {
      return this.validNode.innerHTML;
    } else {
      this.validNode.innerHTML = cont as string;
    }
  }

  attr(name: string): string | null;
  attr(name: string, value: string): void;
  attr(name: string | symbol = this.no_parameter, value: string | symbol = this.no_parameter): string | null | void {
    if (name === this.no_parameter) {
      return;
    }
    if (value === this.no_parameter) {
      return this.node.getAttribute(name as string);
    }
    this.node.setAttribute(name as string, value as string);
  }
}

interface HtmlCompoAPI {
  getComponent(reference: string): HtmlCompoFunc | null;
}

// Extend the Window interface to include htmlCompo
declare global {
  interface Window {
    htmlCompo: HtmlCompoAPI;
  }
}

export {};

(function(window: Window, document: Document): void {
  const HTMLComponentsClass: Array<[string, typeof HTMLElement]> = [];
  const definationTags: string[] = ['html-components', 'h-c'];

  // Create and register definition tag classes
  for (const definationTag of definationTags) {
    const currentClass = class extends HTMLElement {
      shadow: ShadowRoot;

      constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        this.shadow = shadow;
      }

      connectedCallback(): void {
        this.style.display = 'none';
        this.shadow.innerHTML = this.innerHTML;
        this.innerHTML = "";
        processComponentDefinationContainer(this);
      }
    };

    HTMLComponentsClass.push([definationTag, currentClass]);
    registerElement(definationTag, currentClass);
  }

  const userDefinedComponents: { [key: string]: ComponentObject } = {};
  const nodeReferences: NodeReferences = Object.create(null);

  function processComponentDefinationContainer(elem: HTMLElement): void {
    const observer = new MutationObserver(function(mutations: MutationRecord[]): void {
      mutations.forEach(function(mutation: MutationRecord): void {
        if (mutation.addedNodes.length) {
          const node = mutation.addedNodes[0];
          if (node instanceof HTMLElement) {
            if (Array.from(elem.children).includes(node)) {
              componentDefine(node, elem);
            }
          }
        }
      });
    });
    observer.observe(elem, { childList: true, subTree: false } as MutationObserverInit);
  }

  function registerElement(name: string, construct: CustomElementConstructor): void {
    customElements.define(name, construct);
  }

  function componentDefine(node: HTMLElement, defineLoc: HTMLElement): void {
    const nodeName = node.nodeName.toLowerCase();
    const attrConstants = node.getAttribute('compo-attrs') || "";
    let shadowedOrNot = node.getAttribute('fragment');
    
    let isShadowed: boolean;
    if (shadowedOrNot && shadowedOrNot === "true") {
      isShadowed = true;
    } else {
      isShadowed = false;
    }

    const attrConstantsArray = attrConstants.split(",").filter(x => !!x.trim());
    const currentComponentObj: ComponentObject = userDefinedComponents[nodeName] = {
      node: node,
      attrConstants: attrConstantsArray,
      nodeName: nodeName
    };

    node.remove();
    const nodeNameRegister = node.nodeName.toLowerCase();

    const ComponentClass = class extends HTMLElement {
      constructor() {
        super();
      }

      connectedCallback(): void {
        if (isShadowed) {
          void this.attachShadow({ mode: 'open' });
        }
        useComponent(this, currentComponentObj, {
          fragment: isShadowed
        });
      }

      attributeChangedCallback(): void {
        const referenceVal = this.getAttribute('ref');
        if (referenceVal != null) {
          nodeReferences[referenceVal] = this;
        }
      }

      static get observedAttributes(): string[] {
        return ['ref'];
      }
    };

    registerElement(nodeName, ComponentClass);
  }

  function templateStr(
    str: string, 
    locals: { [key: string]: any }, 
    braces: [string, string] = ["@{", "}"]
  ): string {
    const regStr = braces[0] + "([^" + braces[1] + "]+)" + "\\" + braces[1];
    const skipRegStr = "[^\\*]\\";
    const noSkipRegStr = "\\*\\";
    const reg = new RegExp(skipRegStr + regStr, "g");
    const noSkipReg = new RegExp(noSkipRegStr + regStr, "g");

    return str.replace(reg, function(rawmatch: string, match: string, pos: number): string {
      if (typeof locals != "object") locals = ({});
      if (locals.hasOwnProperty(match)) {
        return rawmatch.substr(0, 1) + locals[match];
      }
      
      let deepPropCheck: any;
      try {
        deepPropCheck = Function('locals', 'return locals.' + match + ';')(locals);
      } catch (err) {}
      
      // If not found as a literal
      if (deepPropCheck != undefined) {
        return rawmatch.substr(0, 1) + deepPropCheck;
      }
      return rawmatch;
    }).replace(noSkipReg, function(raw: string, match: string, pos: number): string {
      if (raw.substr(0, 1) === "*") {
        return raw.substr(1);
      }
      return raw;
    });
  }

  function useComponent(
    currentElement: HTMLElement, 
    componentObject: ComponentObject, 
    options: UseComponentOptions
  ): void {
    const processAttrs = componentObject.attrConstants;
    const attrValsMapEntries = processAttrs.map(attr => {
      const attrParts = attr.trim().split("=");
      const rval: [string, string] = [attrParts[0], ""];
      const val = currentElement.getAttribute(attrParts[0]);
      
      if (val == null) {
        if (1 in attrParts) {
          rval[1] = attrParts[1];
        } else {
          rval[1] = "null";
        }
      } else {
        rval[1] = val;
      }
      return rval;
    });

    const compo: CompoSelf = {
      componentName: currentElement.nodeName.toLowerCase()
    };

    const componentInnerData = componentObject.node.innerHTML;
    const componentVarBraces: [string, string] = ["@{", "}"];
    const attrValsMap = Object.fromEntries(attrValsMapEntries);
    const componentPassVars: ComponentPassVars = {
      ...attrValsMap,
      self: compo
    };

    if (options.fragment) {
      if (currentElement.shadowRoot) {
        currentElement.shadowRoot.innerHTML = currentElement.innerHTML;
        compo.data = currentElement.shadowRoot.innerHTML;
        compo.componentObject = currentElement.shadowRoot;
        currentElement.innerHTML = "";
        currentElement.shadowRoot.innerHTML = templateStr(
          componentInnerData, componentPassVars, componentVarBraces
        );
      }
    } else {
      compo.data = currentElement.innerHTML;
      currentElement.innerHTML = "";
      compo.componentObject = currentElement;
      currentElement.innerHTML = templateStr(
        componentInnerData, componentPassVars, componentVarBraces
      );
    }
  }

  const htmlCompo: HtmlCompoAPI = {
    getComponent(reference: string): HtmlCompoFunc | null {
      if (!reference) errorThrow("At least 1 argument required!");
      if (typeof reference !== "string") errorThrow("First argument 'reference' must be a string");
      
      const returnNode = nodeReferences[reference];
      if (!returnNode) {
        return null;
      }
      return new HtmlCompoFunc(returnNode);
    }
  };

  (window as any).htmlCompo = htmlCompo;

  function errorThrow(msg: string): never {
    throw new Error(msg);
  }

})(window, document);

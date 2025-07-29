// Type definitions for html-compo.js

export interface ComponentObject {
  node: HTMLElement;
  attrConstants: string[];
  nodeName: string;
}

export interface ComponentPassVars {
  [key: string]: any;
  self: CompoSelf;
}

export interface CompoSelf {
  componentName: string;
  data?: string;
  componentObject?: HTMLElement | ShadowRoot;
}

export interface UseComponentOptions {
  fragment: boolean;
}

export interface NodeReferences {
  [key: string]: HTMLElement;
}

export declare class HtmlCompoFunc {
  constructor(node: HTMLElement);
  html(): string;
  html(cont: string): void;
  attr(name: string): string | null;
  attr(name: string, value: string): void;
}

export interface HtmlCompoAPI {
  getComponent(reference: string): HtmlCompoFunc | null;
}

declare global {
  interface Window {
    htmlCompo: HtmlCompoAPI;
  }
}

export declare const htmlCompo: HtmlCompoAPI;

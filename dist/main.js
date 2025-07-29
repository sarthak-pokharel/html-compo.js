// TypeScript version of html-compo.js library
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class HtmlCompoFunc {
        constructor(node) {
            this.no_parameter = Symbol('no_paramerter');
            this.mainNode = node;
            this.validNode = node.shadowRoot || node;
            this.node = node;
        }
        html(cont = this.no_parameter) {
            if (cont === this.no_parameter) {
                return this.validNode.innerHTML;
            }
            else {
                this.validNode.innerHTML = cont;
            }
        }
        attr(name = this.no_parameter, value = this.no_parameter) {
            if (name === this.no_parameter) {
                return;
            }
            if (value === this.no_parameter) {
                return this.node.getAttribute(name);
            }
            this.node.setAttribute(name, value);
        }
    }
    (function (window, document) {
        const HTMLComponentsClass = [];
        const definationTags = ['html-components', 'h-c'];
        // Create and register definition tag classes
        for (const definationTag of definationTags) {
            const currentClass = class extends HTMLElement {
                constructor() {
                    super();
                    const shadow = this.attachShadow({ mode: 'open' });
                    this.shadow = shadow;
                }
                connectedCallback() {
                    this.style.display = 'none';
                    this.shadow.innerHTML = this.innerHTML;
                    this.innerHTML = "";
                    processComponentDefinationContainer(this);
                }
            };
            HTMLComponentsClass.push([definationTag, currentClass]);
            registerElement(definationTag, currentClass);
        }
        const userDefinedComponents = {};
        const nodeReferences = Object.create(null);
        function processComponentDefinationContainer(elem) {
            const observer = new MutationObserver(function (mutations) {
                mutations.forEach(function (mutation) {
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
            observer.observe(elem, { childList: true, subTree: false });
        }
        function registerElement(name, construct) {
            customElements.define(name, construct);
        }
        function componentDefine(node, defineLoc) {
            const nodeName = node.nodeName.toLowerCase();
            const attrConstants = node.getAttribute('compo-attrs') || "";
            let shadowedOrNot = node.getAttribute('fragment');
            let isShadowed;
            if (shadowedOrNot && shadowedOrNot === "true") {
                isShadowed = true;
            }
            else {
                isShadowed = false;
            }
            const attrConstantsArray = attrConstants.split(",").filter(x => !!x.trim());
            const currentComponentObj = userDefinedComponents[nodeName] = {
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
                connectedCallback() {
                    if (isShadowed) {
                        void this.attachShadow({ mode: 'open' });
                    }
                    useComponent(this, currentComponentObj, {
                        fragment: isShadowed
                    });
                }
                attributeChangedCallback() {
                    const referenceVal = this.getAttribute('ref');
                    if (referenceVal != null) {
                        nodeReferences[referenceVal] = this;
                    }
                }
                static get observedAttributes() {
                    return ['ref'];
                }
            };
            registerElement(nodeName, ComponentClass);
        }
        function templateStr(str, locals, braces = ["@{", "}"]) {
            const regStr = braces[0] + "([^" + braces[1] + "]+)" + "\\" + braces[1];
            const skipRegStr = "[^\\*]\\";
            const noSkipRegStr = "\\*\\";
            const reg = new RegExp(skipRegStr + regStr, "g");
            const noSkipReg = new RegExp(noSkipRegStr + regStr, "g");
            return str.replace(reg, function (rawmatch, match, pos) {
                if (typeof locals != "object")
                    locals = ({});
                if (locals.hasOwnProperty(match)) {
                    return rawmatch.substr(0, 1) + locals[match];
                }
                let deepPropCheck;
                try {
                    deepPropCheck = Function('locals', 'return locals.' + match + ';')(locals);
                }
                catch (err) { }
                // If not found as a literal
                if (deepPropCheck != undefined) {
                    return rawmatch.substr(0, 1) + deepPropCheck;
                }
                return rawmatch;
            }).replace(noSkipReg, function (raw, match, pos) {
                if (raw.substr(0, 1) === "*") {
                    return raw.substr(1);
                }
                return raw;
            });
        }
        function useComponent(currentElement, componentObject, options) {
            const processAttrs = componentObject.attrConstants;
            const attrValsMapEntries = processAttrs.map(attr => {
                const attrParts = attr.trim().split("=");
                const rval = [attrParts[0], ""];
                const val = currentElement.getAttribute(attrParts[0]);
                if (val == null) {
                    if (1 in attrParts) {
                        rval[1] = attrParts[1];
                    }
                    else {
                        rval[1] = "null";
                    }
                }
                else {
                    rval[1] = val;
                }
                return rval;
            });
            const compo = {
                componentName: currentElement.nodeName.toLowerCase()
            };
            const componentInnerData = componentObject.node.innerHTML;
            const componentVarBraces = ["@{", "}"];
            const attrValsMap = Object.fromEntries(attrValsMapEntries);
            const componentPassVars = {
                ...attrValsMap,
                self: compo
            };
            if (options.fragment) {
                if (currentElement.shadowRoot) {
                    currentElement.shadowRoot.innerHTML = currentElement.innerHTML;
                    compo.data = currentElement.shadowRoot.innerHTML;
                    compo.componentObject = currentElement.shadowRoot;
                    currentElement.innerHTML = "";
                    currentElement.shadowRoot.innerHTML = templateStr(componentInnerData, componentPassVars, componentVarBraces);
                }
            }
            else {
                compo.data = currentElement.innerHTML;
                currentElement.innerHTML = "";
                compo.componentObject = currentElement;
                currentElement.innerHTML = templateStr(componentInnerData, componentPassVars, componentVarBraces);
            }
        }
        const htmlCompo = {
            getComponent(reference) {
                if (!reference)
                    errorThrow("At least 1 argument required!");
                if (typeof reference !== "string")
                    errorThrow("First argument 'reference' must be a string");
                const returnNode = nodeReferences[reference];
                if (!returnNode) {
                    return null;
                }
                return new HtmlCompoFunc(returnNode);
            }
        };
        window.htmlCompo = htmlCompo;
        function errorThrow(msg) {
            throw new Error(msg);
        }
    })(window, document);
});
//# sourceMappingURL=main.js.map
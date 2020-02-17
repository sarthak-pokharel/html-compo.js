(function(window,document){

// The class below, "HTMLElemenet" is from StackOverflow, 
// https://stackoverflow.com/a/52884370/12697805
class HTMLBaseElement extends HTMLElement {
  constructor(...args) {
    const self = super(...args)
    self.parsed = false // guard to make it easy to do certain stuff only once
    self.parentNodes = []
    return self
  }

  setup() {
    // collect the parentNodes
    let el = this;
    while (el.parentNode) {
      el = el.parentNode
      this.parentNodes.push(el)
    }
    // check if the parser has already passed the end tag of the component
    // in which case this element, or one of its parents, should have a nextSibling
    // if not (no whitespace at all between tags and no nextElementSiblings either)
    // resort to DOMContentLoaded or load having triggered
    if ([this, ...this.parentNodes].some(el=> el.nextSibling) || document.readyState !== 'loading') {
      this.childrenAvailableCallback();
    } else {
      this.mutationObserver = new MutationObserver(() => {
        if ([this, ...this.parentNodes].some(el=> el.nextSibling) || document.readyState !== 'loading') {
          this.childrenAvailableCallback()
          this.mutationObserver.disconnect()
        }
      });

      this.mutationObserver.observe(this, {childList: true});
    }
  }
}
class HTMLCompos extends HTMLBaseElement{
	constructor() {
		super();
		let shadow = this.attachShadow({mode: 'open'});
	}
	connectedCallback() {
		super.setup();
		processComponentDefinationContainer(this);
	}
}
window.userDefinedComponents = {};
// let userDefinedComponents = {};
function processComponentDefinationContainer(elem) {
	var observer = new MutationObserver(function(mutations) {
		mutations.forEach(function(mutation) {
			if (mutation.addedNodes.length){
				let node = mutation.addedNodes[0];
				if(node instanceof HTMLElement) {
					componentDefine(node);
				}
			}
		});
    });
    observer.observe(elem, { childList: true });
}
function registerElement(name,construct) {
	customElements.define(name,construct);
}
function componentDefine(node) {
	let nodeName = node.nodeName.toLowerCase();
	let attrConstants = node.getAttribute('compo-attrs') || "";
	attrConstants = attrConstants.split(",");
	let currentComponentObj = userDefinedComponents[nodeName] = {
		node: node,
		attrConstants: attrConstants,
		nodeName: nodeName
	};
	node.remove();
	registerElement(node.nodeName.toLowerCase(),class extends HTMLBaseElement {
		connectedCallback() {
			useComponent(this,currentComponentObj);
		}
	});
}
function templateStr(str, locals, braces= ["@{","}"]) {
	let regStr = braces[0]+"([^"+braces[1]+"]+)"+"\\"+braces[1];
	let skipRegStr = "[^\\*]\\";
	let noSkipRegStr = "\\*\\";
	let reg = new RegExp(skipRegStr+regStr, "g");
	let noSkipReg = new RegExp(noSkipRegStr+regStr, "g");
	return str.replace(reg, function(rawmatch,match,pos) {
		let rmatch = match;
		if(typeof locals !="object") locals = ({});
		if(locals.hasOwnProperty(match)) {
			return rawmatch.substr(0,1) + locals[match];
		}
		let deepPropCheck = Function('locals','return locals.'+match+';')(locals);
		//debugger
		if(deepPropCheck != undefined) {
			return rawmatch.substr(0,1) + deepPropCheck;	
		}
		return rawmatch;
	}).replace(noSkipReg, function(raw,match,pos) {
		if(raw.substr(0,1)=="*") {
			return raw.substr(1);
		};
		return raw;
	})
}
function useComponent(currentElement,componentObject) {
	let processAttrs = componentObject.attrConstants;
	let attrValsMapEntries = processAttrs.map(attr=> {
		attr = attr.trim();
		return [attr,currentElement.getAttribute(attr)]
	});
	let compo = {
		data: currentElement.innerHTML
	};
	let attrValsMap = Object.fromEntries(attrValsMapEntries);
	currentElement.innerHTML = templateStr(componentObject.node.innerHTML, {
		...attrValsMap,
		compo: compo
	}, ["@{","}"]);
}
registerElement('html-components',HTMLCompos);
})(window,document);
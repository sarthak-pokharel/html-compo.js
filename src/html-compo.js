(function(window,document){

class HTMLCompos extends HTMLElement{
	constructor() {
		super();
		let shadow = this.attachShadow({mode: 'open'});
		this.shadow = shadow;
	}
	connectedCallback() {
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
					if([...elem.children].includes(node)) {
						componentDefine(node,elem);
					}
				}
			}
		});
    });
    observer.observe(elem, { childList: true,subTree:false });
}
function registerElement(name,construct) {
	customElements.define(name,construct);
}
function componentDefine(node,defineLoc) {
	let nodeName = node.nodeName.toLowerCase();
	let attrConstants = node.getAttribute('compo-attrs') || "";
	attrConstants = attrConstants.split(",");
	let currentComponentObj = userDefinedComponents[nodeName] = {
		node: node,
		attrConstants: attrConstants,
		nodeName: nodeName
	};
	node.remove();
	registerElement(node.nodeName.toLowerCase(),class extends HTMLElement {
		constructor() {
			super();
			let shadow = this.attachShadow({mode:'open'});
		}
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
	currentElement.shadowRoot.innerHTML = templateStr(componentObject.node.innerHTML, {
		...attrValsMap,
		compo: compo
	}, ["@{","}"]);
}
registerElement('html-components',HTMLCompos);
})(window,document);
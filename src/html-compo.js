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
// window.userDefinedComponents = {};
let userDefinedComponents = {},
nodeReferences = Object.create(null);
window.nodeReferences = nodeReferences;
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
	let shadowedOrNot = node.getAttribute('fragment');
	if(shadowedOrNot && shadowedOrNot=="false") {
		shadowedOrNot = false;
	}else {
		shadowedOrNot = true;
	}
	attrConstants = attrConstants.split(",").filter(x=>!!x.trim());
	let currentComponentObj = userDefinedComponents[nodeName] = {
		node: node,
		attrConstants: attrConstants,
		nodeName: nodeName
	};
	node.remove();
	registerElement(node.nodeName.toLowerCase(),class extends HTMLElement {
		constructor() {
			super();
		}
		connectedCallback() {
			if(shadowedOrNot) {
				void this.attachShadow({mode:'open'});
			}
			useComponent(this,currentComponentObj, {
				fragment: shadowedOrNot
			});
		}
		attributeChangedCallback() {
			let referenceVal = this.getAttribute('ref');
			if(referenceVal!=null) {
				nodeReferences[referenceVal] = this;
			}
		}
		static get observedAttributes() {
			return ['ref'];
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
function useComponent(currentElement,componentObject,options) {
	let processAttrs = componentObject.attrConstants;
	let attrValsMapEntries = processAttrs.map(attr=> {
		attr = attr.trim();
		return [attr,currentElement.getAttribute(attr)]
	});
	currentElement.shadowRoot.innerHTML = currentElement.innerHTML;
	let compo = {
		componentName: currentElement.nodeName.toLowerCase()
	};
	let componentInnerData = componentObject.node.innerHTML;
	let componentVarBraces = ["@{","}"];
	let attrValsMap = Object.fromEntries(attrValsMapEntries);
	let componentPassVars = {
		...attrValsMap,
		compo: compo
	};
	if(options.fragment) {
		compo.data = currentElement.shadowRoot.innerHTML;
		compo.componentObject = currentElement.shadowRoot;
		currentElement.shadowRoot.innerHTML = templateStr(
			componentInnerData, componentPassVars, componentVarBraces
		);
	}else {
		compo.data = currentElement.innerHTML;
		compo.componentObject = currentElement;
		currentElement.innerHTML = templateStr(
			componentInnerData, componentPassVars, componentVarBraces
		);
	}
}
registerElement('html-components',HTMLCompos);


let htmlCompo = {
	getComponent(reference) {
		if(!reference) errorThrow("At least 1 argument required!");
		if(typeof reference != "string") errorThrow("First argument 'reference' must be a string");
		let returnNode = nodeReferences[reference];
		if(!returnNode) {
			return null;
		}
		return returnNode.shadowRoot;
	}
}
window.htmlCompo = htmlCompo;
function errorThrow(msg) {
	throw new Error(msg);
}

})(window,document);


(function(window,document){
let HTMLComponentsClass = [];
let definationTags = ['html-components','h-c'];

for(let definationTag of definationTags) {
	let currentClass = (class extends HTMLElement {
		constructor() {
			super();
			let shadow = this.attachShadow({mode: 'open'});
			this.shadow = shadow;
		}
		connectedCallback() {
			this.style.display = 'none';
			this.shadow.innerHTML = this.innerHTML;
			this.innerHTML = "";
			processComponentDefinationContainer(this);
		}
	});
	HTMLComponentsClass.push([definationTag,currentClass]);
	registerElement(definationTag,currentClass);
}

let userDefinedComponents = {},
nodeReferences = Object.create(null);
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
	if(shadowedOrNot && shadowedOrNot=="true") {
		shadowedOrNot = true;
	}else {
		shadowedOrNot = false;
	}
	attrConstants = attrConstants.split(",").filter(x=>!!x.trim());
	let currentComponentObj = userDefinedComponents[nodeName] = {
		node: node,
		attrConstants: attrConstants,
		nodeName: nodeName
	};
	node.remove();
	let nodeNameRegister = node.nodeName.toLowerCase();
	registerElement(nodeName,class extends HTMLElement {
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
	// debugger
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
		let deepPropCheck;
		try {
			deepPropCheck = Function('locals','return locals.'+match+';')(locals);
		}catch(err) {}
		//If not found as a literal
		if(deepPropCheck != undefined) {
			return rawmatch.substr(0,1) + deepPropCheck;	
		}
		return rawmatch;
	}).replace(noSkipReg, function(raw,match,pos) {
		if(raw.substr(0,1)=="*") {
			return raw.substr(1);
		};
		return raw;
	});
}

function useComponent(currentElement,componentObject,options) {
	let processAttrs = componentObject.attrConstants;
	let attrValsMapEntries = processAttrs.map(attr=> {
		attr = attr.trim().split("=");
		let rval = [attr[0]];
		let val = currentElement.getAttribute(attr[0]);
		if(val==null) {
			if(1 in attr) {
				rval.push(attr[1])
			}else {
				rval.push("null");
			}
		}else {
			rval.push(val);
		}
		return rval;
	});
	let compo = { //'self' obj
		componentName: currentElement.nodeName.toLowerCase()
	};
	let componentInnerData = componentObject.node.innerHTML;
	let componentVarBraces = ["@{","}"];
	let attrValsMap = Object.fromEntries(attrValsMapEntries);
	let componentPassVars = {
		...attrValsMap,
		self:compo
	};
	if(options.fragment) {
		currentElement.shadowRoot.innerHTML = currentElement.innerHTML;
		compo.data = currentElement.shadowRoot.innerHTML;
		compo.componentObject = currentElement.shadowRoot;
		currentElement.innerHTML = "";
		currentElement.shadowRoot.innerHTML = templateStr(
			componentInnerData, componentPassVars, componentVarBraces
		);
	}else {
		compo.data = currentElement.innerHTML;
		currentElement.innerHTML = "";
		compo.componentObject = currentElement;
		currentElement.innerHTML = templateStr(
			componentInnerData, componentPassVars, componentVarBraces
		);
	}
};

class HtmlCompoFunc {
	no_parameter = Symbol('no_paramerter');
	constructor(node) {
		this.mainNode = node;
		this.validNode = node.shadowRoot || node;
		this.node = node;
	}
	html(cont=this.no_parameter) {
		if(cont==this.no_parameter) {
			return this.validNode.innerHTML;
		}else {
			this.validNode.innerHTML = cont;
		}
	}
	attr(name=this.no_parameter,value=this.no_parameter){
		if(name==this.no_parameter) {
			return ;
		}
		if(value == this.no_parameter) {
			return this.node.getAttribute(name);
		}
		this.node.setAttribute(name,value);
	}
}

let htmlCompo = {
	getComponent(reference) {
		if(!reference) errorThrow("At least 1 argument required!");
		if(typeof reference != "string") errorThrow("First argument 'reference' must be a string");
		let returnNode = nodeReferences[reference];
		if(!returnNode) {
			return null;
		}
		return new HtmlCompoFunc(returnNode);
	}
}
window.htmlCompo = htmlCompo;
function errorThrow(msg) {
	throw new Error(msg);
}

})(window,document);
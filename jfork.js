/*!
 * jfork JavaScript Framework v1.0
 * http://jfork.com/
 *
 * Copyright 2012 The Jeffries Company and other contributors
 * Released under the MIT license
 * https://github.com/JeffriesCo/JFork/blob/master/LICENSE
 */


/*
	TODO:
		- Is Page Ready Check
		- Add Datatypes in
		- Add Base Objects - AJAX etc
		- Remove all jQuery dependencies - need basic DOM manipulation then
		- Make sure to keep in mind, this is not meant to be a dom framework - others have done well at it

*/

(function(window,undefined){

	var is = {
		"Number":	function(o){ return ((o || o==0) && !isNaN(o) && o.constructor == Number) ? true : false; },
		"Function":	function(o){ return (o instanceof Function) ? true : false;},
		"NodeList":	function(o){ return (o && is["Number"](o.length) && is["Function"](o.item)) ? true : false;}, //typeof el.length == 'number' && typeof el.item == 'function' && typeof el.nextNode == 'function' && typeof el.reset == 'function'
		"Date":		function(o){ return (o instanceof Date) ? true : false;},
		"Element":	function(o){ return o && ("undefined" !== typeof o.childNodes || o.nodeType) ? true : false; },
		"Array":	function(o){ return (o && o.constructor == Array) ? true : false; },
		"Object":	function(o){ return (o && typeof o=="object" && !is["Array"](o) && !is["Element"](o) && !is["Date"](o) && !is["NodeList"](o)) ? true : false;},
		"String":	function(o){ return (typeof o == 'string') ? true : false;},
		"Boolean":	function(o){ return (typeof o == "boolean") ? true : false;},
		"Null":		function(o){ return (o === null) ? true : false; },
		"RegExp":	function(o){ return (o instanceof RegExp) ? true : false; },
		"Undefined":function(o){ return (o === undefined) ? true : false; },
		"Integer":	function(o){ return (is["Number"](o) && ((o + "").indexOf(".")==-1)) ? true : false; },
		"Variant":	function(o){ return true; }
	};
	
	//Add is page Ready Check
	
	var ie = (function(){
		var undef, v = 3, div = document.createElement('div'), all = div.getElementsByTagName('i');
		while(div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->', all[0]){}
		return v > 4 ? v : undef;
	}());
	
	var addEvent = function(elem,type,func){
		if(elem.attachEvent){
			elem['e'+type+func] = func;
			elem[type+func] = function(){elem['e'+type+func]( window.event );};
			elem.attachEvent( 'on'+type, elem[type+func] );
		} else {
			elem.addEventListener(type,func,false);
		}
	};
	
	var parseJSON = function(jsonString){
		if(!jfork.isString(jsonString)){ return null; }
		
		var rvalidchars = /^[\],:{}\s]*$/;
		var rvalidescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g;
		var rvalidtokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
		var rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g;
		
		jsonString = jsonString.replace(/^\s+|\s+$/g,"");
		
		if(window.JSON && window.JSON.parse){
			return window.JSON.parse( jsonString );
		} else if(rvalidchars.test(jsonString.replace(rvalidescape,"@").replace(rvalidtokens,"]").replace(rvalidbraces,""))){
			return ( new Function( "return " + jsonString ) )();
		} else {
			throw new Error("Cannot Parse JSON String.");
		}
	};
	
	var listen = function(o,name,getter,setter){
		if(ie < 8){
			if(!o.propertyChangeHandlers){ o.propertyChangeHandlers = {}; }
			if(o.propertyChangeHandlers[name]){
				o.detachEvent("onpropertychange", o.propertyChangeHandlers[name]);
			}
			//getter = (is.Object(getter()) || is.Element(getter())) && !(is.Boolean(getter())) ? getter() : getter;
			
			var onPropertyChange = function(e){
				if(e.propertyName == name){
					o.detachEvent("onpropertychange", onPropertyChange);
					setter(o[name]);
					o[name] = getter;
					o[name].toString = getter;
					o.attachEvent("onpropertychange", onPropertyChange);
				}
			};
			o[name] = getter;
			o[name].toString = getter;
			o.attachEvent("onpropertychange",onPropertyChange);
			o.propertyChangeHandlers[name] = onPropertyChange;
		} else {
			Object.defineProperty(o,name,{get:getter,set:setter,configurable:true});
		}
	};
	
	var looper = function(arrOrObj,action){
		if(is.Array(arrOrObj)){
			for(var i=0; i<arrOrObj.length; i++){
				action(i,arrOrObj[i],arrOrObj);
			}
		} else {
			for(var o in arrOrObj){
				action(o,arrOrObj[o],arrOrObj);
			}
		}
	};
	
	var clone = function(obj){
		var rtnObj = {};
		for(var o in obj){
			if(is.Object(obj[o])){
				rtnObj[o] = clone(obj[o]); 
			} else {
				rtnObj[o] = obj[o]; 
			}
		}
		return rtnObj;
	};
	
	var bind = function(func,context){
		return function(){
			return func.apply(context,Array.prototype.slice.call(arguments));
		};
	};
	
	var getKeys = function(o){
		var keys = [];
		for(var i in o){ keys.push(i); }
		return keys;
	};
	
	
	//Add Class
	var Classes = [];
	var Class = function(def){

		var newClass, construct, signature = {dynamic:{public:{methods:{},variables:{}},private:{methods:{},variables:{}}},static:{public:{methods:{},variables:{}},private:{methods:{},variables:{}}}};
		var extendClass=null;
		
		if(def.extend){
			for(var i=0; i<Classes.length; i++){
				if(def.extend === Classes[i].Class){
					extendClass = Classes[i];
					signature.dynamic = clone(extendClass.signature.dynamic);
				}
			}
			if(extendClass == null){
				throw new Error("Class to extend was not found.");	
			}
			construct = def.construct || extendClass.construct;
			
		} else {
			construct = def.construct || function(){};
		}
		
		delete def.construct;
		delete def.extend;
		
		for(var d in def){
			var name = d.replace("private","").replace("public","").replace("static","").replace(/^\s+|\s+$/g,"");
			signature[d.indexOf("static")!=-1 ? "static" : "dynamic"][d.indexOf("private")!=-1 ? "private" : "public"][def[d] instanceof Function ? "methods" : "variables"][name] = def[d];
		};
		
		var createContext = function(){
			if(ie < 8){
				var elem = document.createElement("class");
				document.body.appendChild(elem);
				return elem;
			} else if(ie < 9){
				var elem = document.createElement("class");
				return elem;
			} else {
				return {};	
			}
		};
		
		var mergeDynamicSignatures = function(sig1,sig2){
			for(var x in sig2.public.methods){
				sig1.public.methods[x] = sig2.public.methods[x];
			}
			for(var x in sig2.public.variables){
				sig1.public.variables[x] = sig2.public.variables[x];
			}
			for(var x in sig2.private.methods){
				sig1.private.methods[x] = sig2.private.methods[x];
			}
			for(var x in sig2.public.variables){
				sig1.private.variables[x] = sig2.private.variables[x];
			}
			return sig1;
		};
		
		var addToContext = function(obj,context,extending){
			extending = extending || context;
			looper(obj,function(i,o,p){
				if(is.Function(o)){	
					extending[i] = bind(o,context);
				} else {
					listen(extending,i,function(){ return p[i];  },function(x){ p[i]=x; });	
				}
			});
		};
	

	
		//---Build the private static context---
		var privateStaticContext = createContext();
		//Public Static Variables
		looper(signature.static.public.variables,function(i,o){ 
			listen(privateStaticContext,i,function(){ return newClass[i];  },function(x){ newClass[i]=x; });	
		});
		//Public Static Methods	
		addToContext(signature.static.public.methods,privateStaticContext);
		//Private Static Variables
		addToContext(signature.static.private.variables,privateStaticContext);
		//Private Static Methods	
		addToContext(signature.static.private.methods,privateStaticContext);
		
		
		//Build the new class instance creator
		newClass = function(){
			if(!(this instanceof newClass)){ return null; }
			
			var parentClass=null, privateDynamicContext=null, instance=createContext(), dynamicSignature=clone(signature.dynamic), args=arguments; //Array.prototype.slice.call(arguments);

			//---Build the private dynamic context---
			if(extendClass){ //Note: js only allows for two options due to limitions: 1. extend only one deep, or 2. no super, 3.(doing this one) super is only 1 deep - does not bring anything from its parent..
			
				//parentClass = new extendClass.Class(args);
				function F(){ return extendClass.Class.apply(this, args); }
				F.prototype = extendClass.Class.prototype;
				parentClass = new F();
				
				privateDynamicContext = extendClass.instances[extendClass.instances.length-1].privateDynamicContext;
				listen(privateDynamicContext,"parent",(ie < 8 ? parentClass : function(){ return parentClass; }),function(x){ throw new Error("You cannot set super."); });	
			} else {
				privateDynamicContext = createContext();
			}
			
			//Public Static Variables
			looper(signature.static.public.variables,function(i,o){ 
				listen(privateDynamicContext,i,function(){ return newClass[i];  },function(x){ newClass[i]=x; });	
			});
			//Public Static Methods	
			addToContext(signature.static.public.methods,privateDynamicContext);
			//Private Static Variables
			addToContext(signature.static.private.variables,privateDynamicContext);
			//Private Static Methods	
			addToContext(signature.static.private.methods,privateDynamicContext);
			//Public Dynamic Variables
			addToContext(dynamicSignature.public.variables,privateDynamicContext);
			//Public Dynamic Methods	
			addToContext(dynamicSignature.public.methods,privateDynamicContext);
			//Private Dynamic Variables
			addToContext(dynamicSignature.private.variables,privateDynamicContext);
			//Private Dynamic Methods	
			addToContext(dynamicSignature.private.methods,privateDynamicContext);
		
			
			
			//Public Static Variables
			looper(signature.static.public.variables,function(i,o){
				listen(instance,i,function(){ return newClass[i];  },function(x){ newClass[i]=x; });	
			});
			//Public Static Methods	
			addToContext(signature.static.public.methods,privateStaticContext,instance);
			//Public Dynamic Variables
			addToContext(dynamicSignature.public.variables,privateDynamicContext,instance);
			//Public Dynamic Methods	
			addToContext(dynamicSignature.public.methods,privateDynamicContext,instance);
			
			instance.dynamicSignature = dynamicSignature;
			instance.signature = signature;
			instance.privateDynamicContext = privateDynamicContext;

			for(var i=0; i<Classes.length; i++){
				if(newClass === Classes[i].Class){
					Classes[i].instances.push({instance:instance,privateDynamicContext:privateDynamicContext,dynamicSignature:dynamicSignature});
					break;
				}
			}
			
			//Invoke the constructor
			construct.apply(privateDynamicContext,args);
			
			//Return the new instance
			return instance;
		};

		//Public Static Variables
		looper(signature.static.public.variables,function(i,o){
			newClass[i] = o;
		});
		//Public Static Methods
		addToContext(signature.static.public.methods,privateStaticContext,newClass);

		
		Classes.push({signature:signature,construct:construct,Class:newClass,privateStaticContext:privateStaticContext,instances:[]});
		return newClass;
	};
	
	//JFork Setup
	var jfork = Class;
	jfork.Class = Class;
	
	//JFork is
	jfork.is = function(o){
		for(var i in is){
			if(is[i](o)){ return i;	}
		}
		return null;
	};
	for(var i in is){
		jfork.is[i] = is[i];	
		jfork["is"+i] = is[i];
	}

	
	//Datatypes
	jfork.datatype = function(def){
		
	};
	
	/*
	Primary Datatypes
	
	String
	Number
	Array
	Element
	Function
	Date
	Object
	Event
	HashMap
	Tree
	Color
	Style
	Repeater
	Error
	Browser
	Window
	NodeList
	Cookie
	Arguments
	Boolean
	Stack
	Queue
	Expression
	
	
	
	Primary Classes - Non DOM
	
	AJAX
	Poster
	JSON
	Patterns
	History	
	Animation
	
	
	Primary Classes - DOM
	
	Panel
	Canvas
	Scroller
	
	*/
	
	
	
	
	
	
	
	jfork.Panel = jfork.Class({
		
		elem:null,
		isOpen:false,
		displayType:"block",
		events:{init:function(){},open:function(){},close:function(){}},
		
		construct:function(elem,args){
			if(!jfork.isElement(elem)){ throw new Error("Element is required."); }
			this.elem = elem;
			this.events = {init:function(){},open:function(){},close:function(){},onCoverClick:function(){}};
			for(var e in this.events){
				if(args[e] && this.events[e]){ this.events[e] = args[e]; }
			}
			if(args.isOpen){ this.isOpen = true; }
			if(args.appendTo){
				this.elem.parentNode.removeChild(this.elem);
				args.appendTo.appendChild(this.elem);
			}
		},
		initialize:function(){
			this.events.init.apply(this,arguments);
			if(this.isOpen){
				this.open();
			}
		},
		open:function(){
			this.elem.style.display = this.displayType;
			this.isOpen = true;
			this.events.open.apply(this,arguments);
		},
		close:function(){
			this.elem.style.display = "none";
			this.isOpen = false;
			this.events.close.apply(this,arguments);
		}
	});
	
	
	jfork.Dialog = jfork.Class({
		
		extend:jfork.Panel,
		
		"static zIndex":1001,
		cover:null,
		events:{init:function(){},open:function(){},close:function(){},onCoverClick:function(){}},
		
		open:function(){
			var that=this;
			
			if(this.cover == null){
				this.cover = document.createElement("div");
				this.cover.id = this.elem.id + "_cover";
				this.cover.className = "jfork_Dialog_cover";
				this.cover.style.position = "fixed";
				this.cover.style.top = "0px";
				this.cover.style.left = "0px";
				this.cover.style.width = "100%";
				this.cover.style.height = "100%";
				this.cover.style.display = "none";
				document.body.appendChild(this.cover);
				
				addEvent(this.cover,"click",function(){
					that.events.onCoverClick.apply(that,[]);
				});
			}
			
			this.cover.style.zIndex = this.zIndex;
			this.cover.style.display = "block";
			
			this.parent.open.apply(this.parent,arguments);
			
			this.zIndex = this.zIndex + 1;
			this.elem.style.zIndex = this.zIndex;
			this.elem.style.top = Math.floor((window.innerHeight - this.elem.offsetHeight)/2) + "px";
			this.elem.style.left = Math.floor((window.innerWidth - this.elem.offsetWidth)/2) + "px";
		},
		close:function(){
			this.cover.style.display = "none";
			this.parent.close();
		}
	});
	
	
	
	//TODO: Close Group, Close All, get
	jfork.PanelFactory = jfork.Class({
		
		"storage":{},
		
		"private isPageLoaded":false,
		
		construct:function(){
			this.storage = {};
		},
		
		initialize:function(){
			this.isPageLoaded = true;
			for(var s in this.storage){
				if(document.getElementById(s)){
					this.storage[s].instance = this.create(s,this.storage[s].args);
					this.storage[s].instance.initialize();
				} else {
					delete this.storage[s];
				}				
			}
		},
		
		toggle:function(name){
			if(this.storage[name]){
				if(this.storage[name].instance.isOpen){
					this.close(name);
				} else {
					this.open(name);
				}
			}
		},
		
		open:function(name,args){
			if(this.storage[name]){
				for(var s in this.storage){
					if(this.storage[s].group && s != name && this.storage[s].group == this.storage[name].group){
						this.storage[s].instance.close();
					}
				}
				this.storage[name].instance.open.apply(this.storage[name].instance,args);
			}
		},
		
		close:function(name){
			if(this.storage[name]){
				this.storage[name].instance.close();
			}
		},
		
		get:function(name){
			if(this.storage[name]){
				return this.storage[name].instance;
			}
		},
		
		add:function(name,args){
			var group = args.group || false;
			delete args.group;
			
			this.storage[name] = {args:args,group:group};
			
			if(this.isPageLoaded){
				this.storage[name].instance = this.create(name,args);
			}
		},
		
		"private create":function(name,args){
			args = args || {};
			return new jfork.Panel(document.getElementById(name),args);
		}
		
	});
	
	
	
	jfork.DialogFactory = jfork.Class({
		
		extend:jfork.PanelFactory,
			
		"private create":function(name,args){
			args = args || {};
			return new jfork.Dialog(document.getElementById(name),args);
		}
	});
	
	
	
	
	jfork.AJAX = jfork.Class({
			
		"public static send":function(args){
			if(!args.url){ return false; }
			
			var method = args.method || "GET";
			
			
			var XMLhttp = this.getRequest();
			XMLhttp.abort();
			XMLhttp.onreadystatechange=function() {
				if(XMLhttp.readyState == 4){
					if(XMLhttp.status == 200){
						if(args.onComplete){
							args.onComplete(XMLhttp.responseText,XMLhttp);	
						}
					} else {
						if(args.onFail){
							args.onFail(XMLhttp.responseText,XMLhttp);	
						}
					}
				}
			};
			
			var dataString = this.buildArgs(args.data || {});
			
			if(method == "POST"){
				XMLhttp.open("POST", args.url, true);
				XMLhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
				//XMLhttp.setRequestHeader("Content-length", dataString.length);
				//XMLhttp.setRequestHeader("Connection", "close");
				XMLhttp.send(dataString);
			} else {
				if(args.url.indexOf("?") == -1){ args.url += "?"; }
				if(args.url.indexOf("=") != -1){ args.url += "&"; }	
				XMLhttp.open("GET", args.url+dataString, true);
				XMLhttp.send("");
			}
		},
		
		"public static getRequest":function(){
			var XMLhttp = false; 		
			if(window.XMLHttpRequest && !(window.ActiveXObject)) {
				try {
					XMLhttp = new XMLHttpRequest();
				} catch(e) {
					XMLhttp = null;
				}
			} else if(window.ActiveXObject) {
				try {
					XMLhttp = new ActiveXObject("Msxml2.XMLHTTP");
				} catch(e) {
					try {
						XMLhttp = new ActiveXObject("Microsoft.XMLHTTP");
					} catch(e) {
						XMLhttp = null;
					}
				}
			}
			return XMLhttp;
		},
		
		"private static buildArgs":function(obj){
			var str = "";
			for(var o in obj){
				if(is.Array(obj[o])){
					for(var i=0; i<obj[o].length; i++){
						if(str.indexOf("=") != -1){ str += "&"; }
						str += encodeURIComponent(o) + "=" + encodeURIComponent(obj[o][i]);
					}
				} else {
					if(str.indexOf("=") != -1){ str += "&"; }
					str += encodeURIComponent(o) + "=" + encodeURIComponent(obj[o]);
				}
			}
			return str;
		}
	});
	
	
	
	jfork.API = jfork.Class({
		
		"private apiCalls":{},
		"private onComplete":function(){},
		
		construct:function(apiCalls,onComplete){
			this.apiCalls = apiCalls;
			this.onComplete = onComplete || function(){ return true; };
		},
		
		send:function(name,args){ //args:{type:"GET",params:{},data:{},onSuccess:{},onFail:{},onComplete:{}}
			var that = this;
			args = args || {};
			var path = this.getPath(name, args.params);
			if(!path){ return; }
			
			args.data = args.data || {};
			args.method = args.method == "POST" ? "POST" : "GET";
			args.onSuccess = args.onSuccess || function(){};
			args.onFail = args.onFail || function(){};
			args.onComplete = args.onComplete || function(){};
			
	
			jfork.AJAX.send({url:path,method:args.method,data:args.data,onComplete:function(responseText){
				var json = parseJSON(responseText);
				if(json){
					var pass = that.onComplete(json,args);
					if(pass){
						args.onSuccess(json,args);
					} else {
						args.onFail(json,args);
					}
					args.onComplete(json,args);
				} else {
					args.onFail({message:"Unable to parse JSON."},args);
				}
			},onFail:function(message){
				args.onFail({message:message},args);
			}});
		},
		
		"private getPath":function(name, params){
			if(this.apiCalls[name]){
				var path = this.apiCalls[name];
				params = params || {};
				for(var param in params){
					path = path.replace("{"+param+"}",params[param]);
				}
				if(path.indexOf("{") > -1 || path.indexOf("}") > -1){
					return false;
				}
				return path;			
			} else {
				return false;
			}
		}
		
	});
	
	
	
	
	
	jfork.notification = new jfork.Class({
		
		"private onSet":null,
		"private onOpen":null,
		"private onClose":null,
		"private queue":null,
		"private elem":null,
		"private timeout":null,
		"private isOpen":false,
		"private delay":1000,
		
		construct:function(elem,options){
			options = options || {};
			this.queue = [];
			this.elem = elem;
			this.delay = options.delay || 1000;
			this.onSet = options.set || false;
			this.onOpen = options.open || false;
			this.onClose = options.close || false;
		},
		
		"private open":function(){
			if(this.isOpen){ return; }
			this.isOpen = true;
			if(this.onOpen){
				this.onOpen.apply(this,[this.elem]);
			} else {
				this.elem.style.display = "block";
			}
		},
		
		"private close":function(){
			if(!this.isOpen){ return; }
			this.isOpen = false;
			if(this.onClose){
				this.onClose.apply(this,[this.elem]);
			} else {
				this.elem.style.display = "none";
			}
		},
		
		"private set":function(msg){
			if(this.onSet){
				this.onSet.apply(this,[this.elem,msg]);
			} else {
				this.elem.innerHTML = msg;
			}
		},
	
		"private next":function(){
			var that=this;
			this.timeout = null;
			if(this.queue.length > 0){
				this.set(this.queue.pop());
				this.open();
				this.timeout = setTimeout(this.next,this.delay);
			} else {
				this.close();
			}
		},
		
		notify:function(msg){
			this.queue.push(msg);
			if(!this.timeout){
				this.next();
			}
		},
		
		clear:function(){
			this.close();
			clearTimeout(this.timeout);
		}
		
	});






	jfork.storage = new jfork.Class({
		
		"private primaryKey":null,
		"public static isAvailable":(function(){
			try {
				if('localStorage' in window && window['localStorage'] !== null){
					return true;
				}
			} catch (e) {
				return false;
			}
		})(),
		
		construct:function(primaryKey){
			this.primaryKey = primaryKey;
		},
		
		"public set":function(key,value){
			if(!this.isAvailable){ return; }
			
			var fullKey = this.primaryKey + ":" + key;
			//Check if value is object - then stringify it
			if(jfork.isObject(value)){
				var stringify = function(obj){
					var t = typeof (obj);  
					if (t != "object" || obj === null) {
						obj = String(obj).replace(/"/g,"");
						if (t == "string") {
							obj = '"'+obj+'"';  
						}
						return obj;
					}  
					else {  
						var n, v, json = [], arr = (obj && obj.constructor == Array);  
						for (n in obj) {  
							v = obj[n]; t = typeof(v);  
							if (t == "string") v = '"'+v.replace(/"/g,"")+'"';  
							else if (t == "object" && v !== null) v = stringify(v);  
							json.push((arr ? "" : '"' + n + '":') + String(v));  
						}  
						return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");  
					}  
				};
				value = stringify(value) + ":isObject";
			}
			//Store the key value pair
			window.localStorage.setItem(fullKey, value);
			//Add the key to the keys object
			var keys = window.localStorage.getItem(this.primaryKey+":allKeys") || "";
			keys = keys.split(",");
			for(var i=0; i<keys.length; i++){
				if(keys[i] == key){
					keys.splice(i,1);
					break;
				}
			}
			keys.push(key);
			window.localStorage.setItem(this.primaryKey+":allKeys",keys.join(","));
		},
		"public get":function(key){
			if(!this.isAvailable){ return; }
			
			var value = window.localStorage.getItem(this.primaryKey+":"+key);
			
			//Check if object
			if(value){
				var valueSplit = value.split(":");
				if(valueSplit.pop() == "isObject"){
					value = eval("(" + valueSplit.join(":") + ")");
				}
			}
			
			return value;
		},
		"public remove":function(key){
			if(!this.isAvailable){ return; }
			//Remove the key
			window.localStorage.removeItem(this.primaryKey+":"+key);
			//Remove the key from the keys object
			var keys = window.localStorage.getItem(this.primaryKey+":allKeys") || "";
			keys = keys.split(",");
			for(var i=0; i<keys.length; i++){
				if(keys[i] == key){
					keys.splice(i,1);
					break;
				}
			}
			window.localStorage.setItem(this.primaryKey+":allKeys",keys.join(","));
		},
		"public getAll":function(){
			if(!this.isAvailable){ return; }
			
			var keys = window.localStorage.getItem(this.primaryKey+":allKeys") || "";
			keys = keys.split(",");
			var keyValueMap = {};
			for(var i=0; i<keys.length; i++){
				keyValueMap[keys[i]] = this.get(keys[i]);
			}
			return keyValueMap;
		},
		"public clear":function(){
			if(!this.isAvailable){ return; }
			
			var keys = window.localStorage.getItem(this.primaryKey+":allKeys") || "";
			keys = keys.split(",");
			for(var i=0; i<keys.length; i++){
				this.remove(keys[i]);
			}
		}
		
	});




	
	window.jfork = jfork;

})(window);



















/*




var Library = function(args){
	var clazzes = {};
	
	var buildSignature = function(name,def){
		var signature = {construct:function(){},methods:[],variables:[]};//{name:name,value:value,isPrivate:bool,isStatic:bool}
		//Get Constructor
		signature.construct = def[name] || function(){};
		delete def[name];
		
		var isStatic, isPrivate, isMethod, name;
		for(var m in def){
			isStatic = m.indexOf("static") > -1 ? true : false;
			isPrivate = m.indexOf("private") > -1 ? true : false;
			isMethod = is.Function(def[m]) ? true : false;
			name = m.replace("static","").replace("private","").replace("public","").replace(/^\s+|\s+$/g, "");
			signature[isMethod ? "methods" : "variables"].push({name:name,value:def[m],isPrivate:isPrivate,isStatic:isStatic});
		}
		
		return signature;
	};
	
	var library = function(sig,def){
		if(is.String(sig)){ sig = {name:sig}; }
		
		var signature = buildSignature(sig.name,def);
		
		if(args[sig.name] || clazzes[sig.name]){
			throw new Error("Class " + sig.name + " already exists or is a reserved name.");	
			return null;
		} else {
			//Get Constructor
			var clazz = signature.construct;
			
			//Apply inheritance
			if(sig.inherits && clazzes[sig.inherits]){
				clazz.prototype = new clazzes[sig.inherits]();
				clazz.prototype.constructor = clazzes[sig.inherits];
			}
			
			//Apply Methods
			for(var i=0; i<signature.methods.length; i++){
				if(signature.methods[i].isStatic){
					clazz[signature.methods[i].name] = signature.methods[i].value;	
				} else {
					clazz.prototype[signature.methods[i].name] = signature.methods[i].value;	
				}
			}
			
			//Apply Variables
			for(var i=0; i<signature.variables.length; i++){
				if(signature.variables[i].isStatic){
					clazz[signature.variables[i].name] = signature.variables[i].value;	
				} else {
					clazz.prototype[signature.variables[i].name] = signature.variables[i].value;	
				}
			}
			
			
			
			//Add new Class to the library
			clazzes[sig.name] = clazz;
			library[sig.name] = clazz;
			return library[sig.name];
		}
	};
	
	for(var a in args){
		library[a] = args[a];	
	}
	
	return library;
};

//Build the jfork object using the Library object
var jfork = Library({
	version:1.0,
	copyright:"2010-2012 The Jeffries Company, LLC",
	author:"Adam Jeffries",
	lastModified:"6/15/2012"
});
jfork.Library = Library;

//Build the is object and constructor
var isMethods = {};
for(var i in is){
	isMethods["static " + i] = is[i];	
}
isMethods.is = function(o){
	for(var i in is){
		if(is[i](o)){ return i; }	
	}
	return null;
};
jfork("is",isMethods);

//Build the Json object
jfork("JSON",{
	"static stringify":function(obj){
		var t = typeof (obj);  
	    if (t != "object" || obj === null) {
	    	obj = String(obj).replace(/"/g,"");
	        if (t == "string") {
	        	obj = '"'+obj+'"';  
	        }
	        return obj;  
	    }  
	    else {  
	        var n, v, json = [], arr = (obj && obj.constructor == Array);  
	        for (n in obj) {  
	            v = obj[n]; t = typeof(v);  
	            if (t == "string") v = '"'+v.replace(/"/g,"")+'"';  
	            else if (t == "object" && v !== null) v = this.stringify(v);  
	            json.push((arr ? "" : '"' + n + '":') + String(v));  
	        }  
	        return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");  
	    }  
	},
	"static parse":function(str){
		return eval("(" + str + ")"); 
	}
});




*/




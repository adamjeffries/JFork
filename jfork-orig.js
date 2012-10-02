/*
	Javascript FramewORK core - Copyright 2011, The Jeffries Company
	
	This work is licensed under a Creative Commons Attribution-NonCommercial-NoDerivs 3.0 Unported License
	License Link - http://creativecommons.org/licenses/by-nc-nd/3.0/
	
	JFork - a new twist on JavaScript Frameworks
*/


(function(window,document,undefined){
	
	var scripts = document.getElementsByTagName("script");
	var jforkScript = scripts[scripts.length-1];
	var args = eval("(" + jforkScript.getAttribute("args") + ")");
	
	//Type Checking
	var is = {
		"Number":	function(o){ return ((o || o==0) && !isNaN(o) && o.constructor == Number) ? true : false; },
		"Function":	function(o){ return (o instanceof Function) ? true : false;},
		"NodeList":	function(o){ return (o && is["Number"](o.length) && is["Function"](o.item)) ? true : false;},
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
	

	//JFork Query Function - Main JFork Function
	var $ = function(o){
		if(is["String"](o)){
			return document.getElementById(o);
		} else if(is["Object"](o)){
			var parent = is["Element"](o.parent) ? o.parent : document;
			
			if(is.Number(o.depth)){
				var elements = [];
				var getNodes = function(depth,elem){
					var children = elem.childNodes;
					for(var i=0; i<children.length; i++){
						if(is.Element(children[i]) && (!o.tagName || children[i].nodeName.toLowerCase()==o.tagName.toLowerCase())){
							elements.push(children[i]);
							if(depth < o.depth){ getNodes(depth+1,children[i]); }
						}
					}
				};
				getNodes(1,parent);				
			} else if(is["Array"](o.elements)){
				var elements = o.elements;
			} else {
				var elements = [];
				if(is["String"](o.tagName)){
					elements = Array.prototype.slice.call(parent.getElementsByTagName(o.tagName));
				} else if(is["Array"](o.tagName)) {
					for(var i=0; i<o.tagName.length; i++){
						elements = elements.concat(Array.prototype.slice.call(parent.getElementsByTagName(o.tagName[i])));
					}
				} else {
					elements = Array.prototype.slice.call(parent.getElementsByTagName("*"));
				}
			}
			
			var filters = {
				id:function(element,filter){		return (element.id == filter); },
				className:function(element,filter){	return $.Element.hasClass(element,filter);},
				name:function(element,filter){		return (elements[e].getAttribute("name")==filter); },
				attribute:function(element,filter){	return elements[e].getAttribute(filter) ? true : false;	},
				attributeValue:function(element,filter){
					for(var a=0; a<element.attributes.length; a++){
						if(element.attributes[a].value == filter){ return true; }
					}
					return false;
				}
			};
			
			var newElements, newSize=0;
			for(var f in filters){
				if(!o[f]){ continue; }
				
				newElements = new Array(elements.length);
				newSize=0;

				if(is["String"](o[f])){ 
					for(var e=0; e<elements.length; e++){
						if(filters[f](elements[e],o[f])){
							newElements[newSize++] = elements[e];
						}
					}	
				} else if(is["Array"](o[f])){
					for(var e=0; e<elements.length; e++){
						for(var i=0; i<o[f].length; i++){
							if(filters[f](elements[e],o[f][i])){
								newElements[newSize++] = elements[e];
								break;
							}
						}
					}
				}
				elements = (newSize==0) ? [] : ((newSize < elements.length) ? newElements.splice(0,newSize) : newElements);
			}
			return elements;
		}
		return null;
	};
	
	


	var dataType = function(name,args){
		if(!is.String(name)){ return; }
		args.construct = !is.Function(args.construct) ? function(){} : args.construct;
		
		for(var p in args.prototypes){
			args.construct.prototype[p] = args.prototypes[p];	
		}
		
		$[name] = function(){
			var newObj = $.Function.construct(args.construct,arguments);
			if(!(newObj instanceof args.construct)){
				for(var p in args.prototypes){
					newObj[p] = $.Function.bind(args.prototypes[p],newObj);	
				}
			}
			return newObj;
		};
		for(var s in args.statics){	$[name][s] = args.statics[s]; }
		
		for(var p in args.prototypes){
			$[name].prototype[p] = args.prototypes[p];	
		}

		if(args.staticPrototypes){
			for(var p in args.prototypes){
				(function(mName,method){
					$[name][mName] = function(){
						var context = arguments[0];
						return method.apply(context,Array.prototype.slice.call(arguments,1));
					};
				})(p,args.prototypes[p]);
			}
		}
		if(args.nativePrototype){
			for(var p in args.prototypes){
				(function(mName,method){
					if(is.String(mName) && !window[name].prototype[mName]){ 
						args.nativePrototype.prototype[mName] = method; 
					}
				})(p,args.prototypes[p]);
			}
		}
	};

	
	
	dataType("String",{
		staticPrototypes:true,
		nativePrototype:String,
		
		construct:function(str){ return new String(str); },
		prototypes:{
			"trim":function(){
				return this.replace(/^\s+|\s+$/g, '');
			},
			"ltrim":function(chars){
				return this.replace(new RegExp("^[" + (chars || "\\s") + "]+", "g"), "");	
			},
			"rtrim":function(chars){
				return this.replace(new RegExp("[" + (chars || "\\s") + "]+$", "g"), "");
			},
			"contains":function(chars){
				return this.indexOf(chars) == -1 ? false : true;
			},
			"capitalize":function(){
				if(this.length <= 0){ return ""; }
				return this.charAt(0).toUpperCase()+this.substr(1);
			},
			"addPadding":function(char,strSize,onRight){
				var newStr = this;
				for(var i=this.length; i<=strSize; i++){
					newStr = onRight ? newStr + char : char + newStr;
				}
				return newStr;
			},
			"toString":function(){
				return this;	
			},
			"toJSON":function(){
				return this.toString();
			},
			"clone":function(){
				return this.toString();	
			},
			"equals":function(o){
				return (this.toString() == o);
			},
			"is":function(){
				return this.constructor == String ? true : false;	
			}
		}
	});
	
	
	
	//toBase64, toBase16, 
	dataType("Number",{
		staticPrototypes:true,
		nativePrototype:Number,
		
		construct:function(num){ return new Number(num || 0); },
		prototypes:{
			"abs":function(){
				return Math.abs(this);							 
			},
			"floor":function(){
				return Math.floor(this);
			},
			"ceil":function(){
				return Math.ceil(this);	
			},
			"round":function(){
				return Math.round(this);
			},
			"range":function(low,high){
				if(this < low){ return low; }
				if(this > high){ return high; }
				return this;
			},
			"toBinary":function(bits){
				var n = this, bitArray = new Array(), bitVal, bits;
				if(n!= 0){
					//calculate the number of bits required to store the number
					bits = Math.max(Math.floor(Math.log(Math.pow(2,Math.ceil(Math.log((Number(n)+1))/Math.log(2))))/Math.log(2)), bits || 0);
					for(var  i = 0 ; i < bits ; i ++ ) {
						bitArray[i] = 0;
						bitVal = Math.pow(2,bits-i-1);
						if( n >= bitVal) {
							bitArray[i] = 1;
							n = n - bitVal;
						}
					}
				}
				bitArray = bitArray.join("");
				for(var b=bitArray.length; b<bits; b++){
					bitArray += "0" + "";
				}
				return bitArray;
			},
			"toBase16":function(bits){
				var base16 = Math.round(this).toString(16).toUpperCase();
				var len = Math.max(base16.length,bits||0)-base16.length;
				for(var i=0; i<len; i++){
					base16 = "0" + base16;
				}
				return base16;
			},
			"toString":function(){
				return this;	
			},
			"toJSON":function(){
				return this;
			},
			"clone":function(){
				return new $.Number(this);	
			},
			"equals":function(o){
				return (this == o && o.constructor && o.constructor == Number) ? true : false;
			},
			"is":function(){
				return ((this || this==0) && !isNaN(this) && this.constructor == Number) ? true : false;	
			}
		}
	});
	
	
	//shuffle, random
	dataType("Array",{
		staticPrototypes:true,
		nativePrototype:Array,
		
		construct:function(arr){ 
			return $.Array.is(arr) ? $.Array.clone(arr) : new Array(arr || 0); 
		},
		prototypes:{
			"remove":function(a,b){
				var rest = this.slice((b || a) + 1 || this.length);
				this.length = a < 0 ? this.length + a : a;
				this.push.apply(this, rest);
			},
			"contains":function(o){
				var i = this.length;
				while(i--){
					if (this[i] === o){ return true; }
				}
				return false;
			},
			"getIterator":function(){
				var arr = this;
				return {
					array:arr, length:arr.length, index:-1, item:null,
					hasNext:function(){ return (this.index < this.length-1); },
					next:function(){ this.item=this.array[++this.index]; return this.item; }
				};
			},
			"iterate":function(func){
				var i = this.getIterator();
				i.func = func;
				while(i.hasNext()){ 
					i.next(); 
					if(i.func.apply(i,[i.item,i.index])===false){ //break out of the loop anytime by returning false
						return; 
					}
				}
			},
			"first":function(){
				return this[0];
			},
			"last":function(){
				return this[this.length-1];
			},
			"isEmpty":function(){
				for(var i=0; i<this.length; i++){
					if(this[i] !== undefined && this[i] !== null){ return false; }
				}
				return true;
			},
			"initialize":function(o){
				for(var i=0; i<this.length; i++){
					this[i] = (o && o.clone) ? o.clone() : $.Object.is(o) ? $.Object.clone(o) : o;
				}
			},
			"randomize":function(){
				this.sort(function(){ return (Math.round(Math.random())-0.5); });
			},
			"toString":function(){
				var rtnString = "";
				for(var i=0; i<this.length; i++){
					if(i>0){ rtnString += ","; }
					rtnString += this[i].toString ? this[i].toString() : this[i];
				}
				return "["+rtnString+"]";
			},
			"toJSON":function(){
				var rtnString = "";
				for(var i=0; i<this.length; i++){
					if(i>0){ rtnString += ","; }
					rtnString += this[i].toJSON ? this[i].toJSON() : this[i];
				}
				return "["+rtnString+"]";
			},
			"clone":function(){
				var newArr = new Array(this.length);
				for(var i=0;i<this.length;i++){
					if($.Object.is(this[i])){
						newArr[i] = $.Object.clone(this[i]);
					} else {
						newArr[i] = this[i] && this[i].clone ? this[i].clone() : this[i];
					}
				}
				return newArr;	
			},
			"equals":function(o){
				return (this === o);
			},
			"is":function(){
				return (this && this.constructor == Array) ? true : false;	
			}
		}	 
	});
	
	
	//setPosition, setDimension, remove, replace, nextElement, prevElement, generateId, isVisible, clear, css
	dataType("Element",{
		staticPrototypes:true,
		nativePrototype:HTMLElement,
		
		construct:function(tagName){ return document.createElement(tagName || "div"); },
		prototypes:{
			"hasClass":function(className){
				if(!is.String(className)){ return false; }
				className = className.trim();
				if(!this.hasClassRegExp){ this.hasClassRegExp = new RegExp(""); }
				this.hasClassRegExp.compile("\\b" + className + "\\b");
				return this.hasClassRegExp.test(this.className);
			},
			"addClass":function(className){
				if(!is.String(className) || this.hasClass(className)){ return; }
				this.className += (this.className=="" ? "" : " ") + className;
			},
			"removeClass":function(className){
				if(!is.String(className) || !this.hasClass(className)){ return; }
				this.className = $.String.trim(this.className.replace(new RegExp("\\b" + className + "\\b", "g"), "").replace("  ", " "));
			},
			"toggleClass":function(classNameA,classNameB){
				if(this.hasClass(classNameA)){
					this.removeClass(classNameA);
					if(classNameB){ this.addClass(classNameB); }
				} else {
					this.addClass(classNameA);
					if(classNameB){ this.removeClass(classNameB); }
				}
			},
			"getId":function(){
				if(!this.id){
					var id = "";
					while(true){
						id = "GenericId_" + Math.floor(Math.random()*10000000);
						if(!document.getElementById(id)){
							this.id = id;
							break;
						}
					}
				}
				return this.id;
			},
			"css":function(o){
				var element = this;
				if($.Object.is(o)){
					for(var type in o){
						$.Style.set({element:element,type:type},o[type]);
					}
					return o;
				} else if($.Array.is(o)){
					var rtnObj = {};
					for(var i=0; i<o.length; i++){
						rtnObj[o[i]] = $.Style.get({element:element,type:o[i]});
					}
					return rtnObj;
				} else if($.String.is(o)) {
					return $.Style.get({element:element,type:o});
				}
				return null;
			},
			"getDimension":function(){
				var elem = this;
				return {height:elem.offsetHeight,width:elem.offsetWidth};	
			},
			"setDimension":function(dimensionObject){
				this.css({height:dimensionObject.height+"px",width:dimensionObject.width+"px"});
			},
			"getPosition":function(){
				var elem=this,curleft = curtop = 0;
				if (elem.offsetParent) {	
					do {
						curleft += elem.offsetLeft;
						curtop += elem.offsetTop;
					} while (elem = elem.offsetParent); 
				}
				return {top:curtop,left:curleft};
			},
			"setPosition":function(positionObject){
				this.css({top:positionObject.top+"px",left:positionObject.left+"px"});
			},
			"toggle":function(o){
				this.style.display = (this.style.display == 'none') ? 'block' : 'none';	
			},
			"create":function(o){
				o.append = o.append == undefined ? true : o.append;
				var elem = document.createElement(o.nodeName || "div");
				if(o.id){ 
					elem.id = o.id; 
				} else if(o.uniqueId) {
					$.Element.getId(elem); 	
				}
				if(o.className){ elem.className = o.className; }
				if(o.insertBefore && $.Element.is(o.insertBefore)){
					this.insertBefore(elem,o.insertBefore);
				} else if(o.append === false){
					//Do nothing
				} else {
					this.appendChild(elem);
				}
				return elem;
			},
			"remove":function(){
				if(this.parentNode){ 
					this.parentNode.removeChild(this); 
					return true;
				}
				return false;
			},
			"listen":function(prop,getter,setter){
				if(!is.String(prop) || !is.Function(getter) || !is.Function(setter)){ return; }
				var that = this;
				Object.defineProperty(that, prop, {
					get:function(){ return getter.apply(that,arguments); },
					set:function(){	setter.apply(that,arguments); }
				});
			},
			"event":function(type,action,context,remove){
				if(remove){
					$.Element.removeEvent(this,type,action,context);
				} else if(action){
					$.Element.addEvent(this,type,action,context);
				} else {
					$.Element.runEvent(this,type);
				}
			},
			"addEvent":function(type,action,context){
				$.Event.add(this,type,action,context);
			},
			"removeEvent":function(type,action,context){
				$.Event.remove(this,type,action,context);
			},
			"runEvent":function(type){
				$.Event.fire(this,type);
			},
			"toString":function(){
				return this.toString();
			},
			"toJSON":function(){
				return this.toString();
			},
			"clone":function(){
				return this;	
			},
			"equals":function(o){
				return (this === o);
			},
			"is":function(){
				return this && ("undefined" !== typeof this.childNodes || this.nodeType) ? true : false;
			}
		}	 
	});
	
	
	dataType("Function",{
		staticPrototypes:true,
		nativePrototype:Function,
		
		construct:function(f){ return new Function(f); },
		prototypes:{
			"curry":function(){
				var that = this, args = Array.prototype.slice.call(arguments);
				return function(){
					return that.apply(this,args.concat(Array.prototype.slice.call(arguments)));
				};	
			},
			"listen":function(prop,getter,setter){
				if(!is.String(prop) || !is.Function(getter) || !is.Function(setter)){ return; }
				var that = this;
				Object.defineProperty(that, prop, {
					get:function(){ return getter.apply(that,arguments); },
					set:function(){	setter.apply(that,arguments); }
				});
			},
			"bind":function(context){
				var fn = this;
				return function(){
					return fn.apply(context,arguments);
				};
			},
			"construct":function(args){
				var fn = this;
				function F(){ return fn.apply(this, args); }
				F.prototype = fn.prototype;
				return new F();
			},
			"load":function(context){
				$.Event.add(window,"load",this,context);
			},
			"toString":function(){
				return this.toString();
			},
			"toJSON":function(){
				return this.toString();
			},
			"clone":function(){
				return eval('['+this.toString()+']')[0];	
			},
			"equals":function(o){
				return (this === o);
			},
			"is":function(){
				return (this && this.constructor == Function) ? true : false;	
			}
		}	 
	});
	
	
	//clone, toString, equals, intDay, intMonth, intYear, daysInMonth, firstDayInMonth
	dataType("Date",{
		staticPrototypes:true,
		nativePrototype:Date,
		
		construct:function(d){ return new Date(d); },
		prototypes:{
			"toString":function(){
				return this.toString();
			},
			"toJSON":function(){
				return this.toString();
			},
			"clone":function(){
				return new Date(this);
			},
			"equals":function(o){
				return (this === o);
			},
			"is":function(){
				return (this && this.constructor == Date) ? true : false;	
			}
		}	 
	});
	
	
	dataType("Object",{
		staticPrototypes:true,
		nativePrototype:false,
		
		construct:function(o){
			if($.Object.is(o)){
				for(var O in o){ this[O] = o[O]; }
			}
		},
		prototypes:{
			"size":function(){
				var size = 0, key;
				for (key in this) {
					if(this.hasOwnProperty(key)) size++;
				}
				return size;
			},
			"listen":function(prop,getter,setter){
				var that = this;
				if(!is.String(prop) || !is.Function(getter) || !is.Function(setter)){ return; }
				Object.defineProperty(that, prop, {
					get:function(){ return getter.apply(that,arguments); },
					set:function(){	setter.apply(that,arguments); },
					enumerable:true
				});
			},
			"merge":function(){
				var o = {}, args = Array.prototype.slice.call(arguments), dummyObject = new $.Object();
				args.unshift(this);
				for(var i=0; i<args.length; i++){
					for(var x in args[i]){
						if(dummyObject[x] == args[i][x]){ continue; }
						o[x] = args[i][x];
					}
				}
				return o;
			},
			"values":function(){
				var values = [];
				for(var v in this){ values.push(this[v]); }
				return values;
			},
			"keys":function(){
				var keys = [];
				for(var k in this){ keys.push(k); }
				return keys;
			},
			"toString":function(){
				var rtnString = "", counter=0;
				for(var o in this){
					if(counter++ > 0){ rtnString += ","; }
					rtnString += "'"+o+"':";
					if($.Object.is(this[o])){
						rtnString += $.Object.toString(this[o]);
					} else {
						rtnString += this[o].toString ? this[o].toString() : this[o];
					}
				}
				return "{" + rtnString + "}";
			},
			"toJSON":function(){
				var rtnString = "", counter=0;
				for(var o in this){
					if(counter++ > 0){ rtnString += ","; }
					rtnString += "'"+o+"':";
					if($.Object.is(this[o])){
						rtnString += $.Object.toJSON(this[o]);
					} else {
						rtnString += this[o].toJSON ? this[o].toJSON() : this[o];
					}
				}
				return "{" + rtnString + "}";
			},
			"clone":function(){
				var newObj = {};
				for(var o in this){
					if($.Object.is(this[o])){
						newObj[o] = $.Object.clone(this[o]);
					} else {
						newObj[o] = this[o] && this[o].clone ? this[o].clone() : this[o];
					}
				}
				return newObj;
			},
			"equals":function(o){
				return (this === o);
			},
			"is":function(){
				return (this && this != window && typeof this=="object" && 
						this.constructor == Object && !this.item) ? true : false;	 
			}
		}	 
	});
	


	dataType("Event",{
		staticPrototypes:true,
		nativePrototype:Event,
		
		construct:function(type){
			//var e = document.createEvent('HTMLEvents');
			//e.initEvent('change', true, true);
			//ele.dispatchEvent(e);
			return document.createEvent(type || "HTMLEvents");
		},
		prototypes:{
			"getKeyCode":function(){
				var e = this || window.event;
				if(e.keyCode) return e.keyCode;
				if(e.which) return e.which;
				return false;
			},
			"getMouseWheel":function(){
				var e = this || window.event;
				var delta = 0;
				if (e.wheelDelta) { // IE/Opera. 
					delta = e.wheelDelta/120;
					if (window.opera) delta = -delta; //In Opera 9, delta differs in sign as compared to IE.
				} else if (e.detail) { // Mozilla case.
					delta = -e.detail/3; //Mozilla is a multiple of 3 compared to ie
				}
				return delta;
			},
			"stopDefault":function(){
				var e = this || window.event;
				if (e.preventDefault) e.preventDefault();
				e.returnValue = false;
				return false;	
			},
			"stopBubble":function(){
				var e = this || window.event;
				if(e.stopPropagation){ e.stopPropagation(); }
				if(e){
					e.cancelBubble = true;
					e.returnValue = false;
				}
				return false;
			},
			"getElement":function(){
				var e = this || window.event;
				var rtnElement = null;
				if(e.target){ 
					rtnElement = ev.target; 
				} else if(ev.srcElement) {
					rtnElement = ev.srcElement;
				}
				if(rtnElement.nodeType==3){
					rtnElement=rtnElement.parentNode;
				}
				return rtnElement;	
			},
			"getMousePosition":function(){
				e = this || window.event;
				var cursor = {left:0, top:0};
				if (e.pageX || e.pageY) {
					cursor.left = e.pageX;
					cursor.top = e.pageY;
				} else {
					cursor.left = e.clientX + (document.documentElement.scrollLeft || document.body.scrollLeft) - document.documentElement.clientLeft;
					cursor.top = e.clientY + (document.documentElement.scrollTop || document.body.scrollTop) - document.documentElement.clientTop;
				}
				return cursor;
			}
		},
		statics:{
			"storage":{},
			"getStorageIndex":function(elem,type,action,context){
				var id = $.Element.getId(elem);
				
				if(elem && type && $.Event.storage[id][type]){
					var i = $.Event.storage[id][type].length;
					while(i--){
						if($.Event.storage[id][type][action] == action && $.Event.storage[id][type][context] == context){
							return i;
						}
					}
				}
				return -1;
			},
			"fire":function(elem,type,e){
				e = e || window.event, rtnVal = true;
				var id = $.Element.getId(elem);
				if($.Event.storage[id] && $.Event.storage[id][type]){
					for(var i=0; i<$.Event.storage[id][type].length; i++){
						rtnVal &= $.Event.storage[id][type][i].action.call($.Event.storage[id][type][i].context || {},e);
					}
				} else {
					if (document.createEventObject){
						var evt = document.createEventObject();
						return elem.fireEvent('on'+type,evt)
					} else {
						var evt = document.createEvent("HTMLEvents");
						evt.initEvent(type, true, true ); // event type,bubbling,cancelable
						return !elem.dispatchEvent(evt);
					}
				}
				return rtnVal;
			},
			"add":function(elem,type,action,context){
				if(!is.Function(action) || !is.String(type) || !(is.Element(elem) || elem == window)){ return false; }
				var id = $.Element.getId(elem);
				
				if(!$.Event.storage[id]){ 
					$.Event.storage[id] = {}; 
				}
				
				if(!$.Event.storage[id][type]){ 
					$.Event.storage[id][type] = []; 
					$.Event.storage[id][type][0] = {action:action,context:context};
					
					var action = function(e){ return $.Event.fire(elem,type,e); };
					if(elem.nodeName != "undefined" || elem == window){
						if(document.addEventListener){ 
							if(type == "mousewheel" && $.Browser.type == "Firefox"){ 
								elem.addEventListener("DOMMouseScroll", action, false);
							}
							elem.addEventListener(type, action, false); 
						} else if (document.attachEvent){ 
							elem.attachEvent("on"+type, action); 
						}
					}
				} else if($.Event.getStorageIndex(elem,type,action,context) == -1) {
					$.Event.storage[id][type][$.Event.storage[id][type].length] = {action:action,context:context};
				}
			},
			"remove":function(elem,type,action,context){
				var id = $.Element.getId(elem);
				
				if($.Event.storage[id] && $.Event.storage[id][type]){
					var index = getStorageIndex(elem,type,action,context);
					if(index > -1){
						$.Event.storage[id][type].splice(index,1);
					}
				}
			}
		} 
	});
	



	dataType("HashMap",{
		staticPrototypes:true,
		
		construct:function(o){
			this.__storage = $.Object.is(o) ? o : {};
		},
		prototypes:{
			"get":function(key){
				return this.__storage[key];
			},
			"put":function(key,value){
				this.__storage[key] = value;
			},
			"clear":function(){
				this.__storage = {};
			},
			"containsKey":function(key){
				return this.__storage.hasOwnProperty(key);
			},
			"containsValue":function(value){
				for(var s in this.__storage){
					if(this.__storage[s] == value){ return true; }
				}
				return false;
			},
			"isEmpty":function(){
				return this.size() > 0 ? false : true;
			},
			"putAll":function(map){
				if(!$.Object.is(map)){ return; }
				this.__storage = $.Object.merge(this.__storage,map);
			},
			"remove":function(key){
				delete this.__storage[key];
			},
			"size":function(){
				return $.Object.size(this.__storage);
			},
			"values":function(){
				return $.Object.values(this.__storage);
			},
			"keys":function(){
				return $.Object.keys(this.__storage);
			},
			"sort":function(){
				var storageArray = new $.Array(this.size()), counter=0;
				for(var s in this.__storage){
					storageArray[counter++] = {key:s,value:this.__storage[s]};
				}
				storageArray.sort(function(a,b){ 
					if(a.key.toLowerCase() < b.key.toLowerCase()) return -1;  
       				if(a.key.toLowerCase() > b.key.toLowerCase()) return 1;  
        			return 0; 
				});
				
				this.clear();
				for(var i=0; i<storageArray.length; i++){
					this.put(storageArray[i].key,storageArray[i].value);
				}
			},
			"merge":function(hashmap){
				if(!$.HashMap.is(hashmap)){ return; }
				this.putAll(hashmap.__storage);
			},
			"toString":function(){
				return $.Object.toString(this.__storage);
			},
			"toJSON":function(){
				return $.Object.toJSON(this.__storage);
			},
			"clone":function(){
				return $.Object.clone(this.__storage);	
			},
			"equals":function(o){
				return $.Object.equals(this.__storage,o);
			},
			"is":function(){
				return (this && this.constructor == $.HashMap) ? true : false;	
			}
		}
	});
	
	
	var TreeNode = function(parent,value,level){
		this.value = value;
		this.children = [];
		this.parent = parent;
		this.level = level;
		this.isRoot = false;
	};
	
	dataType("Tree",{
		construct:function(rootKey,rootValue){
			this.nodes = {};
			this.nodes[rootKey] = new TreeNode(null,rootValue,0);
			this.nodes[rootKey].isRoot = true;
		},
		prototypes:{
			"put":function(parentKey,key,value){
				if(this.nodes[parentKey] && ! this.nodes[key]){
					this.nodes[key] = new TreeNode(parentKey,value,this.nodes[parentKey].level+1);
					this.nodes[parentKey].children.push(key);
				}
				return false;
			},
			"getKeyPath":function(key){
				var keyPath = [];
				while(this.nodes[key]){
					keyPath.push(key);
					key = this.nodes[key].parent;
					if(key == null){ break; }
				}
				return keyPath.reverse();
			},
			"getLevelKeys":function(level){
				var levelKeys = [];
				for(var n in this.nodes){
					if(this.nodes[n].level == level){ levelKeys.push(n); }
				}
				return levelKeys;
			}
		}			 
	});
	
	
	
	dataType("Color",{
		staticPrototypes:true,
		
		construct:function(color){
			if($.String.is(color) && color.match(new RegExp("^rgb","g"))){
				var rgbStart = color.indexOf("(");
				var rgb = color.substr(rgbStart+1,color.indexOf(")")-rgbStart-1).split(",");
				this.r = parseInt(rgb[0]);
				this.g = parseInt(rgb[1]);
				this.b = parseInt(rgb[2]);
			} else if($.String.is(color) && color.length==4 && color.match(new RegExp("^[#]([A-F,a-f,0-9]{3}$)","g"))){
				this.r = parseInt("0x"+color.charAt(1)+color.charAt(1));
				this.g = parseInt("0x"+color.charAt(2)+color.charAt(2));
				this.b = parseInt("0x"+color.charAt(3)+color.charAt(3));
			} else if($.String.is(color) && color.length==7 && color.match(new RegExp("^[#]([A-F,a-f,0-9]{6}$)","g"))){
				this.r = parseInt("0x"+color.substr(1,2));
				this.g = parseInt("0x"+color.substr(3,2));
				this.b = parseInt("0x"+color.substr(5,2));
			} else if($.Object.is(color)){
				this.r = $.Number.is(color.r) ? color.r : 0;
				this.g = $.Number.is(color.g) ? color.g : 0;
				this.b = $.Number.is(color.b) ? color.b : 0;
			} else {
				this.r=0;
				this.g=0;
				this.b=0;
			}
		},
		prototypes:{
			"toHex":function(){
				return "#" + $.Number.toBase16(this.r,2) + $.Number.toBase16(this.g,2) + $.Number.toBase16(this.b,2);
			},
			"toRGB":function(){
				return "rgb("+ this.r +","+ this.g +","+ this.b +")";
			},
			"blend":function(toColor, percent){
				percent = percent || 0;
				var r = Math.round(this.r+(toColor.r-this.r)*(percent));
				var g = Math.round(this.g+(toColor.g-this.g)*(percent)); 
				var b = Math.round(this.b+(toColor.b-this.b)*(percent)); 
				return new $.Color({r:r,g:g,b:b});
			},
			"toString":function(){
				return this.toHex();
			},
			"toJSON":function(){
				return this.toHex();
			},
			"clone":function(){
				return $.Object.clone(this);	
			},
			"equals":function(o){
				return $.Object.equals(this,o);
			},
			"is":function(){
				return (this && this.constructor == $.Color) ? true : false;	
			}
		}			 
	});
	
	
	dataType("Style",{
		staticPrototypes:true,
		
		construct:function(elem,type){
			this.element = elem;
			this.type = type;
		},
		prototypes:{
			"set":function(value){
				this.element.style[this.type] = value;
			},
			"get":function(){
				if(this.element.currentStyle) {
					return this.element.currentStyle[this.type];
				} else if (window.getComputedStyle){
					return document.defaultView.getComputedStyle(this.element,null)[this.type];
				}
				return null;
			}
		}			 
	});
	
	
	dataType("Repeater",{
		construct:function(o){
			var that=this;
			
			this.timeout = null;
			this.curLoop = 0;
			this.isRepeating = false;
			this.onComplete = 	$.Function.is(o.onComplete) ? o.onComplete : null;
			this.action = 		$.Function.is(o.action) ? o.action : null;
			this.millis = 		$.Number.is(o.millis) ? o.millis : 10;
			this.loops = 		$.Number.is(o.loops) ? o.loops : 100;
			this.power = 		$.Number.is(o.power) ? o.power : 1;

			this.iterator = function(){
				if(this.curLoop >= this.loops){ 
					this.action(1);
					this.curLoop = 0;
					this.isRepeating = false;
					this.onComplete();
				} else {
					this.action(1-(Math.pow(this.loops,this.power)-Math.pow(this.curLoop,this.power))/Math.pow(this.loops,this.power));
					this.curLoop++;
					this.timeout=setTimeout(function(){
						that.iterator.call(that);
					},this.millis);
				}
			};
		},
		prototypes:{
			"start":function(){
				if(!$.Function.is(this.action)){ return; }
				this.isRepeating = true;
				this.iterator();
			},
			"pause":function(){
				clearTimeout(this.timeout);
				this.isRepeating = false;
			},
			"stop":function(){
				this.pause();
				this.curStep = 0;
			}
		}			 
	});
	
	
	
	dataType("Animation",{
		construct:function(styleObject){
			var anim = new $.Repeater({
				action:function(pct){
					var newStyle = {};
					if(pct == 1){
						newStyle = anim.endStyle;
					} else {
						for(var s in anim.endStyle){
							if(anim.colorList[s]){
								newStyle[s] = anim.colorList[s].start.blend(anim.colorList[s].end,pct).toHex();
							} else if($.Number.is(anim.endStyle[s]) && $.Number.is(anim.startStyle[s])){
								newStyle[s] = anim.startStyle[s]-(anim.startStyle[s]-anim.endStyle[s])*pct;
							} else if($.String.is(anim.startStyle[s]) && $.String.is(anim.endStyle[s]) && anim.startStyle[s].match(new RegExp("[.0-9]*px$")) && anim.endStyle[s].match(new RegExp("[.0-9]*px$"))){
								newStyle[s] = parseInt(parseFloat(anim.startStyle[s])-(parseFloat(anim.startStyle[s])-parseFloat(anim.endStyle[s]))*pct) + "px";
							} else {
								newStyle[s] = anim.startStyle
							}
						}
					}
					$.Element.css(anim.element,newStyle);
				}
			});
			
			anim.endStyle = styleObject;
			anim.colorList = {};
			
			return anim;
		},
		prototypes:{
			"start":function(element){
				var that = this;
				if(!$.Element.is(element)){ return; }
				this.startStyle = $.Element.css(element,$.Object.keys(this.endStyle));
				for(var s in this.startStyle){
					if($.String.is(this.startStyle[s]) && $.String.contains(s.toLowerCase(),"color")){
						this.colorList[s] = {start:(new jfork.Color(that.startStyle[s])),end:(new jfork.Color(that.endStyle[s]))}
					}
				}
				this.isRepeating = true;
				this.element = element;
				this.iterator();
			}
		}
	});
	
	
	
	
	dataType("Error",{
		construct:function(name,msg){
			if(!this[name] || !$.String.is(msg)){ return null; }
			return {name:name,message:"'"+msg+"' "+this[name]};
		},
		prototypes:{
			InvalidArgument:"is an invalid argument.",
			InvalidSignature:"is an invalid signature.",
			IsReservedWord:"is a reserved keyword.",
			UnknownMethod:"is not a defined method.",
			MethodNotMatchingArguments:"does not match the arguments given.",
			DuplicateArgumentName:"contains duplicate argument names.",
			DuplicateMethodSignature:"is a duplicate signature."
		}
	});
	
	
	
	var BrowserTypes = {
		Chrome:		[navigator.userAgent,"Chrome"],
		Safari:		[navigator.vendor,"Apple","Version"],
		Opera:		[navigator.userAgent,"Opera"],
		Firefox:	[navigator.userAgent,"Firefox"], 
		Netscape:	[navigator.userAgent,"Netscape"],
		Explorer:	[navigator.userAgent,"MSIE","MSIE"],
		Mozilla:	[navigator.userAgent,"Gecko","rv"]
	};
	
	var BrowserOSs = {
		Android:	[navigator.userAgent,"Android"],
		Windows:	[navigator.platform,"Win"],
		Mac:		[navigator.platform,"Mac"],
		iPhone:		[navigator.userAgent,"iPhone"],
		iPad:		[navigator.userAgent,"iPad"],
		Linux:		[navigator.platform,"Linux"]
	};
	
	var BrowserVersionSearch = null;
	
	dataType("Browser",{
		statics:{
			os:(function(){
					for (var t in BrowserOSs) {
						if($.String.is(BrowserOSs[t][0]) && $.String.contains(BrowserOSs[t][0],BrowserOSs[t][1])) {
							return t;
						}
					}	
					return "Unknown Browser OS";		 
				})(),
			type:(function(){
					for (var t in BrowserTypes)	{
						if($.String.is(BrowserTypes[t][0]) && $.String.contains(BrowserTypes[t][0],BrowserTypes[t][1])) {
							BrowserVersionSearch = BrowserTypes[t].length==3 ? BrowserTypes[t][2] : t;
							return t;
						}
					}	
					return "Unknown Browser Type";
				})(),
			version:(function(){
					var search1 = navigator.userAgent.indexOf(BrowserVersionSearch);
					var search2 = navigator.appVersion.indexOf(BrowserVersionSearch);
					if (search1 >= 0) {
						return parseFloat(navigator.userAgent.substring(search1+BrowserVersionSearch.length+1));
					} else if(search2 >= 0) {
						return parseFloat(navigator.appVersion.substring(search2+BrowserVersionSearch.length+1));
					}
					return "Unknown Browser Version";
				})()
		}
	});
	
	
	
	dataType("Window",{
		statics:{
			"getSize":function(){
				var width = 0, height = 0;
				if($.Number.is(window.innerWidth)) {
					width = window.innerWidth;
					height = window.innerHeight;
				} else if(document.documentElement && (document.documentElement.clientWidth || document.documentElement.clientHeight)) {
					width = document.documentElement.clientWidth;
					height = document.documentElement.clientHeight;
				} else if(document.body && (document.body.clientWidth || document.body.clientHeight)) {
					width = document.body.clientWidth;
					height = document.body.clientHeight;
				}
				return {width:width,height:height};
			},
			"getScrollOffset":function(){
				var top = 0, left = 0;
				if($.Number.is(window.pageYOffset)) {
					top = window.pageYOffset;
					left = window.pageXOffset;
				} else if(document.body && (document.body.scrollLeft || document.body.scrollTop)) {
					top = document.body.scrollTop;
					left = document.body.scrollLeft;
				} else if(document.documentElement && (document.documentElement.scrollLeft || document.documentElement.scrollTop)) {
					top = document.documentElement.scrollTop;
					left = document.documentElement.scrollLeft;
				}
				return {top:top,left:left};
			}
		}				 
	});
	
	
	
	dataType("Util",{
		statics:{
			"BinaryToBase64":function(n){
				var key = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
				var rtn64 = "";
				for(var i=0; i<n.length; i+=6){
					rtn64 = key.charAt(parseInt(n.substring(n.length-i-6,n.length-i),2)) + rtn64;
				}
				var offset = 6-(n.length % 6);
				rtn64 = key.charAt((offset == 6) ? 0 : offset) + rtn64;
				return rtn64;
			},
			"Base64ToBinary":function(n){
				var key = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
				var rtn2 = "";
				for(var i=1; i<n.length; i++){
					rtn2 = $.Number.toBinary(key.indexOf(n.charAt(n.length-i)),6) + rtn2;
				}
				rtn2 = rtn2.substring(key.indexOf(n.charAt(0)),rtn2.length);
				return rtn2;
			},
			"stringify":function(obj){
				var t = typeof (obj);  
				if (t != "object" || obj === null) {
					if (t == "string") obj = '"'+obj+'"';  
					return String(obj);  
				}  
				else {  
					var n, v, json = [], arr = (obj && obj.constructor == Array);  
					if(arr){
						for (var i=0; i<obj.length; i++) {  
							v = obj[i]; t = typeof(v);  
							if (t == "string") v = '"'+v+'"';  
							else if (t == "object" && v !== null) v = $.Util.stringify(v);  
							json.push(String(v));  
						}  
					} else {
						for (n in obj) {  
							v = obj[n]; t = typeof(v);  
							if (t == "string") v = '"'+v+'"';  
							else if (t == "object" && v !== null) v = $.Util.stringify(v);  
							json.push('"' + n + '":' + String(v));  
						}  
					}
					return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");  
				} 
			}
		}	 
	});
	
	
	
	
	dataType("NodeList",{});
	dataType("Cookie",{});
	dataType("Arguments",{});
	dataType("Boolean",{});
	dataType("Stack",{});
	dataType("Queue",{});
	dataType("Expression",{});
	
	
	//Global - screenSize, scrollPosition, toJSON, fromJSON, 

	
	
	
	

	
	
	
	
	
	
	var buildSignature = function(classSig){
		//[{scope:"public",isAbstract:false,isFinal:false,type:"void",name:"hello",value:"what up",parameters:{a:"variant",b:"integer",...}},..]
		var signature = {static:{variables:{},methods:[],classes:[]},dynamic:{variables:{},methods:[],classes:[]},constructors:[]}; 
		
		var buildName = function(sig){
			var sigSplit = sig.split(" ");
			return sigSplit[sigSplit.length - 1].trim();
		};
		
		var buildScope = function(sig){
			var scope = "", scopes = ["public","private","protected","package"];
			for(var i=0; i<scopes.length; i++){
				if($.String.contains(sig,scopes[i])){
					if(scope != ""){ 
						throw new errorTypes.InvalidSignature(sig);
					}
					scope = scopes[i];	
				}
			}
			return scope || scopes[0];
		};
		
		var buildType = function(sig,defaultType){
			var type="", types = ["Variant","Object","Number","Date","Boolean","Integer","Float","Element","String","Array"];
			for(var i=0; i<types.length; i++){
				if($.String.contains(sig,types[i]+" ")){
					if(type != ""){ 
						throw new errorTypes.InvalidSignature(sig);
					}
					type = types[i];	
				}
			}
			return type || defaultType;
		};
		
		var buildParameters = function(sig){
			sig = sig.replace(")","");
			if(sig == ""){ return {}; }
			var params = {}, param = "", name="", type="";
			var splitSig = sig.split(",");
			for(var i=0; i<splitSig.length; i++){
				param = $.String.trim(splitSig[i]).split(" ");
				name = param[param.length-1];
				type = param.length==1 ? "Variant" : param[0];
				if(params[name]){
					throw new errorTypes.DuplicateArgumentName(sig);
				}
				params[name] = type;
			}
			return params;
		};
		
		for(var c in classSig){
			if(is.Function(classSig[c])){ //Method, Class, or Constructor
				var cSplit = c.split("(");
				if($.String.contains(c,"Constructor")){
					signature.constructors.push({
						isAbstract:$.String.contains(c,"abstract "),
						scope:buildScope(c),
						parameters:buildParameters(cSplit[1] || ""),
						value:classSig[c]
					});
				} else if(c.contains("Class ")){
					//Define this later....   Some nice recursion is required
				} else {
					signature[$.String.contains(c,"static ") ? "static" : "dynamic"].methods.push({
						name:buildName(cSplit[0]),
						isAbstract:$.String.contains(c,"abstract "),
						isFinal:$.String.contains(c,"final "),
						scope:buildScope(c),
						type:buildType(cSplit[0],"void"),
						parameters:buildParameters(cSplit[1] || ""),
						value:classSig[c]
					});
				}
			} else { //Variable
				signature[$.String.contains(c,"static ") ? "static" : "dynamic"].variables[buildName(c)] = {
					isAbstract:$.String.contains(c,"abstract "),
					isFinal:$.String.contains(c,"final "),
					scope:buildScope(c),
					type:buildType(c,"Variant"),
					value:classSig[c]
				};
			}
		}
		
		return signature;
	};


	
	var buildArgs = function(parameters,args){
		var argsObject={}, counter=0;
		for(var p in parameters){
			argsObject[p] = args[counter++];
		}
		return argsObject;
	};
	
	
	var Class = function(cSignature){
		
		var sig = buildSignature(cSignature || {});  

		var runConstructor = function(args,context){
			var i, pC, p;
			
			for(i=0; i<sig.constructors.length; i++){
				if($.Object.size(sig.constructors[i].parameters) == args.length){
					pC = 0;
					for(p in sig.constructors[i].parameters){
						if(!is[sig.constructors[i].parameters[p]](args[pC])){ break; }
						pC++;
					}
					if(pC == args.length){ break; }
				}
			}
			
			if(i < sig.constructors.length){
				sig.constructors[i].value.call(context,buildArgs(sig.constructors[i].parameters,args));
			}
		};
		
		
		var createVariableListener = function(name,variableObject,listenerObject){
			$.Object.listen(listenerObject,name,function(){
				return variableObject.value;
			},function(x){
				variableObject.value = x;
			});
		};
		
		var createMethod = function(name,methods,methodContext,context){
			if(context[name]){ return; }
			context[name] = function(){
				var m=methods.length, p, isMatch=false, pC;
				while(!isMatch&&m--){
					if(methods[m].name != name){ continue; }
					if($.Object.size(methods[m].parameters) == arguments.length){
						pC = 0;
						for(p in methods[m].parameters){
							if(!is[methods[m].parameters[p]](arguments[pC])){ break; }
							pC++;
						}
						if(pC == arguments.length){ isMatch=true; }
					}
				}
				if(isMatch){
					var args = buildArgs(methods[m].parameters,arguments);
					var rtnVal = methods[m].value.call(methodContext,args);
					return methods[m].type == "void" ? undefined : rtnVal;
				} else {
					throw new $.Error("MethodNotMatchingArguments",name);
				}
				return undefined;
			};
		};

		var buildContext = function(args){
			var context = args.context || {};
			var scopes = args.scopes || ["public"];
			
			for(var i=0; i<args.contextObjects.length; i++){
				var methodContext = args.methodContexts[i] || context;
				
				//Assign Variables to the Context
				for(var v in args.contextObjects[i].variables){
					if(scopes.contains(args.contextObjects[i].variables[v].scope)){
						createVariableListener(v,args.contextObjects[i].variables[v],context);
					}
				}
				//Assign Methods to the Context
				for(var j=0; j<args.contextObjects[i].methods.length; j++){
					if(scopes.contains(args.contextObjects[i].methods[j].scope)){
						createMethod(args.contextObjects[i].methods[j].name,args.contextObjects[i].methods,methodContext,context);
					}
				}
			}

			return context;
		};
		

		var staticContextObject = sig["static"];
		
		var privateStaticContext = buildContext({
			contextObjects:[staticContextObject],
			methodContexts:[null],
			scopes:["public","private"]
		});
		
		var publicStaticContext = buildContext({
			contextObjects:[staticContextObject],
			methodContexts:[privateStaticContext],
			scopes:["public"]
		});

		var clazz = function(){
			var that = this;
			var dynamicContextObject = $.Object.clone(sig["dynamic"]);
			
			var privateDynamicContext = buildContext({
				contextObjects:[staticContextObject,dynamicContextObject],
				methodContexts:[privateStaticContext,null],
				scopes:["public","private"]
			});
			var publicDynamicContext = buildContext({
				contextObjects:[staticContextObject,dynamicContextObject],
				methodContexts:[privateStaticContext,privateDynamicContext],
				scopes:["public"]
			});
			
			//Applys the Instance Context
			buildContext({
				context:that,
				contextObjects:[staticContextObject,dynamicContextObject],
				methodContexts:[privateStaticContext,privateDynamicContext],
				scopes:["public"]
			});
			
			runConstructor(arguments,privateDynamicContext);
		};

		//Apply the Class Context
		buildContext({
			context:clazz,
			contextObjects:[staticContextObject],
			methodContexts:[privateStaticContext],
			scopes:["public"]
		});
		
		clazz.Extends = null;
		clazz.Inherits = null;
		return clazz;
	};
	
	
	//Build the JFork Object
	$.is = is;
	$.buildSignature = buildSignature;
	$.Class = Class;
	
	for(var i in is){ $["is"+i]=is[i]; }

	window.jfork = $;
	window.$ = $;
		  
})(window,document,undefined);
				
				
				












//----------------------------------------------------------------------------//
//----------------------------------------------------------------------------//
//
//									JFORK AJAX
//
//----------------------------------------------------------------------------//
//----------------------------------------------------------------------------//
jfork.Ajax = jfork.Class({

	"public Object GETFields":{},
	"public Object POSTFields":{},
	
	"public static Object getRequest()":function(){
		var XMLhttp = false; 		
		// branch for native XMLHttpRequest object
		if(window.XMLHttpRequest && !(window.ActiveXObject)) {
			try {
				XMLhttp = new XMLHttpRequest();
			} catch(e) {
				XMLhttp = null;
			}
		// branch for IE/Windows ActiveX version
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
	
	"public static String buildArgs(Object o)":function(args){
		var str = "";
		for(var o in args.o){
			if(str.indexOf("=") != -1){ str += "&"; }
			str += o + "=" + args.o[o];
		}
		return str;
	},
	
	"public void send(String url, Function onComplete)":function(args){
		this.send(args.url,args.onComplete,function(){});
	},
	
	"public void send(String url, Function onComplete, Function onFail)":function(args){
		if(this.GETFields){
			for(var p in this.GETFields){
				if(args.url.indexOf("?") == -1){ args.url += "?"; }
				if(args.url.indexOf("=") != -1){ args.url += "&"; }
				args.url += p + "=" + this.GETFields[p];
			}
		}
		
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
		if(this.POSTFields) {
			this.POSTFields = this.buildArgs(this.POSTFields);
			XMLhttp.open("POST", args.url, true);
			XMLhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			XMLhttp.setRequestHeader("Content-length", this.POSTFields.length);
			XMLhttp.setRequestHeader("Connection", "close");
			XMLhttp.send(this.POSTFields);
		} else {
			XMLhttp.open("GET", args.url, true);
			XMLhttp.send("");
		}
	}						 
						 
});



//----------------------------------------------------------------------------//
//----------------------------------------------------------------------------//
//
//									JFORK POSTER
//
//----------------------------------------------------------------------------//
//----------------------------------------------------------------------------//
jfork.Poster = jfork.Class({
						 
	"private Object fields":{},
	"private Element form":null,
	
	"Constructor()":function(){
		this.form = jfork.Element.create(document.body,{nodeName:"form",uniqueId:true});
		this.form.name = this.form.id;
		this.form.enctype = "application/x-www-form-urlencoded";
		this.form.method = "post";
		this.form.style.display = "none";
	},
	
	"Constructor(Element form)":function(args){
		this.form = args.form;
	},
	
	"public void addField(String name, String value)":function(args){
		this.fields[args.name] = args.value;
	},
	
	"public void addField(String name, Number value)":function(args){
		this.fields[args.name] = args.value;
	},
	
	"public void addFields(Object fields)":function(args){
		for(var f in args.fields){
			this.addField(f,args.fields[f]);	
		}
	},
	
	"public void post(String url, String target)":function(args){
		this.form.target = args.target;
		this.post(args.url);
	},
	
	"public void post(String url)":function(args){
		this.form.action = args.url;
		var formString = "";
		for(var f in this.fields) { formString += "<input type='hidden' name='"+f+"' value='"+this.fields[f]+"' ><\/input>"; }
		this.form.innerHTML = formString;
		this.form.submit();
	}						 
});




//----------------------------------------------------------------------------//
//----------------------------------------------------------------------------//
//
//									JFORK CONSOLE
//
//----------------------------------------------------------------------------//
//----------------------------------------------------------------------------//
jfork.Console = jfork.Class({});




//----------------------------------------------------------------------------//
//----------------------------------------------------------------------------//
//
//								JFORK PRELOADER
//
//----------------------------------------------------------------------------//
//----------------------------------------------------------------------------//
jfork.Preloader = jfork.Class({});




//----------------------------------------------------------------------------//
//----------------------------------------------------------------------------//
//
//								JFORK IMAGE LOADER
//
//----------------------------------------------------------------------------//
//----------------------------------------------------------------------------//
jfork.ImageLoader = jfork.Class({
	
	"private Function onComplete":null,
	"private Array imageObjects":[],
	"private Array imageSrcs":[],
	
	"Constructor(Array imageSrcs)":function(args){
		this.imageSrcs = args.imageSrcs;
	},
	
	"public void setOnComplete(Function oc)":function(args){
		this.onComplete = args.oc;
	},

	"public void load()":function(args){
		var that=this, count = this.imageSrcs.length;
		this.imageObjects = new Array(this.imageSrcs.length);
		
		this.imageSrcs.iterate(function(){
			that.imageObjects[this.index] = new Image();
			that.imageObjects[this.index].onload = function(){
				count--;
				if(count==0 && that.onComplete){ that.onComplete(that.imageObjects); }
			};
			that.imageObjects[this.index].src = this.item;
		});
	}				
});




//----------------------------------------------------------------------------//
//----------------------------------------------------------------------------//
//
//									JFORK EFFECTS
//
//----------------------------------------------------------------------------//
//----------------------------------------------------------------------------//
jfork.Effects = jfork.Class({});




//----------------------------------------------------------------------------//
//----------------------------------------------------------------------------//
//
//									JFORK PATTERNS - factory, singleton
//
//----------------------------------------------------------------------------//
//----------------------------------------------------------------------------//
jfork.Patterns = jfork.Class({});



//----------------------------------------------------------------------------//
//----------------------------------------------------------------------------//
//
//									JFORK HISTORY
//
//----------------------------------------------------------------------------//
//----------------------------------------------------------------------------//
jfork.History = jfork.Class({});



//----------------------------------------------------------------------------//
//----------------------------------------------------------------------------//
//
//									JFORK PANEL
//
//----------------------------------------------------------------------------//
//----------------------------------------------------------------------------//
jfork.Panel = jfork.Class({});



//----------------------------------------------------------------------------//
//----------------------------------------------------------------------------//
//
//									JFORK ACCORDIAN
//
//----------------------------------------------------------------------------//
//----------------------------------------------------------------------------//
jfork.Accordian = jfork.Class({
	"public Element container":"",
	"public Array panels":[],
	"public Array headers":[],
	"public Number openPanelNum":-1,
	"private Object openAnimation":null,
	"private Object closeAnimation":null,
	"private Boolean isAnimating":false,	
	
	"Constructor(String id)":function(args){
		this.container = jfork(args.id);
		
		this.openAnimation = new jfork.Animation();
		this.openAnimation.power = 3;
		this.openAnimation.loops = 40;
		this.closeAnimation = new jfork.Animation({height:"0px"});
		this.closeAnimation.power = 2;
		this.closeAnimation.loops = 40;
		
		this.panels = jfork({className:"accordian_panel",parent:this.container,depth:1});
		this.buildPanels();
		if(this.panels.length > 0){ this.openPanel(0); }
	},
	"private void buildPanels()":function(){
		var that = this;
		this.panels.iterate(function(){
			this.item.css({position:"absolute",visibility:"hidden"});
			var newHeader = that.container.create({nodeName:"a",insertBefore:this.item});
			newHeader.addClass("accordian_header");
			newHeader.setAttribute("href","javascript:;");
			newHeader.innerHTML = this.item.getAttribute("title");
			newHeader.addEvent("click",function(index){
				this.openPanel(index);
			}.curry(this.index),that);
			that.headers.push(newHeader);
		});
	},
	"public void openPanel(Number panelNum)":function(args){
		if(this.isAnimating || this.openPanelNum == args.panelNum){ return; }
		if(this.openPanelNum >= 0){ this.closePanel(this.openPanelNum); }
		
		var that=this, curPanel = this.panels[args.panelNum];
		this.openAnimation.endStyle = {height:curPanel.getDimension().height+"px"};
		this.openAnimation.onComplete = function(){
			curPanel.css({overflow:"auto"});
			that.isAnimating = false;
		};
		curPanel.css({position:"relative",overflow:"hidden",height:"0px",visibility:"visible"});
		this.headers[args.panelNum].toggleClass("accordian_open");
		this.isAnimating = true;
		this.openPanelNum = args.panelNum;
		this.openAnimation.start(curPanel);
	},
	"public void closePanel(Number panelNum)":function(args){
		var curPanel = this.panels[args.panelNum];
		this.closeAnimation.onComplete = function(){
			curPanel.css({overflow:"auto",position:"absolute",visibility:"hidden",height:"auto"});
		};
		curPanel.css({height:curPanel.getDimension().height+"px",overflow:"hidden"});
		this.headers[args.panelNum].toggleClass("accordian_open");
		this.closeAnimation.start(curPanel);
	}
});




//----------------------------------------------------------------------------//
//----------------------------------------------------------------------------//
//
//									JFORK DIALOG
//
//----------------------------------------------------------------------------//
//----------------------------------------------------------------------------//
jfork.Dialog = jfork.Class({
	"public static Array dialogs":[],
	"private static Array containers":[],
	"public static Number zIndex":100,
	
	"public Element container":null,
	"public Element wrapper":null,

	"Constructor(Element container)":function(args){
		var wrapperContent="", content=args.container.innerHTML;
		args.container.innerHTML = "";
		
		args.container.create({nodeName:"div",className:"dialog_cover"});
		var wrapper = args.container.create({nodeName:"div",className:"dialog_wrapper"});
		wrapperContent += "<div class='dialog_innerWrapper'><div class='dialog_T'><b></b><span></span><i></i></div>";
		wrapperContent += "<div class='dialog_CL'></div><div class='dialog_CR'></div><div class='dialog_B'><b></b><span></span><i></i></div>";
		wrapperContent += "<div class='dialog_C'>" + content + "</div></div>";

		wrapper.innerHTML = wrapperContent;
		this.container = args.container;
		this.wrapper = wrapper;
		this.dialogs.push(this);
		this.containers.push(this.container);

		this[(args.container.getAttribute("state") == "open") ? "open" : "close"]();
	},
	"public static void constructAll()":function(){
		var that = this;
		jfork({className:"dialog"}).iterate(function(){ 
			if(!that.containers.contains(this.item)){
				new jfork.Dialog(this.item); 
			}
		});
	},
	"public static Object get(String id)":function(args){
		for(var i=0; i<this.dialogs.length; i++){
			if(this.dialogs[i].container.id == args.id){
				return this.dialogs[i];
			}
		}
		return null;
	},
	"public void close()":function(){
		this.container.css({display:"none"});
	},
	"public void open()":function(){
		this.zIndex = this.zIndex + 1;
		var windowSize = jfork.Window.getSize();
		var windowOffset = jfork.Window.getScrollOffset();
		this.container.css({display:"block",zIndex:this.zIndex});
		this.wrapper.css({top:(windowOffset.top + Math.floor(windowSize.height/2))+"px"});
	},
	"public static void closeAll()":function(){
		this.dialogs.iterate(function(){ this.item.close(); });
	},
	"public static void openAll()":function(){
		this.dialogs.iterate(function(){ this.item.open(); });
	}	
});



//----------------------------------------------------------------------------//
//----------------------------------------------------------------------------//
//
//									JFORK BUTTON
//
//----------------------------------------------------------------------------//
//----------------------------------------------------------------------------//
jfork.Button = jfork.Class({});



//----------------------------------------------------------------------------//
//----------------------------------------------------------------------------//
//
//									JFORK WIDGET
//
//----------------------------------------------------------------------------//
//----------------------------------------------------------------------------//
jfork.Widget = jfork.Class({});



//----------------------------------------------------------------------------//
//----------------------------------------------------------------------------//
//
//									JFORK TIMER
//
//----------------------------------------------------------------------------//
//----------------------------------------------------------------------------//
jfork.Timer = jfork.Class({
	"public Number runTime":0,
						  
	"private Object actions":null,
	"private Number actionNum":1,
	"private Object interval":null,
						  
	"Constructor()":function(){
		this.actions = {};
	},
	"public void play()":function(){
		var that = this;
		var lastTime = (new Date()).getTime();
		
		if(this.interval){ return; }

		this.interval = setInterval(function(){
			var curTime = (new Date()).getTime();
			var milliOffset = curTime - lastTime;
			that.runTime += milliOffset;
			var actions = that.actions;
			for(var a in actions){
				that.actions[a].duration -= milliOffset;
				if(actions[a].duration <= 0){
					if(actions[a].maxCycles && actions[a].maxCycles <= actions[a].cycles){  
						actions[a].action(actions[a].maxCycles);
						that.removeAction(parseInt(a));
						continue;
					}
					that.actions[a].duration = actions[a].milli;
					actions[a].action(that.actions[a].cycles++);
				}
			}					
			lastTime = curTime;
		},5);
	},
	"public Number addAction(Function action, Number milli)":function(args){
		this.actions[this.actionNum++] = {action:args.action,milli:args.milli,duration:args.milli,cycles:0,maxCycles:false};
	},
	"public Number addAction(Function action, Number milli, Number maxCycles)":function(args){
		this.actions[this.actionNum++] = {action:args.action,milli:args.milli,duration:args.milli,cycles:0,maxCycles:args.maxCycles};
	},
	"public Boolean removeAction(Number actionNum)":function(args){
		delete this.actions[args.actionNum];
	},
	"public void pause()":function(){
		clearInterval(this.interval);
		this.interval = null;
	},
	"public Boolean isPaused()":function(){
		return this.interval ? false : true;
	},
	"public void toggle()":function(){
		this.isPaused() ? this.play() : this.pause();
	}
});




//----------------------------------------------------------------------------//
//----------------------------------------------------------------------------//
//
//									JFORK CANVAS
//
//----------------------------------------------------------------------------//
//----------------------------------------------------------------------------//
jfork.Canvas = jfork.Class({
						   
	"public Element parent":null,
	"public Array layers":null,
	"public Element cover":null,
	
	"public Boolean mouseOver":false,
	"public Boolean mouseDown":false,
	"public Object mouseDownPos":null,
	"public Object mouseDownOffset":null,
	"public Object position":null,
	"public Object dimension":null,
	"public Object zoomDim":null,
	"public Object offset":null,
	
	"public static Number layerCount":0,
	
	"private Number zoom":0,
	"private Object zoomFocus":null,
	"private Number zoomSteps":4,
	"private Number zoomScale":1,
	
	"Constructor(Element parent)":function(args){
		this.constructorCommons(args.parent);
	},
	
	"Constructor(Element parent, Object zoomDim)":function(args){ //ZoomDim: {width:100,height:100,padding:0}
		var that = this;
		
		this.constructorCommons(args.parent);
		this.zoomDim = args.zoomDim;

		this.cover.addEvent("touchstart",function(e){
			if(e.touches.length == 2){
				that.zoomFocus = {top:Math.floor((e.touches[0].clientY+e.touches[1].clientY)/2)-that.position.top,left:Math.floor((e.touches[0].clientX+e.touches[1].clientX)/2)-that.position.left};
			}
		});
		this.cover.addEvent("gesturechange",function(e){
			if(e.scale > 1){
				that.zoom=Math.min(that.zoom+e.scale/that.zoomSteps,1);
			} else {
				that.zoom=Math.max(that.zoom-(1-e.scale),0);
			}
			that.render();
			return e.stopDefault();
		});


		jfork.Element.addEvent(window,"mousewheel",function(e){
			if(that.mouseOver){
				var mousePos = e.getMousePosition();
				that.zoomFocus = {top:mousePos.top-that.position.top,left:mousePos.left-that.position.left};
				that[(e.getMouseWheel() > 0) ? "zoomIn" : "zoomOut"]();
				return e.stopDefault();
			}
		});
		
		this.addEvent("mousedown",function(mousePos,coverPos,layerPos,e){	
			that.mouseOver = true;	
			that.mouseDown = true;		
			that.mouseDownPos = {top:mousePos.top,left:mousePos.left};
			that.mouseDownOffset = {top:that.offset.top,left:that.offset.left};
		});
		this.addEvent("mouseup",function(mousePos,coverPos,layerPos,e){		that.mouseOver = true;	that.mouseDown = false; 	});
		this.addEvent("mousemove",function(mousePos,coverPos,layerPos,e){	that. mouseOver = true;	});
		this.addEvent("mouseout",function(mousePos,coverPos,layerPos,e){	that.mouseOver = false;	});
	},
	
	"private void constructorCommons(Element parent)":function(args){	
		this.parent = args.parent;
		this.dimension = this.parent.getDimension();
		this.position = this.parent.getPosition();
		this.offset = {left:0,top:0};
		this.zoomFocus = {left:0,top:0};
		this.layers = [];
		
		this.cover = this.parent.create("div");
		this.cover.css({position:"absolute",top:"0px",left:"0px",width:this.dimension.width+"px",height:this.dimension.height+"px"});

		var that = this;
		jfork.Element.addEvent(window,"resize",function(e){									
			var newDim = that.parent.getDimension();
			for(var i=0; i<that.layers.length; i++){
				that.layers[i].reset();
				that.layers[i].setDimension(newDim);	
			}
			that.dimension = newDim;
			that.cover.css({width:newDim.width+"px",height:newDim.height+"px"});
			that[(that.zoomDim ? "zoomFit" : "render")]();
		});
	},
	
	"public void resize(Object dimensions)":function(args){
		for(var i=0; i<this.layers.length; i++){
			this.layers[i].reset();
			this.layers[i].setDimension(args.dimensions);	
		}
		this.dimension = args.dimensions;
		this.cover.css({width:args.dimensions.width+"px",height:args.dimensions.height+"px"});
	},
	
	"public Object addLayer(Function renderAction)":function(args){
		return this.addLayer(args.renderAction, false);
	},
	
	"public Object addLayer(Function renderAction, Boolean isZoomable)":function(args){
		return this.addLayer(args.renderAction, args.isZoomable, true);
	},
	
	"public Object addLayer(Function renderAction, Boolean isZoomable, Boolean isFirst)":function(args){
		var cl = new CanvasLayer(args.renderAction, args.isZoomable);
		this.layerCount++;
		cl.setDimension(this.dimension);
		this.parent.insertBefore(cl.elem,args.isFirst ? this.cover : (this.layers.length > 0 ? this.layers[0].elem : this.cover));
		this.layers.push(cl);
		return cl;
	},
	
	"public void render()":function(){
		this.reset();
		
		if(this.zoomDim){
			var fitScale = Math.min((this.dimension.height-this.zoomDim.padding)/this.zoomDim.height,(this.dimension.width-this.zoomDim.padding)/this.zoomDim.width,1);
			var newScale = (1-fitScale)*this.zoom + fitScale;
			this.offset.top += (this.zoomFocus.top-this.offset.top)*(this.zoomScale-newScale)/this.zoomScale;
			this.offset.left += (this.zoomFocus.left-this.offset.left)*(this.zoomScale-newScale)/this.zoomScale;
			this.translate(this.offset);
			this.scale(newScale);
			this.zoomScale = newScale;
		}
		
		for(var i=0; i<this.layers.length; i++){
			this.layers[i].render();	
		}
	},
	
	"public void scale(Number scale)":function(args){
		for(var i=0; i<this.layers.length; i++){
			if(this.layers[i].isZoomable){
				this.layers[i].scale(args.scale);	
			}
		}
	},
	
	"public void reset()":function(){
		for(var i=0; i<this.layers.length; i++){
			this.layers[i].reset();
		}
	},
	
	"public void translate(Object offset)":function(args){			
		for(var i=0; i<this.layers.length; i++){
			if(this.layers[i].isZoomable){
				this.layers[i].translate(args.offset);	
			}
		}
	},
	
	"public void zoomFit()":function(){
		var fitScale = Math.min(this.dimension.height/this.zoomDim.height,this.dimension.width/this.zoomDim.width,1);
		var fitSize = {height:this.zoomDim.height*fitScale,width:this.zoomDim.width*fitScale};
		this.zoom=0;
		this.zoomScale = fitScale;
		this.zoomFocus = {top:this.dimension.height/2,left:this.dimension.width/2};
		this.offset = {top:(this.dimension.height-this.zoomDim.height*fitScale)/2,left:(this.dimension.width-this.zoomDim.width*fitScale)/2};
		this.render();
	},
	
	"public void zoomIn()":function(){
		this.zoom=Math.min(this.zoom+1/this.zoomSteps,1);
		this.render();
	},
	
	"public void zoomOut()":function(){
		this.zoom=Math.max(this.zoom-1/this.zoomSteps,0);
		this.render();
	},
	
	"public void pan(Object offset)":function(args){
		this.offset.top += args.offset.top;
		this.offset.left += args.offset.left;
		this.render();
	},
	
	"public void addEvent(String type,Function action)":function(args){
		var that = this;
		this.cover.addEvent(args.type,function(e){
			var mousePos = e.getMousePosition();
			var canviPos = that.position;
			var coverPos = {left:mousePos.left - that.position.left,top:mousePos.top - that.position.top};
			var layerPos = {left:(coverPos.left - that.offset.left)/that.zoomScale,top:(coverPos.top - that.offset.top)/that.zoomScale};
			args.action(mousePos,coverPos,layerPos,e);
			return e.stopDefault();
		});
	},
	
	"public Object getImage(Function onComplete)":function(args){
		var that = this;
		var imageCanvas = new CanvasLayer(function(){
			for(var i=0; i<that.layers.length; i++){
				that.layers[i].renderAction(imageCanvas.ctx,imageCanvas);	
			}
			var image = new Image();
			image.onload = function(){ 
				document.body.removeChild(imageCanvas.elem);
				args.onComplete(image); 
			};
			image.src = imageCanvas.elem.toDataURL("image/png");
		}, false);
		imageCanvas.setDimension(this.dimension);
		imageCanvas.elem.css({display:"none"});
		document.body.appendChild(imageCanvas.elem);
		imageCanvas.render();
	}
});



var CanvasLayer = jfork.Class({								  
	"public Element elem":null,
	"public Object ctx":null,
	"public Boolean isZoomable":false,
	"public Variant id":null,
	
	"private Object offset":null,
	"private Number zoomScale":1,
	"public Function renderAction":null,
	
	"Constructor(Function renderAction, Boolean isZoomable)":function(args){
		this.id = jfork.Canvas.layerCount;
		this.isZoomable = args.isZoomable;
		this.renderAction = args.renderAction;
		this.elem = document.createElement('canvas');
		this.elem.css({position:"absolute",top:"0px",left:"0px"});
		this.ctx = this.elem.getContext('2d');
		this.lastRenderOffset = {top:0,left:0};
		this.offset = {top:0,left:0};
	},
	
	"public void setDimension(Object dim)":function(args){
		this.elem.width = args.dim.width;
		this.elem.height = args.dim.height;
	},
	
	"public void reset()":function(){
		if(this.zoomScale != 1 || this.offset.left != 0 || this.offset.top != 0) {
			this.scale(1/this.zoomScale);
			this.translate({left:-this.offset.left,top:-this.offset.top});
		}
		//this.ctx.clearRect(0,0,this.elem.width, this.elem.height);
		//this.elem.width = this.elem.width + 0;
		var w = this.elem.width;
		this.elem.width = 0;
		this.elem.width = w;
	},
	
	"public void clear()":function(){
		if(this.zoomScale != 1 || this.offset.left != 0 || this.offset.top != 0) {
			this.ctx.scale(1/this.zoomScale,1/this.zoomScale);
			this.ctx.translate(-this.offset.left,-this.offset.top);
			//this.ctx.clearRect(0,0,this.elem.width, this.elem.height);
			var w = this.elem.width;
			this.elem.width = 0;
			this.elem.width = w;
			this.ctx.translate(this.offset.left,this.offset.top);	
			this.ctx.scale(this.zoomScale,this.zoomScale);
		} else {
			var w = this.elem.width;
			this.elem.width = 0;
			this.elem.width = w;
			//this.ctx.clearRect(0,0,this.elem.width, this.elem.height);
		}
	},
	
	"public void remove(Variant canvasObj)":function(args){
		for(var i=0; i<args.canvasObj.layers.length; i++){
			if(args.canvasObj.layers[i].id == this.id){
				args.canvasObj.layers.splice(i,1);
				break;	
			}
		}
		this.elem.remove();
	},
	
	"public void render()":function(){
		this.renderAction(this.ctx,this);
	},
	
	"public void scale(Number scale)":function(args){
		this.zoomScale *= args.scale;
		this.ctx.scale(args.scale,args.scale);	
	},
	
	"public void translate(Object offset)":function(args){	
		this.offset.left += args.offset.left;
		this.offset.top += args.offset.top;
		this.ctx.translate(args.offset.left,args.offset.top);	
	}
});



//----------------------------------------------------------------------------//
//----------------------------------------------------------------------------//
//
//									JFORK IMAGE
//
//----------------------------------------------------------------------------//
//----------------------------------------------------------------------------//
jfork.Image = jfork.Class({
	
	"public String src":"",
	"public Object img":null,
	
	"Constructor(Variant img)":function(args){
		this.src = "";
		this.img = args.img;
	},
	
	"Constructor(String src)":function(args){
		this.src = args.src;
		this.img = new Image();
		this.img.src = args.src;
	},

	"Constructor(String src, Function onComplete)":function(args){
		var that = this;
		var img = new Image();
		img.onload = function(){ args.onComplete(img); };
		img.src = args.src;
		
		this.img = img;
		this.src = args.src;
	},
	
	"private void canvasImage(Number sX, Number sY, Number sW, Number sH, Number dX, Number dY, Number dW, Number dH, Function onComplete":function(args){
		var canvas = jfork.Element.create(document.body,{nodeName:"canvas"});
		canvas.css({display:"none"});
		canvas.width = args.dW;
		canvas.height = args.dH;
		
		var ctx = canvas.getContext('2d');
		ctx.drawImage(this.img,args.sX,args.sY,args.sW,args.sH,args.dX,args.dY,args.dW,args.dH);
		
		var newImg = new Image();
		newImg.onload = function(){ args.onComplete(newImg); };
		newImg.src = canvas.toDataURL("image/png");
		document.body.removeChild(canvas);
	},
	
	"public void crop(Number x, Number y, Number w, Number h, Function onComplete)":function(args){
		this.canvasImage(args.x,args.y,args.w,args.h,0,0,args.w,args.h,args.onComplete);
	},
	
	"public void crop(Array coordList, Function onComplete)":function(args){
		var that=this, imageCounter = 0;
		args.coordList.iterate(function(){
			var index = this.index;
			that.canvasImage(this.item.x,this.item.y,this.item.w,this.item.h,0,0,this.item.w,this.item.h,function(img){
				imageCounter++;
				args.coordList[index].img = img;
				if(args.coordList.length == imageCounter){ args.onComplete(args.coordList); }
			});
		});
	},
	
	"public void stretch(Number w, Number h, Function onComplete)":function(args){
		this.canvasImage(0,0,this.img.width,this.img.height,0,0,args.w,args.h,args.onComplete);
	}
	
});




//----------------------------------------------------------------------------//
//----------------------------------------------------------------------------//
//
//									JFORK SOUND
//
//----------------------------------------------------------------------------//
//----------------------------------------------------------------------------//

jfork.Sound = jfork.Class({
	"private Object audio":null, 
	
	"private Function onAudioLoad":null,
	"private Function onAudioEnd":null,
	"private Boolean canPlayType":true,
	"private Boolean isLoaded":false,
	"private Boolean isPaused":true,
						  
	"Constructor(Object files)":function(args){ //Format: {mpeg:"myfile.mp3",ogg:"myfile.ogg",wav:"myfile.wav"}
		var that = this;
		
		this.audio = new Audio();
		this.onAudioLoad = function(){};
		this.onAudioEnd = function(){};
		
		if(args.files.ogg && this.audio.canPlayType('audio/ogg;')){
			this.audio.src = args.files.ogg;
			this.audio.type = "audio/ogg";
		} else if(args.files.mpeg && this.audio.canPlayType('audio/mpeg;')){
			this.audio.src = args.files.mpeg;
			this.audio.type = "audio/mpeg";
		} else if(args.files.wav && this.audio.canPlayType('audio/wav;')){
			this.audio.src = args.files.wav;
			this.audio.type = "audio/wav";
		} else {
			this.canPlayType = false;
		}			
		
		if(this.canPlayType){
			this.audio.addEventListener('canplaythrough',function(){
				that.isLoaded = true; 
				that.onAudioLoad(); 
			},false); 
			this.audio.addEventListener('ended',function(){
				that.stop();
				that.onAudioEnd(); 
			},false);
			
			this.audio.load();
		}
	},
	"public void play()":function(){
		var that = this;
		
		if(!this.isPaused){ return; }
		this.isPaused = false;
		
		this.audio.play();
		
		/*
		if(this.isLoaded){
			this.audio.play();
		} else {
			this.onAudioLoad = function(){
				that.audio.play();
			};
		}
		*/
	},
	"public void pause()":function(){
		this.audio.pause();
		this.isPaused = true;
	},
	"public void stop()":function(){
		this.rewind();
		this.pause();
	},
	"public void rewind()":function(){
		this.audio.currentTime = 0;
	},
	"public Object clone()":function(){
		if(!this.canPlayType){ return {}; }
		
		var argsObject = {};
		argsObject[this.audio.type.split("/")[1]] = this.audio.src;
		
		return new jfork.Sound(argsObject);
	},
	"public void setRepeat(Boolean isRepeatable)":function(args){
		var that = this;
		if(args.isRepeatable){
			this.onAudioEnd = function(){
				that.stop();
				that.play();
			};
		} else {
			this.onAudioEnd = function(){};
		}
	},
	"public void setVolume(Number volume)":function(args){ //Range 0 -100
		this.audio.volume = args.volume/100;	
	}
});
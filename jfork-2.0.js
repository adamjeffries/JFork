/*!
 * jfork JavaScript Framework v2.0
 * http://jfork.com/
 *
 * Copyright 2013 The Jeffries Company and other contributors
 * Released under the MIT license
 * https://github.com/JeffriesCo/JFork/blob/master/LICENSE
 */


(function(window, undefined) {
	
	
//Check if supported
if(!Object.defineProperty){
	alert("jfork not supported");
	return;
}
	
	
	
var jfork = {};



var typeChecks = {};

jfork.is = function(o){
	for(var t in typeChecks){
		if(t != "Variant" && typeChecks[t](o)){ 
			return t; 
		}
	}
	return null;
};

jfork.addTypeCheck = function(name,check){
	name = name.charAt(0).toUpperCase() + name.slice(1);
	typeChecks[name] = check;
	jfork.is[name] = check;
};

jfork.hasTypeCheck = function(name){
	if(name in typeChecks){
		return true;
	}
	return false;
};

//Add Default Types
jfork.addTypeCheck("Number",function(o){ 
	return ((o || o==0) && !isNaN(o) && o.constructor == Number) ? true : false; 
});

jfork.addTypeCheck("Function",function(o){ 
	return (o instanceof Function) ? true : false;
});

jfork.addTypeCheck("NodeList",function(o){
	return (o && typeChecks["Number"](o.length) && typeChecks["Function"](o.item)) ? true : false;
});

jfork.addTypeCheck("Date",function(o){
	return (o instanceof Date) ? true : false;
});

jfork.addTypeCheck("Element",function(o){
	return o && ((HTMLElement && o instanceof HTMLElement) || "undefined" !== typeof o.childNodes || o.nodeType) ? true : false;
});

jfork.addTypeCheck("Array",function(o){
	return (o && o.constructor == Array) ? true : false;
});

jfork.addTypeCheck("Object",function(o){
	return (o && typeof o=="object" && !typeChecks["Array"](o) && !typeChecks["Element"](o) && !typeChecks["Date"](o) && !typeChecks["NodeList"](o) && !typeChecks["RegExp"](o)) ? true : false;
});

jfork.addTypeCheck("String",function(o){
	return (typeof o == 'string') ? true : false;
});

jfork.addTypeCheck("Boolean",function(o){
	return (typeof o == "boolean") ? true : false;
});

jfork.addTypeCheck("RegExp",function(o){
	return (o && o instanceof RegExp) ? true : false;
});

jfork.addTypeCheck("Integer",function(o){
	return (typeChecks["Number"](o) && ((o + "").indexOf(".")==-1)) ? true : false;
});

jfork.addTypeCheck("Variant",function(o){
	return true;
});






//Internal Helpers
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

var bind = function(func,context){
	return function(){
		return func.apply(context,Array.prototype.slice.call(arguments));
	};
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


var observe = function(obj,name,_getter,_setter){

    var value = obj[name];
    var getter = function() {
        return _getter.call(obj, value);
    };
    var setter = function(newValue) {
    	value = _setter.call(obj, newValue);
        return value;
    };
 
    // Modern browsers, IE9+, and IE8 (must be a DOM object),
    if (Object.defineProperty) { 
        Object.defineProperty(obj, name, {get:getter, set:setter});
 
    // Older Mozilla
    } else if (obj.__defineGetter__) { 
        obj.__defineGetter__(name, getter);
        obj.__defineSetter__(name, setter);
 
    // IE6-7
    // must be a real DOM object (to have attachEvent) and must be attached to document (for onpropertychange to fire)
    } else {
        var onPropertyChange = function (e) { 
            if (event.propertyName == name) {
                obj.detachEvent("onpropertychange", onPropertyChange); 
                var newValue = setter(obj[name]);
                obj[name] = getter;
                obj[name].toString = getter;
                obj.attachEvent("onpropertychange", onPropertyChange);
            }
        };  
        obj[name] = getter;
        obj[name].toString = getter; 
        obj.attachEvent("onpropertychange", onPropertyChange);
    }
};

observe.create = (function(){
	if(ie < 8){
		var parent = document.createElement("Observables");
		document.appendChild(parent);
		return function(){
			var o = document.createElement("Observable");
			parent.appendChild(o);
			return o;
		};
	} else if(ie == 8){
		return function(){
			return document.createElement("Observable");
		};
	} else {
		return function(){
			return {};
		};
	}
})();



var getRandomString = function(len){
	var str = "";
	var keys = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	for(var i=0; i<len; i++){
		str += keys.charAt(Math.floor(Math.random() * keys.length));
	}			
	return str;
};



//External Helpers
jfork.each = function(o,func){
	if(!o){
		return;
	} else if(o.constructor == Array){
		for(var i=0, len=o.length; i<len; i++){
			var val = func(i,o[i],o);
			if(val !== undefined){
				return val;
			}
		}
	} else {
		for(var i in o){
			var val = func(i,o[i],o);
			if(val !== undefined){
				return val;
			}
		}
	}
};





jfork.Class = function(classSignature,extend){
	
	//Storage Structure
	//- varaibles: {name:{type:"Variant|null",isPrivate:bool,value:"",context:{}},...}
	//- methods: {name:[{type:"Variant|null",isPrivate:bool,isArgsObject:bool,args:null|[{name:"asdf",type:"Variant|null"}],func:function(){},context:{}},...],...}
	var clazz = {
		privateStatic:null,
		publicStatic:null,
		storage:{variables:{},methods:{}},
		instances:[], //[{privateDynamic:function(){},publicDynamic:{},storage},...]
		extend:extend || null
	};
	
	var newClass = function(){	
		if(this instanceof newClass){ return; }
		
		var instance = {publicDynamic:new clazz.publicStatic(),privateDynamic:bind(newClass),storage:{variables:{},methods:{}}};
		clazz.instances.push(instance);

		
		
		
		return instance.publicDynamic;
	};
	
	clazz.publicStatic = newClass;
	clazz.privateStatic = bind(newClass); //Bound so that it will have a new context
	
	//Add prototypes for instanceof
	clazz.publicStatic.prototype = extend ? new extend.publicStatic() : {};
	clazz.publicStatic.prototype.constructor = clazz.publicStatic;
	

	
	
	
	//Defines static and stores dynamic to defaultSignature - from static methods and Class
	clazz.publicStatic.define = clazz.privateStatic.define = function(a,b){
		
	};
	
	//Extend - extends the current class to create a new one
	clazz.publicStatic.extend = function(extendClassSignature){
		return jfork.Class(extendClassSignature,clazz);
	};
	
	//Setup defaultSignature
	clazz.publicStatic.define(classSignature);

	return clazz.publicStatic;
};








//Storage Structure
// - varaibles: {name:{type:"Variant|null",isPrivate:bool,value:""},...}
// - methods: {name:[{type:"Variant|null",isPrivate:bool,isArgsObject:bool,args:null|[{name:"asdf",type:"Variant|null"}],func:function(){}},...],...}
//var classes = {};//{hashcode:{privateStatic:{},publicStatic:{},storage:{}},...}

jfork.oldClass = function(defaultSignature){

	var clazzHash = getRandomString(30);
	var clazz = {privateStatic:observe.create(),storage:{variables:{},methods:{}},publicStatic:null};
	var instances = {}; //{hashcode:{privateDynamic:{},publicDynamic:{},storage:{}},...}
	
	
	var parseDef = function(def){
		var sig = {};
		sig.isPrivate = def.indexOf("private") > -1;
		sig.isStatic = def.indexOf("static") > -1;
		
		var defParts = def.split("(");
		var defLeftParts = def.split(" ");
		sig.name = defLeftParts[defLeftParts.length-1];
		
		sig.type = null;
		if(defLeftParts.length > 1){
			var possibleType = defLeftParts[defLeftParts.length-2];
			if(jfork.hasTypeCheck(possibleType)){
				sig.type = possibleType;
			}
		}
		
		sig.isArgsObject = false;
		sig.args = null;
		if(defParts.length == 2){
			sig.args = [];
			var argsString = defParts[1].split(")")[0];
			sig.isArgsObject = argsString.indexOf("{") > -1 ? true : false;
			argsString = argsString.replace("{","").replace("}","");
			argsList = argsString.split(",");
			jfork.each(argsList,function(i,v){
				v = v.replace(/^\s+|\s+$/g, '');
				var argSplit = v.split(" ");
				var arg = {name:argSplit[argSplit-1],type:null};
				if(argSplit.length==2){
					if(jfork.hasTypeCheck(argSplit[0])) {
						arg.type = argSplit[0];
					}
				}
				sig.args.push(arg);
			});
		}

		return sig;
	};
	
	
	var checkArgs = function(argsArray,mDef){
		if(mDef.args == null){
			return true;
		} else if(mDef.isArgsObject){
			if(argsArray.length != 1){
				return false;
			} else if(!jfork.is.Object(argsArray[0])) {
				return false;
			} else {
				for(var i=0; i<mDef.args.length; i++){
					if((mDef.args[i].name in argsArray[0]) && mDef.args[i].type != "Variant" && mDef.args[i].type != null && !jfork.is[mDef.args[i].type](argsArray[0][mDef.args[i].name]) ){
						return false;
					}
				}
			}
		} else {
			if(argsArray.length != mDef.args.length){
				return false;
			} else {
				for(var i=0; i<argsArray.length; i++){
					if(mDef.args[i].type != "Variant" && mDef.args[i].type != null && !jfork.is[mDef.args[i].type](argsArray[i])){
						return false;
					}
				}
			}
		}
		return true;
	};
	
	
	var areMethodArgsEqual = function(mDef1,mDef2){
		if(!mDef1.args && !mDef2.args){
			return true;
		} else if(!mDef1.args || !mDef2.args){
			return false;
		} else if(mDef1.args.length == mDef2.args.length && mDef1.isArgsObject == mDef2.isArgsObject) {
			for(var i=0; i<mDef1.args.length; i++){
				if(mDef1.args[i].type != mDef2.args[i].type && mDef1.args[i].type != null && mDef1.args[i].type != "Variant" && mDef2.args[i].type != null && mDef2.args[i].type != "Variant"){
					return false;
				}
			}
			return true;
		} else if(mDef1.isArgsObject && mDef2.args.length == 1 && (mDef2.args[0].type == null || mDef2.args[0].type == "Variant" || mDef2.args[0].type == "Object")) {
			return true;
		} else if(mDef2.isArgsObject && mDef1.args.length == 1 && (mDef1.args[0].type == null || mDef1.args[0].type == "Variant" || mDef1.args[0].type == "Object")) {
			return true;
		}
		return false;
	};
	
	
	var bindMethod = function(name,methodStorage,contexts,bindTo){
		var func = null;
		
		var getFunc = function(index){
			return function(){
				var args = Array.prototype.slice.call(arguments);
				if(methodStorage[name][index].isArgsObject){
					args[0] = args[0] || {};
					for(var i=0; i<methodStorage[name][index].args.length; i++){
						if(!(methodStorage[name][index].args[i].name in args[0])) {
							args[0][methodStorage[name][index].args[i].name] = null;
						}
					}
				}
				var rtn = methodStorage[name][index].func.apply(bindTo,args);
				if(methodStorage[name][index].type && methodStorage[name][index].type != "Variant" && !jfork.is[methodStorage[name][index].type](rtn)){
					throw new Error(name + " method did not return a valid type. Expected: " + methodStorage[name][index].type);
				}
				return rtn;
			};
		};
		
		//Single method
		if(methodStorage[name].length == 1) {

			//Check arguments wrapper
			if(methodStorage[name][0].args){
				func = function(){
					var args = Array.prototype.slice.call(arguments);
					if(!checkArgs(args, methodStorage[name][0])){
						throw new Error("Arguments passed to " + name + " does not match a method signature.");
					}
					return getFunc(0).apply(null,args);
				};
			
			} else {
				func = getFunc(0);
			}
			
		//Overloaded method - use first method that matches the argument signature
		} else {
			func = function(){
				var args = Array.prototype.slice.call(arguments);
				for(var i=0; i<methodStorage[name].length; i++){
					if(checkArgs(args, methodStorage[name][i])){
						return getFunc(0).apply(null,args);
					}
				}
				throw new Error("Arguments passed to " + name + " does not match a method signature.");
			};
		}


		//Add method to the contexts
		jfork.each(contexts,function(i,v){
			v[name] = func;
		});
	};
	
	
	var bindVariable = function(name,variableStorage,contexts){
		var getter = function(){
			return variableStorage[name].value;
		};
		var setter = function(newValue){
			variableStorage[name].value = newValue;
		};			
		//Type check variable if needed before setting it
		if(variableStorage[name].type) {
			if(!jfork.is[variableStorage[name].type](variableStorage[name].value)){
				throw new Error("Intial value of variable " + name + " is not a " + variableStorage[name].type);
			}
			setter = function(newValue){
				if(!jfork.is[variableStorage[name].type](newValue)){
					throw new Error("Cannot set value on " + name + " because it is not a " + variableStorage[name].type);
				}
				variableStorage[name].value = newValue;
			};
		}
		jfork.each(contexts,function(i,v){
			observe(v,name,getter,setter);
		});
	};
	
	
	var addStatic = function(def,val){
		//Add Method
		if(jfork.is.Function(val)){
			if(!clazz.storage.methods[def.name]){
				clazz.storage.methods[def.name] = [];
			} else {
				jfork.each(clazz.storage.methods[def.name],function(i,v){
					if(areMethodArgsEqual(def, v)){
						throw new Error("Cannot overload methods with matching arguments");
					}
				});
			}
			clazz.storage.methods[def.name].push({type:def.type,isPrivate:def.isPrivate,isArgsObject:def.isArgsObject,args:def.args,func:val});
			//Sort the overloaded methods in order from least arguments to most..  more efficient
			if(clazz.storage.methods[def.name].length > 1){
				clazz.storage.methods[def.name].sort(function(a,b){ 
					var a1=a.args, a2=b.args; 
					if(!a1){ 
						return -1; 
					} else if(!a2){ 
						return 1; 
					} else { 
						return a2.length-a1.length;
					} 
				});
				clazz.storage.methods[def.name].reverse();
			}
			
			var contexts = [];
			if(!def.isPrivate){
				contexts.push(clazz.publicStatic);
			}
			contexts.push(clazz.privateStatic);
			//Retroactively add static methods to existing instances
			jfork.each(instances,function(i,v){
				contexts.push(v.publicDynamic);
				contexts.push(v.privateDynamic);
				if(v.storage.methods[def.name]){
					throw new Error(def.name + " cannot be overloaded with a static method.");
				}
			});
			bindMethod(def.name,clazz.storage.methods,contexts,clazz.privateStatic);
			
		//Add Static Variable
		} else {
			if(clazz.storage.variables[def.name]){
				throw new Error(def.name + " variable has already been declared.");
			}
			clazz.storage.variables[def.name] = {type:def.type,isPrivate:def.isPrivate,value:val};
			var contexts = [];
			if(!def.isPrivate && (!ie || ie > 9)){//Only ie hack needed (cannot use getters and setters on functions)
				contexts.push(clazz.publicStatic);
			}
			contexts.push(clazz.privateStatic);
			//Retroactively add static variables to existing instances
			jfork.each(instances,function(i,v){
				contexts.push(v.publicDynamic);
				contexts.push(v.privateDynamic);
				if(v.storage.variables[def.name]){
					throw new Error(def.name + " variable has already been declared.");
				}
			});
			bindVariable(def.name,clazz.storage.variables,contexts);
		}
	};	
	
	var newClazz = function(){
		
		var instanceHash = getRandomString(30);
		var instance = {publicDynamic:observe.create(),privateDynamic:observe.create(),storage:{variables:{},methods:{}}}; //Dynamic Storage
		instances[instanceHash] = instance;
		
		var addDynamic = function(def,val){
			//Add Method
			if(jfork.is.Function(val)){
				if(clazz.storage.methods[def.name]){
					throw new Error(def.name + " cannot overload a static method.");
				}
				if(!instance.storage.methods[def.name]){
					instance.storage.methods[def.name] = [];
				} else {
					jfork.each(instance.storage.methods[def.name],function(i,v){
						if(areMethodArgsEqual(def, v)){
							throw new Error("Cannot overload methods with matching arguments");
						}
					});
				}
				instance.storage.methods[def.name].push({type:def.type,isPrivate:def.isPrivate,isArgsObject:def.isArgsObject,args:def.args,func:val});
				//Sort the overloaded methods in order from least arguments to most..  more efficient
				if(instance.storage.methods[def.name].length > 1){
					instance.storage.methods[def.name].sort(function(a,b){ 
						var a1=a.args, a2=b.args; 
						if(!a1){ 
							return -1; 
						} else if(!a2){ 
							return 1; 
						} else { 
							return a2.length-a1.length;
						} 
					});
					instance.storage.methods[def.name].reverse();
				}
				
				var contexts = [];
				if(!def.isPrivate){
					contexts.push(instance.publicDynamic);
				}
				contexts.push(instance.privateDynamic);
				bindMethod(def.name,instance.storage.methods,contexts,instance.privateDynamic);
				
			//Add Variable
			} else {
				if(instance.storage.variables[def.name]){
					throw new Error(def.name + " variable has already been declared.");
				}
				if(clazz.storage.variables[def.name]){
					throw new Error(def.name + " variable has already been declared.");
				}
				instance.storage.variables[def.name] = {type:def.type,isPrivate:def.isPrivate,value:val};
				var contexts = [];
				if(!def.isPrivate){
					contexts.push(instance.publicDynamic);
				}
				contexts.push(instance.privateDynamic);
				bindVariable(def.name,instance.storage.variables,contexts);
			}
		};
		
		
		

		//Defines dynamic and static - from dynamic methods and instance
		instance.publicDynamic.define = instance.privateDynamic.define = function(a,b){
			if(jfork.is.String(a)){
				var def = parseDef(a);
				if(def.isStatic){
					addStatic(def,b);
				} else {
					addDynamic(def,b);
				}
			} else {
				jfork.each(a,function(i,v){
					var def = parseDef(i);
					if(def.isStatic){
						addStatic(def,v);
					} else {
						addDynamic(def,v);
					}
				});
			}
		};
		
		
		//Setup defaultSignature
		jfork.each(defaultSignature,function(i,v){
			var def = parseDef(i);
			if(def.isStatic){
				//Static Method To Instance
				if(jfork.is.Function(v)){
					var contexts = [];
					if(!def.isPrivate){
						contexts.push(instance.publicDynamic);
					}
					contexts.push(instance.privateDynamic);
					bindMethod(def.name,clazz.storage.methods,contexts,clazz.privateStatic);
				//Static Variable To Instance
				} else {
					var contexts = [];
					if(!def.isPrivate){
						contexts.push(instance.publicDynamic);
					}
					contexts.push(instance.privateDynamic);
					bindVariable(def.name,clazz.storage.variables,contexts);
				}
			} else {
				addDynamic(def,v);				
			}
		});
		
		return instance.publicDynamic;
	};
	clazz.publicStatic = newClazz;

	
	
	
	//Defines static and stores dynamic to defaultSignature - from static methods and Class
	clazz.publicStatic.define = clazz.privateStatic.define = function(a,b){
		if(jfork.is.String(a)){
			var def = parseDef(a);
			if(def.isStatic){
				addStatic(def,b);
			} else {
				defaultSignature[def] = b;
			}
		} else {
			jfork.each(a,function(i,v){
				var def = parseDef(i);
				if(def.isStatic){
					addStatic(def,v);
				} else {
					defaultSignature[i] = v;
				}
			});
		}
	};
	
	//Setup defaultSignature
	clazz.publicStatic.define(defaultSignature);

	
	classes[clazzHash] = clazz;
	return clazz.publicStatic;
};





var _jfork = window.jfork;
window.jfork = jfork;
	
})(window);




/*

  Must Haves
  - No Conflict
  - jfork.type
  - jfork.Class
  	- Constructor
  	- private, public
  	- static, dynamic
  	- variables, functions
  	- need to deep clone on objects and arrays.. being set as variables
  	- instanceOf
  	- extends
  	- super???
  	- singletons - be able to do these!
  	- be able to get a reference internally to the new class....  normally this()
  	- type checking returns and arguments (should we use getters and setters?)
  	- overloaded methods and constructor - useful for multi purpose funcitons - i.e.   method("hello",function(){}) vs. method({hello:"hello",onComplete:function(){}})
  	  - check number of arguments first, then types
  	  - have to wrapper in function of same name, that then contains an array of possibilities
  	
  	- We don't want too many wrapper functions...
  	- arguments come in always as an object - (kinda restricting...)
  	
    - Need to be able to instantiate and extend immediately - examples needed...
    
    
    //Everything works normally EXCEPT - if you want to support ie8 <= then cannot use static variables on Class Directly - example Animal.hasFur (Will be independent of all other contexts)
    
    
    var lib = {};
    lib.Animal = jfork.Class({
        numLegs:4,
        name:"",
        construct:function(name){
        	this.numLegs = 2;
        	this.name = name;
        },
        getNumLegs:function(){
        	return this.numLegs;
        },
        "setNumLegs(Integer num=4)":function(o){
        	this.numLegs = o.num;
        },
        "setNumLegs({Integer num=4})":function(num){
        	this.numLegs = num;
        }
    });
  
    lib.cat = Animal("Fluffy");
    
    //Extend and instantiate in a single step...
    lib.dog = jfork.Class({
    	extends:Animal,
    	construct:function(){
    		this._super();
    	}
    });
    
    //or
    lib.dog = Animal({
    
    });
    
    //Can update or set a class at any time
    Animal.define("defaultSetLegs",function(){
    
    });
    
    //Alias - changes the name from one to another - good for deprecations?
    Animal.alias("name","newname");
  
  
    //Instead of this - use o in the args...?
    lib.Animal = jfork.Class({
    	language:"english",
    	speak:function(o){
    		this.language = "french";
    		return this.language;
    		this == lib.Animal;
    	}    
    });
    
    //to get this() to work and not share data - we need to wrapper the class in a new function on creating the instance...  
       However in static methods, we don't want unique so this has to be defined up front as itself....
    
  
  
  
  
  
  - DAO
    - equality
    
  - API
  - GROUP
  
  
  - Array
    - every
    - each
    - filter
    - map
    - some



*/

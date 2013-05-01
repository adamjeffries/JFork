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
 
    Object.defineProperty(obj, name, {get:getter, set:setter, configurable:true});
};



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
	return;
};







jfork.Class = function(defaultSignature,extend){
	
	//Storage Structure
	var clazz = {
		privateStatic:null,
		publicStatic:null,
		signature:{
			constructors:[],//[{isPrivate:bool,value:function(){},isParamObject:bool,params:[{name:"asdf",type:"Variant|null",isArray:bool},...]},...]
			variables:{}, 	//{name:{type:"Variant|null",isPrivate:bool,isStatic:bool,value:value},...}
			methods:{}		//{name:{value:function(){},variations:[{type:"Variant|null",isPrivate:bool,isStatic:bool,value:function(){},isParamObject:bool,params:[{name:"asdf",type:"Variant|null",isArray:bool},...]},...]},...}
		},
		staticMapping:{
			variables:{}, 	//{name:storageObject,...}
			methods:{}		//{name:context,...}
		},
		storage:{},			//{name:value,...}
		instances:[],
		extend:extend || null
	};
	
	//Bind Method
	var bindMethod = function(signature,applyTo,contexts){
		var func = bind(signature.value,applyTo);
		jfork.each(contexts,function(i,v){
			v[signature.variations[0].name] = func;
		});
	};
	
	//Bind Variable
	var bindVariable = function(signature,storage,contexts){
		var getter = function(){
			return storage[signature.name];
		};
		var setter = function(newValue){
			storage[signature.name] = newValue;
		};
		if(signature.type){
			setter = function(newValue){
				if(signature.isTypeArray){
					if(!jfork.is.Array(newValue)){
						jfork.Class.error(signature.name + ": is the wrong type.  Expected a " + signature.type + "[]");
					}
					for(var i=0; i<newValue.length; i++){
						if(!jfork.is[signature.type](newValue[i])){
							jfork.Class.error(signature.name + ": is the wrong type.  Expected a " + signature.type + "[]");
						}
					}
				} else {
					if(!jfork.is[signature.type](newValue)){
						jfork.Class.error(signature.name + ": is the wrong type.  Expected a " + signature.type);
					}
				}				
				storage[signature.name] = newValue;
			};
		}
		jfork.each(contexts,function(i,v){
			observe(v,signature.name,getter,setter);			
		});
	};
	

	
	//Check Parameters
	var checkParams = function(parameters,signature){		
		if(signature.params == null){
			return true;
		} else if(signature.isParamObject){
			if(parameters.length != 1){
				return false;
			} else if(!jfork.is.Object(parameters[0])){
				return false;
			} else {
				for(var i=0; i<signature.params.length; i++){
					if(signature.params[i].name in parameters[0]){
						if(signature.params[i].type){
							if(signature.params[i].isArray){
								if(jfork.is.Array(parameters[0][signature.params[i].name])){
									for(var j=0; j<parameters[0][signature.params[i].name].length; j++){
										if(!jfork.is[signature.params[i].type](parameters[0][signature.params[i].name][j])){
											return false;
										}
									}
								} else {
									return false;
								}
							} else if(!jfork.is[signature.params[i].type](parameters[0][signature.params[i].name])) {
								return false;
							}
						}						
					} else {
						return false;
					}
					
				}
			}
		} else {
			if(parameters.length != signature.params.length){
				return false;
			} else {
				for(var i=0; i<parameters.length; i++){
					if(signature.params[i].type){
						if(signature.params[i].isArray){
							if(jfork.is.Array(parameters[i])){
								for(var j=0; j<parameters[i].length; j++){
									if(!jfork.is[signature.params[i].type](parameters[i][j])){
										return false;
									}
								}
							} else {
								return false;
							}
						} else if(!jfork.is[signature.params[i].type](parameters[i])) {
							return false;
						}
					}
				}
			}
		}
		return true;
	};
	
	
	
	//Build Method
	var buildMethod = function(variations){

		//Single Method
		if(variations.length == 1){
			var funcA = variations[0].value;
			if(variations[0].params){
				funcA = function(){
					var args = Array.prototype.slice.call(arguments);
					if(!checkParams(args,variations[0])){
						jfork.Class.error(variations[0].name + ": parameters passed do not match method signature");
					}
					return variations[0].value.apply(this,args);
				};
			}			
			if(variations[0].type){
				return function(){
					var rtnval = funcA.apply(this,Array.prototype.slice.call(arguments));
					if(variations[0].isTypeArray){
						if(!jfork.is.Array(rtnval)){
							jfork.Class.error(variations[0].name + ": must return type " + variations[0].type + "[]");
						}
						for(var i=0; i<rtnval.length; i++){
							if(!jfork.is[variations[0].type](rtnval[i])){
								jfork.Class.error(variations[0].name + ": must return type " + variations[0].type + "[]");
							}
						}
					} else if(!jfork.is[variations[0].type](rtnval)){
						jfork.Class.error(variations[0].name + ": must return type " + variations[0].type);						
					}
					return rtnval;
				};
			} else {
				return funcA;
			}
			
		//Overloaded Method
		} else {
			return function(){
				var args = Array.prototype.slice.call(arguments);
				var validvariationsIndex = jfork.each(variations,function(i,v){
					if(checkParams(args,v)){
						return i;
					}
				});
				if(!validvariationsIndex===undefined){
					jfork.Class.error(variations[validvariationsIndex].name + ": parameters passed do not match method signature");
				}
				var rtnval = variations[validvariationsIndex].value.apply(this,args);
				if(variations[validvariationsIndex].type){
					if(variations[validvariationsIndex].isTypeArray){
						if(!jfork.is.Array(rtnval)){
							jfork.Class.error(variations[validvariationsIndex].name + ": must return type " + variations[validvariationsIndex].type + "[]");
						}
						for(var i=0; i<rtnval.length; i++){
							if(!jfork.is[variations[validvariationsIndex].type](rtnval[i])){
								jfork.Class.error(variations[validvariationsIndex].name + ": must return type " + variations[validvariationsIndex].type + "[]");
							}
						}
						
					} else if(!jfork.is[variations[validvariationsIndex].type](rtnval)){
						jfork.Class.error(variations[validvariationsIndex].name + ": must return type " + variations[validvariationsIndex].type);
					}
				}		
				return rtnval;
			};
		}
	};
	
	
	
	
	
	
	//Build Signature
	var buildSignature = function(def,value){
		
		var defParts = def.split("(");
		var defLeftParts = defParts[0].split(" ");
		
		var sig = {
			name:defLeftParts[defLeftParts.length-1],
			type:null,
			isTypeArray:false,
			isParamObject:false,
			params:null,
			isPrivate:(def.indexOf("private") > -1) ? true : false,
			isStatic:(def.indexOf("static") > -1) ? true : false,
			value:value
		};
		
		if(defLeftParts.length > 1){
			var possibleType = defLeftParts[defLeftParts.length-2];
			var isTypeArray = false;
			if(possibleType.indexOf("[]") > -1){
				isTypeArray = true;
				possibleType = possibleType.replace("[]","");
			}
			if(jfork.hasTypeCheck(possibleType)){
				sig.isTypeArray = isTypeArray;
				sig.type = possibleType;
			}
		}
		
		if(defParts.length == 2){
			sig.params = [];
			var paramsString = defParts[1].split(")")[0];
			sig.isParamObject = paramsString.indexOf("{") > -1 ? true : false;
			paramsString = paramsString.replace("{","").replace("}","");			
			var paramsSplit = paramsString.split(",");
			if(paramsSplit.length > 1 || (paramsSplit.length==1 && paramsSplit[0] !="")){
				jfork.each(paramsSplit,function(i,v){
					v = v.replace(/^\s+|\s+$/g, '');
					var paramSplit = v.split(" ");
					var param = {name:paramSplit[paramSplit.length-1],type:"Variant",isArray:false};
					if(paramSplit.length==2){
						if(paramSplit[0].indexOf("[]") > -1){
							param.isArray = true;
							paramSplit[0] = paramSplit[0].replace("[]","");
						}
						if(jfork.hasTypeCheck(paramSplit[0])) {
							param.type = paramSplit[0];
						}
					}
					sig.params.push(param);
				});
				//Check for duplicate parameter names
				var paramDuplicates = {};
				jfork.each(sig.params,function(i,v){
					if(paramDuplicates[v.name]){
						jfork.Class.error(sig.name + ": cannot have two parameters with the same name (" + v.name + ")");
					}
					paramDuplicates[v.name] = true;
				});
			}			
		}
		
		return sig;
	};
	
	
	
	//Are Params Equal
	var areParamsEqual = function(sig1,sig2){
		if(!sig1.params || !sig2.params){
			return true;
		} else if(sig1.params.length == sig2.params.length && sig1.isParamObject == sig2.isParamObject) {
			for(var i=0; i<sig1.params.length; i++){
				if(sig1.params[i].type != sig2.params[i].type && sig1.params[i].type != null && sig1.params[i].type != "Variant" && sig2.params[i].type != null && sig2.params[i].type != "Variant"){
					return false;
				}
			}
			return true;
		} else if(sig1.isArgsObject && sig2.params.length == 1 && (sig2.params[0].type == null || sig2.params[0].type == "Variant" || sig2.params[0].type == "Object")) {
			return true;
		} else if(sig2.isArgsObject && sig1.params.length == 1 && (sig1.params[0].type == null || sig1.params[0].type == "Variant" || sig1.params[0].type == "Object")) {
			return true;
		}
		return false;
	};
	
	
	
	//Creates a new Instance
	var newClass = function(){	
		if(this instanceof newClass){ return; } //Used to prevent recursion from prototype on publicStatic
		
		var args = Array.prototype.slice.call(arguments);
		
		var instance = {
			publicDynamic:		new clazz.publicStatic(),
			privateDynamic:		bind(newClass),
			dynamicMapping:{
				variables:{}, 	//{name:storageObject,...}
				methods:{}		//{name:context,...}
			},
			storage:{}			//{name:value,...}
		};
		clazz.instances.push(instance);

		
		
		
		//Instance Define
		instance.publicDynamic.define = function(a,b){			
			if(jfork.is.Object(a)){
				jfork.each(a,function(i,v){
					instance.publicDynamic.define(i,v);
				});
				return instance.publicDynamic;
			}
			
			
			
			
			return instance.publicDynamic;
		};
		
		//Run extended constructor and bind its methods and variables
		if(clazz.extend){			
			instance.publicDynamic._super = instance.privateDynamic._super = clazz.extend.publicStatic.apply(null,args);
			
			var applyExtend = function(curExtend){
				if(!curExtend){
					return;
				} else if(curExtend.extend){
					applyExtend(curExtend.extend);
				}
				jfork.each(curExtend.signature.methods,function(i,v){
					if(!clazz.signature.methods[i]){
						var contexts = [instance.privateDynamic];
						if(!v.isPrivate){
							contexts.push(instance.publicDynamic);
						}
						var applyTo = curExtend.staticMapping.methods[i];
						if(!v.isStatic){
							applyTo = curExtend.instances[curExtend.instances.length-1].dynamicMapping.methods[i];
						}
						bindMethod(v,applyTo,contexts);	
					}
				});
				jfork.each(curExtend.signature.variables,function(i,v){
					if(!clazz.signature.variables[i]){
						var contexts = [instance.privateDynamic];
						if(!v.isPrivate){
							contexts.push(instance.publicDynamic);
						}
						var applyTo = curExtend.staticMapping.variables[i];
						if(!v.isStatic){
							applyTo = curExtend.instances[curExtend.instances.length-1].dynamicMapping.variables[i];
						}
						bindVariable(v,applyTo,contexts);	
					}
				});
			};	
			applyExtend(clazz.extend);
		}
				
		//Bind Variables and Methods to Instance
		jfork.each(clazz.signature.methods,function(i,v){
			var contexts = [instance.privateDynamic];
			if(!v.variations[0].isPrivate){
				contexts.push(instance.publicDynamic);
			}
			var bindTo = clazz.staticMapping.methods[i];
			if(!v.variations[0].isStatic){
				instance.dynamicMapping.methods[i] = instance.privateDynamic;
				bindTo = instance.dynamicMapping.methods[i];
			}
			bindMethod(v,bindTo,contexts);	
		});
		jfork.each(clazz.signature.variables,function(i,v){
			var contexts = [instance.privateDynamic];
			if(!v.isPrivate){
				contexts.push(instance.publicDynamic);
			}
			var storage = clazz.staticMapping.variables[i];
			if(!v.isStatic){
				instance.dynamicMapping.variables[i] = instance.storage;
				instance.storage[i] = v.value;
				storage = instance.dynamicMapping.variables[i];
			}
			bindVariable(v,storage,contexts);				
		});

		//Run Local Constructor
		var constructorFound = jfork.each(clazz.signature.constructors,function(i,v){
			if(checkParams(args,v)){
				v.value.apply(instance.privateDynamic,args);
				return true;
			}
		});
		if(!constructorFound && (clazz.signature.constructors.length > 0 || (clazz.signature.constructors.length == 0 && args.length > 0))){
			jfork.Class.error("No constructor found matching these parameters.");
		}

		return instance.publicDynamic;
	};//End newClass
	
	
	//Setup Static Contexts
	clazz.publicStatic = newClass;
	clazz.privateStatic = bind(newClass);
	
	//Add prototypes for instanceof
	clazz.publicStatic.prototype = extend ? new extend.publicStatic() : {};
	clazz.publicStatic.prototype.constructor = clazz.publicStatic;
	

	
	
	
	//Defines static and stores dynamic to defaultSignature - from static methods and Class
	clazz.publicStatic.define = function(a,b){		
		if(jfork.is.Object(a)){
			jfork.each(a,function(i,v){
				clazz.publicStatic.define(i,v);
			});
			return clazz.publicStatic;
		}
		var signature = buildSignature(a,b);
		
		//Variable
		if(!jfork.is.Function(signature.value)){
			clazz.signature.variables[signature.name] = signature;
			if(signature.isStatic){
				clazz.storage[signature.name] = signature.value;
				clazz.staticMapping.variables[signature.name] = clazz.storage;
				var contexts = [clazz.privateStatic];
				if(!signature.isPrivate){
					contexts.push(clazz.publicStatic);
				}
				jfork.each(clazz.instances,function(i,v){
					contexts.push(v.privateDynamic);
					if(!signature.isPrivate){
						contexts.push(v.publicDynamic);						
					}
				});
				bindVariable(signature,clazz.storage,contexts);
			} else {
				jfork.each(clazz.instances,function(i,v){
					v.storage[signature.name] = signature.value;
					v.dynamicMapping.variables[signature.name] = v.storage;
					var contexts = [v.privateDynamic];
					if(!signature.isPrivate){
						contexts.push(v.publicDynamic);	
					}
					bindVariable(signature,v.storage,contexts);
				});
			}
			
		//Constructor
		} else if(signature.name == "construct") {
			var isDuplicate = jfork.each(clazz.signature.constructors,function(i,v){
				if(areParamsEqual(signature,v)){
					return true;
				}
			});
			if(isDuplicate){
				jfork.Class.error("Cannot create two constructors with the same parameters.");
			}				
			clazz.signature.constructors.push(signature);

		
		//Method
		} else {
			if(!clazz.signature.methods[signature.name]){
				clazz.signature.methods[signature.name] = {value:function(){},variations:[]};
			} else {
				var isDuplicate = jfork.each(clazz.signature.methods[signature.name].variations,function(i,v){
					if(areParamsEqual(signature,v)){
						return true;
					}
				});
				if(isDuplicate){
					jfork.Class.error(signature.name + ": Cannot create two methods with the same signatures.");
				}
			}
			clazz.signature.methods[signature.name].variations.push(signature);
			clazz.signature.methods[signature.name].value = buildMethod(clazz.signature.methods[signature.name].variations);
			if(signature.isStatic){
				clazz.staticMapping.methods[signature.name] = clazz.privateStatic;
				var contexts = [clazz.privateStatic];
				if(!signature.isPrivate){
					contexts.push(clazz.publicStatic);
				}
				jfork.each(clazz.instances,function(i,v){
					contexts.push(v.privateDynamic);
					if(!signature.isPrivate){
						contexts.push(v.publicDynamic);						
					}
				});
				bindMethod(clazz.signature.methods[signature.name],clazz.privateStatic,contexts);			
			} else {
				jfork.each(clazz.instances,function(i,v){
					v.dynamicMapping.methods[signature.name] = v.privateDynamic;
					var contexts = [v.privateDynamic];
					if(!signature.isPrivate){
						contexts.push(v.publicDynamic);	
					}
					bindMethod(clazz.signature.methods[signature.name],v.privateDynamic,contexts);
				});
			}
			
		}		
		
		return clazz.publicStatic;
	};
	
	//Extend - extends the current class to create a new one
	clazz.publicStatic.extend = function(extendClassSignature){
		return jfork.Class(extendClassSignature,clazz);
	};
	
	//Setup default Class Signature
	clazz.publicStatic.define(defaultSignature);
	
	//Setup extended Class Signature
	var applyStaticExtend = function(curExtend){
		if(!curExtend){
			return;
		} else if(curExtend.extend){
			applyStaticExtend(curExtend.extend);
		}
		jfork.each(curExtend.signature.methods,function(i,v){
			if(v.variations[0].isStatic && !clazz.signature.methods[i]){
				clazz.staticMapping.methods[i] = curExtend.staticMapping.methods[i];
				var contexts = [clazz.privateStatic];
				if(!v.isPrivate){
					contexts.push(clazz.publicStatic);
				}
				bindMethod(v,clazz.staticMapping.methods[i],contexts);	
			}
		});
		jfork.each(curExtend.signature.variables,function(i,v){
			if(v.isStatic && !clazz.signature.variables[i]){
				clazz.staticMapping.variables[i] = curExtend.staticMapping.variables[i];
				var contexts = [clazz.privateStatic];
				if(!v.isPrivate){
					contexts.push(clazz.publicStatic);
				}
				bindVariable(v,clazz.staticMapping.variables[i],contexts);	
			}
		});
	};	
	applyStaticExtend(clazz.extend);


	return clazz.publicStatic;
};


//jfork.Class Options
jfork.Class.error = function(msg){
	throw new Error(msg);
};


//Helpers - each, bind, addTypeCheck, load, 
//Default Classes - AJAX, API, DAO, Group, Widget, 
//Extra Classes - Timer, Data (prettyTime), Color, Animation, Canvas, Image, Sound








var _jfork = window.jfork;
window.jfork = jfork;
	
})(window);




/*
 *

  DOCUMENTATION
  - Show argument types
  - Common Patterns using JFork
  - Talk about speed - http://jsperf.com/getter-setter/8



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

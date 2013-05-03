/*!
 * jfork JavaScript Framework v1.1
 * http://jfork.com/
 *
 * Copyright 2012 The Jeffries Company and other contributors
 * Released under the MIT license
 * https://github.com/JeffriesCo/JFork/blob/master/LICENSE
 */




window.jfork = {};




//-----------------------------------------------------------------------------
//									JFORK BASE
//-----------------------------------------------------------------------------
jfork.extend = function(obj1,obj2){
	if(obj2){
		for(var o in obj2){
			obj1[o] = obj2[o];
		}
	}
	return obj1;
};

jfork.each = function(o,func){
	if(!o){
		return;
	} else if(o.constructor == Array){
		for(var i=0, len=o.length; i<len; i++){
			if(func(i,o[i],o) === false){
				break;
			}
		}
	} else {
		for(var i in o){
			if(func(i,o[i],o) === false){
				break;
			}
		}
	}
};


jfork.bind = function(func,context){
	return function(){
		return func.apply(context,Array.prototype.slice.call(arguments));
	};
};

jfork.addEvent = function(elem,type,func){
	if(elem.attachEvent){
		elem['e'+type+func] = func;
		elem[type+func] = function(){elem['e'+type+func]( window.event );};
		elem.attachEvent( 'on'+type, elem[type+func] );
	} else {
		elem.addEventListener(type,func,false);
	}
};

jfork.load = (function(func){
	var isLoaded = false;
	var beforeLoad = [];
	
	jfork.addEvent(window,"load",function(){
		jfork.each(beforeLoad,function(i,v){
			v();
		});
		isLoaded = true;
	});
	
	return function(func){
		isLoaded ? func() : beforeLoad.push(func);
	};	
})();

jfork.css = function(elem,props){
	for(var p in props){
		elem.style[p] = props[p];
	}
};

jfork.isElement = function(o){ return o && ("undefined" !== typeof o.childNodes || o.nodeType) ? true : false; };



//-----------------------------------------------------------------------------
//									JFORK METRICS
//-----------------------------------------------------------------------------
jfork.position = function(elem){
	for (var lx=0, ly=0; elem != null; lx += elem.offsetLeft, ly += elem.offsetTop, elem = elem.offsetParent);
	return {left: lx,top: ly};
};

jfork.height = function(elem){
	return elem.offsetHeight;	
};

jfork.width = function(elem){
	return elem.offsetWidth;	
};

jfork.windowDimensions = function(){
	if(!window.innerWidth){
		if(!(document.documentElement.clientWidth == 0)){
			return {width:document.documentElement.clientWidth, height:document.documentElement.clientHeight};
		} else {
			return {width:document.body.clientWidth, height:document.body.clientHeight};
		}
	}
	return {width:window.innerWidth, height:window.innerHeight};
};




//-----------------------------------------------------------------------------
//									DATA TYPE
//-----------------------------------------------------------------------------
jfork.dao = function(args){
	
	var reservedNames = {data:true,parse:true,put:true,get:true,getAll:true};
	
	args = jfork.extend({
		data:{},
		parse:function(o){ return o; },
		put:function(){ return true; },
		get:function(){ return null; },
		getAll:function(){ return []; }
	},args);
	
	var dao = function(instance){
		instance = instance || {};
		
		//Initialize data
		for(var a in args.data){
			if(instance[a]===undefined){
				instance[a] = args.data[a];
			}
		}
		
		//Parse data
		instance = args.parse.call(instance,instance);
		
		jfork.each(args,function(i,v){
			if(v instanceof Function && !reservedNames[i]){
				instance[i] = jfork.bind(v,instance);	
			}
		});
		
		//Add update
		instance.updateData = function(newData){
			newData = args.parse.call(instance,newData);
			for(var d in args.data){
				if(newData[d] !== null || newData[d] !== undefined){
					instance[d] = newData[d];
				}
			}
		}
		
		//Add put
		instance.put = function(){
			return args.put.apply(instance,Array.prototype.slice.call(arguments));
		};
		
		//Add toString
		instance.toString = function(){
			var data = {};
			for(var a in args.data){
				data[a] = instance[a];
			}
			return JSON.stringify(data);
		}

		return instance;
	};
	
	dao.get = jfork.bind(args.get,dao);
	
	dao.getAll = jfork.bind(args.getAll,dao);
	
	return dao;	
};






//-----------------------------------------------------------------------------
//									AJAX
//-----------------------------------------------------------------------------
jfork.ajax = function(args){
	var XMLhttp = jfork.ajax.request();	
	XMLhttp.onreadystatechange=function() {
		if(XMLhttp.readyState == 4){
			if(args.onComplete){
				args.onComplete(XMLhttp.responseText,XMLhttp);	
			}
			if(XMLhttp.status == 200){
				if(args.onSuccess){
					args.onSuccess(XMLhttp.responseText,XMLhttp);	
				}
			} else {
				if(args.onFail){
					args.onFail(XMLhttp.responseText,XMLhttp);	
				}
			}
		}
	};
	
	var dataArray = [];
	if(args.data){
		for(var d in args.data){
			if(args.data[d].constructor == Array){
				for(var i=0; i<args.data[d].length; i++){
					dataArray.push(encodeURIComponent(d) + "=" + encodeURIComponent(args.data[d][i]));
				}
			} else {
				dataArray.push(encodeURIComponent(d) + "=" + encodeURIComponent(args.data[d]));
			}
		}
	}	
	var dataString = dataArray.join("&");
	
	if(args.method && args.method == "POST"){
		XMLhttp.open("POST", args.url, true);
		if(args.contentType){
			XMLhttp.setRequestHeader("Content-type", args.contentType);			
		} else {
			XMLhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		}
		XMLhttp.send(dataString);
	} else {
		if(args.url.indexOf("?") == -1){ args.url += "?"; }
		if(args.url.indexOf("=") != -1){ args.url += "&"; }	
		XMLhttp.open("GET", args.url+dataString, true);
		XMLhttp.send("");
	}
	

	return XMLhttp;
};

jfork.ajax.request = function(){
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
	if(XMLhttp){ XMLhttp.abort(); }
	return XMLhttp;
};




//-----------------------------------------------------------------------------
//									API
//-----------------------------------------------------------------------------
jfork.api = function(args){ //{urls:{name:url,..},onComplete:function(responseText,XMLHttp){},contentType:null}
	
	args = jfork.extend({urls:null,contentType:null,onComplete:function(responseText,XMLhttp){ 
		return (XMLhttp.status == 200) ? true : false; 
	}},args);
	
	var getPath = function(name, params){
		if(args.urls[name]){
			var path = args.urls[name];
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
	};
	
	var calls = {};
	
	for(var u in args.urls){
		(function(callName,callUrl){
			
			calls[callName] = function(args2){
				args2 = jfork.extend({
					params:"",
					data:{},
					method:"GET",
					contentType:null,
					onSuccess:function(){},
					onFail:function(){},
					onComplete:function(){}
				},args2);
				var path = getPath(callName, args2.params);
				if(!path){ return; }
				
				for(var d in args2.data){
					if(args2.data[d] === null || args2.data[d] === undefined){
						delete args2.data[d];
					}
				}
				
				jfork.ajax({
					url:path,
					method:args2.method,
					data:args2.data,
					contentType:args2.contentType || args.contentType,
					onComplete:function(responseText,XMLHttp){
						var json;
						try {
							json =JSON.parse(responseText);
						} catch(e){
							json = {};
						}
						if(args.onComplete(json,XMLHttp,args2)){
							args2.onSuccess(json,XMLHttp,args2);
						} else {
							args2.onFail(json,XMLHttp,args2);
						}
						args2.onComplete(json,XMLHttp,args2);
					}
				});
			};
			
		})(u,args.urls[u]);
	}
	
	
	return calls;	
};



//-----------------------------------------------------------------------------
//								JFORK UPLOAD
//-----------------------------------------------------------------------------
jfork.upload = function(args){
	args = jfork.extend({
		data:{},
		resize:null,
		multiple:false,
		retry:0,
		retryDelay:0,
		url:"",
		name:"file",
		type:"image/jpeg",
		parent:document.body,
		onAsyncInitialize:null,
		onBeforeLoad:function(){},//{}
		onProgress:function(){},
		onRetry:function(){},
		onError:function(){},
		onLoad:function(){},
		onLoadWhen:function(o){ return (o.xhr.status == 200); }
	},args);
	
	var dataURItoBlob = function(dataURI) {
	    var binary = atob(dataURI.split(',')[1]);
	    var array = [];
	    for(var i = 0; i < binary.length; i++) {
	        array.push(binary.charCodeAt(i));
	    }
	    return new Blob([new Uint8Array(array)], {type: args.type});
	};
	
	var form = document.createElement("form");
	form.setAttribute("enctype","multipart/form-data");
	form.setAttribute("method","post");
	form.setAttribute("action",args.url);
	args.parent.appendChild(form);
	
	var file = document.createElement("input");
	file.setAttribute("type","file");
	if(args.multiple){
		file.setAttribute("multiple","multiple");		
	}
	form.appendChild(file);
	
	var sendFile = function(index){
		var xhr = jfork.ajax.request();
		var fileData = file.files[index];
		var retry = args.retry;
		
		var upload = function(){
			args.onBeforeLoad({args:args,data:args.data,xhr:xhr,index:index,files:file.files});
			var formData = new FormData();
			for(var d in args.data){
				formData.append(d, args.data[d]);
			}
			formData.append(args.name, fileData);
			xhr.open("POST", args.url, true);
			xhr.setRequestHeader("X_FILENAME", file.files[index].name + index);
			//xhr.setRequestHeader("Access-Control-Allow-Origin","*");
			xhr.send(formData);
		};
		
		if(args.onProgress){
			xhr.upload.addEventListener("progress", function(e) {
				args.onProgress({percent:(e.loaded / e.total),index:index});
			}, false);
		}
		
		

		xhr.onreadystatechange = function(e) {
			if (xhr.readyState == 4) {
				var isComplete = (index == file.files.length-1) ? true : false;
				var params = {args:args,data:args.data,xhr:xhr,response:xhr.responseText,index:index,files:file.files,isComplete:isComplete};
				if(args.onLoadWhen(params)){
					args.onLoad(params);
					if(!isComplete){
						sendFile(index+1);
					}
				} else if(retry-- > 0) {
					args.onRetry(params);
					setTimeout(function(){	upload(); },args.retryDelay);
				} else {
					args.onError(params);
					if(!isComplete){
						sendFile(index+1);
					}
				}
			}
		};
		
		//Resize the image using canvas
		if(args.resize && window.Blob){
			var img = new Image();
			var reader = new FileReader();
			img.onload = function(){
				var jImage = jfork.image(img);
				var base64Url = jImage.resize({maxWidth:args.resize.width,maxHeight:args.resize.height,type:args.type});
				fileData = dataURItoBlob(base64Url);
				upload();
			};
			reader.onload = function(e) {	
				img.src = e.target.result;
			};
			reader.readAsDataURL(file.files[index]);
			
		//Upload original
		} else {
			upload();
		}
		
				
	};
	
	
	jfork.addEvent(file,"change",function(){
		if(file.value == ""){ return; }
		if(args.onAsyncInitialize){
			args.onAsyncInitialize(args,function(){
				sendFile(0);
			});
		} else {
			sendFile(0);			
		}
	});
	
	return form;
};




//-----------------------------------------------------------------------------
//									IMAGE
//-----------------------------------------------------------------------------
jfork.image = function(img){ //Must be a loaded image object	
	
	return {
		resize:function(args){
			args = jfork.extend({
				maxWidth:0,
				maxHeight:0,
				type:"image/png",
				onLoad:null
			},args);
			
			var canvas = document.createElement('canvas');
			var ctx = canvas.getContext("2d");

			var width = img.width;
			var height = img.height;
			
			if(args.maxWidth/args.maxHeight < width/height) {
				if(width > args.maxWidth) {
					height *= args.maxWidth / width;
					width = args.maxWidth;
				}
			} else {
				if (height > args.maxHeight) {
					width *= args.maxHeight / height;
					height = args.maxHeight;
				}
			}
			
			canvas.width = width;
			canvas.height = height;					
			ctx.drawImage(img, 0, 0, width, height);
			
			var dataurl = canvas.toDataURL(args.type,0.95);	
			
			//Trying to garbage collect
			document.body.appendChild(canvas);
			document.body.removeChild(canvas);
			canvas = null;
			ctx = null;
			
			if(args.onLoad){
				var newImage = new Image();
				newImage.onload = function(){
					args.onLoad(newImage);
				};
				newImage.src = dataurl;
			}			
			
			return dataurl;
		},
		crop:function(args){
			args = jfork.extend({
				sX:0,
				sY:0,
				dX:0,
				dY:0,
				type:"image/png",
				onLoad:null
			},args);
			
			var canvas = document.createElement('canvas');
			var ctx = canvas.getContext("2d");

			var width = args.dX-args.sX;
			var height = args.dY-args.sY;

			canvas.width = width;
			canvas.height = height;
			ctx.drawImage(img,args.sX,args.sY,width,height,0,0,width,height);
			
			var dataurl = canvas.toDataURL(args.type,0.95);	
			
			//Trying to garbage collect
			document.body.appendChild(canvas);
			document.body.removeChild(canvas);
			canvas = null;
			ctx = null;
			
			if(args.onLoad){
				var newImage = new Image();
				newImage.onload = function(){
					args.onLoad(newImage);
				};
				newImage.src = dataurl;
			}			
			
			return dataurl;
		}
	};
};




//-----------------------------------------------------------------------------
//									GROUP
//-----------------------------------------------------------------------------
jfork.group = (function(){
	
	var groups = [];
	var zindex = 1000; //Need to loop through and find the highest first	
	
	var center = function(elem){
		var dim = jfork.windowDimensions();
		elem.style.top = Math.floor((dim.height - elem.offsetHeight)/2) + "px";
		elem.style.left = Math.floor((dim.width - elem.offsetWidth)/2) + "px";
	};
	
	jfork.addEvent(window,"resize",function(){
		jfork.each(groups,function(i,v){
			if(v.center){
				center(v.element);
			}
		});
	});
	
	return function(args){
		args = jfork.extend({
			element:null,
			parent:null,
			center:false,
			isFront:false,
			cover:false,
			coverClass:"",
			showCover:function(){ if(args.cover){ args.cover.style.display = "block"; }},
			hideCover:function(){ if(args.cover){ args.cover.style.display = "none"; }},
			mask:false,
			maskClass:"",
			showMask:function(){ if(args.mask){ args.mask.style.display = "block"; }},
			hideMask:function(){ if(args.mask){ args.mask.style.display = "none"; }},
			scroll:false,
			type:null,
			isVisible:false,
			display:"block",
			load:function(){},
			show:function(){},
			toggle:function(){}, //TODO
			hide:function(){},
			bottom:function(){} //TODO
		},args);
		if(args.element == null){ return null; }
		
		for(var a in args){
			switch(a){
				case "load":
					jfork.load(function(){
						if(typeof args.element == 'string'){
							args.element = document.getElementById(args.element);
						}
						if(jfork.isElement(args.element) || (args.element && args.element.nodeType == 1 && args.element.tagName != undefined)) {
							groups.push(args);
						} else {
							return;
						}
						if(args.parent){
							if(typeof args.parent == 'string'){
								args.parent = document.getElementById(args.parent);
							}
							if(jfork.isElement(args.parent) || (args.parent && args.parent.nodeType == 1 && args.parent.tagName != undefined)) {
								if(args.element.offsetParent){
									args.element.offsetParent.removeChild(args.element);
								}
								args.parent.appendChild(args.element);
							}							
						}
						if(args.mask){
							args.mask = document.createElement("div");
							jfork.css(args.mask,{position:"absolute",display:"none",top:"0px",left:"0px",width:"100%",height:"100%",zIndex:(zindex+1)});
							args.mask.className = args.maskClass;
							args.element.appendChild(args.mask);
						}
						if(args.cover){
							args.cover = document.createElement("div");
							jfork.css(args.cover,{position:"fixed",display:"none",top:"0px",left:"0px",width:"100%",height:"100%"});
							args.cover.className = args.coverClass;
							args.element.parentNode.insertBefore(args.cover,args.element);
						}
						args.isVisible = args.element.style.display == args.display ? true : false;
						args.load.apply(args,[]);
					});
					break;
				case "show":
					var show = args.show;
					args.show = function(){
						if(args.isVisible){ return; }	
						if(args.type){
							for(var i=0; i<groups.length; i++){
								if(groups[i].type == args.type){
									groups[i].hide();
								}
							}
						}
						args.isVisible = true;
						args.element.style.display = args.display;
						if(args.isFront){
							args.element.style.zIndex = (++zindex);
						}
						if(args.cover){
							if(args.isFront){
								args.cover.style.zIndex = zindex-1;
							}
							args.showCover();
						}
						var rtn = show.apply(args,Array.prototype.slice.call(arguments));
						if(args.center){
							center(args.element);
						}						
						return rtn;
					};
					break;
				case "hide":
					var hide = args.hide;
					args.hide = function(){
						if(!args.isVisible){ return; }
						args.isVisible = false;
						if(args.cover){
							args.hideCover();
						}
						args.element.style.display = "none";
						return hide.apply(args,Array.prototype.slice.call(arguments));
					};
					break;
				default:
					if(args[a] instanceof Function){
						args[a] = jfork.bind(args[a],args);						
					}
			}
		}
		
		return args;
	};
})();




//-----------------------------------------------------------------------------
//									WIDGET
//-----------------------------------------------------------------------------
jfork.widget = function(args){

};










/*

Ideas:

Class - easier to use! - this is the root - jfork = jfork.Class
- Common use case is static vs dynamic
- Common case is extending
- Common case is constructor
- Common case is type checking
- Common case is one time use vs reusable...
- Overloading is NOT necessary


- Uncommon - private (no point?)
- Overloading? - maybe have a generic arguments default dude

New Datatypes - Only useful ones
Date - pretty time
API
Iterator - each - return value - if return; - continue;   if return val; - break;    each(array,func,easing,timing)
Looper (does easing as well)
Timer
Arguments

Panel/Group
-load,open,close,isOpen,toggle,cover,mask,scroll,bottom,parent,center,type(group together),top(top zindex), listener(for show/hide, etc) EXTENDABLE!
Dialog

IFrame - Extends Group?

Widget - parent(insertbefore,appentto),node(div),create,render,refresh,isRendered,click,focus,hover,hide(animate),show,remove EXTENDABLE!

Upload
Canvas

JSON - just use crockfords


-----------------------------------------------------
Example Group usage - NEEDS TO BE FLEXIBLE AND NOT USE CLASS THIS TIME!

var group1 = jfork.Group({
	element:document.getElementById("asdf"),
	type:"A", //clusters all type A groups together, only one open at a time
	parent:document.body, //Moves the group to here if not already there - useful for dialogs
	isOpen:true,
	center:true, //Centers dialog on resize and load
	cover:true, //Covers 
	mask:true, //Covers surface
	custom:"hello",
	load:function(){
		this.customMethod(1,2);
	},
	open:function(a,b,c){
	
	},
	customMethod:function(a,b){
	
	}
});

group1.custom == "hello"
group1.load(); //first customMethod


group.element = function(){ return document.getElementById("asdf"); } //Happends at load time
group.showAnimation = "";  expand from element, slide up, slide down, box expand


var dialog1 = jfork.Dialog({});
//Similar but autopopulates parent, center, cover, 




----------------------------------------------------------
Example usings arguments

var myfunction = function(){
	var args = jfork.Args({}); //Can it get caller.arguments?
};



----------------------------------------------------------
Example class usages


jfork.dao = jfork({
	data:{}
	var1:"boom"
});


dh.User = jfork({
	extend:jfork.dao,
	var1:"asdf",
	data:{ //Variables override
		id:12,
		name:"Adam"
	},
	method1:function(){
		this.Super
	},
	"private method2":function(){
	
	},
	"static method3":function(a,b,c){
	
	},
	"method4(int a, String b, var c)":function(a,b,c){
	
	},
	
});



























*/

/******************************************************************************
 *								TYPE CHECKING
 *****************************************************************************/
//-2,-1,0,1,2.1,123,"asdf",true,false,"123",undefined,null,window,document.body,[1,2,3],{a:2},document.getElementsByTagName("*"),new Date(),new RegExp()
testSuite("jfork.is - Type Checking",{
	//Check Existence
	"Check if exists":function(){
		this.assertExists(jfork.is);
		this.assertExists(jfork.is.Number);
	},
	
	//Number Happy Paths
	"Number Happy":function(){
		this.assertTrue(jfork.is.Number(-2),"-2");
		this.assertEquals(jfork.is(-2),"Number","-2");
		this.assertTrue(jfork.is.Number(-1),"-1");
		this.assertEquals(jfork.is(-1),"Number","-1");
		this.assertTrue(jfork.is.Number(0),"0");
		this.assertEquals(jfork.is(0),"Number","0");
		this.assertTrue(jfork.is.Number(1),"1");
		this.assertEquals(jfork.is(1),"Number","1");
		this.assertTrue(jfork.is.Number(2.1),"2.1");
		this.assertEquals(jfork.is(2.1),"Number","2.1");
		this.assertTrue(jfork.is.Number(1234),"1234");
		this.assertEquals(jfork.is(1234),"Number","1234");
	},
	
	//Number Sad Paths
	"Number Sad":function(){
		this.assertFalse(jfork.is.Number("asdf"),"asdf");
		this.assertFalse(jfork.is.Number("123"),"123");
		this.assertFalse(jfork.is.Number(true),"true");
		this.assertFalse(jfork.is.Number(false),"false");
		this.assertFalse(jfork.is.Number(undefined),"undefined");
		this.assertFalse(jfork.is.Number(null),"null");
		this.assertFalse(jfork.is.Number(window),"window");
		this.assertFalse(jfork.is.Number(document.body),"document.body");
		this.assertFalse(jfork.is.Number([1,2,3]),"[1,2,3]");
		this.assertFalse(jfork.is.Number({a:2}),"{a:2}");
		this.assertFalse(jfork.is.Number(document.getElementsByTagName("*")),"document.getElementsByTagName('*')");
		this.assertFalse(jfork.is.Number(new Date()),"new Date()");
		this.assertFalse(jfork.is.Number(new RegExp("////")),"new RegExp()");
	},
	
	//NodeList Happy Paths
	"NodeList Happy":function(){
		this.assertTrue(jfork.isNodeList(document.getElementsByTagName("div")));
	}
	
	
	
	//NodeList Sad Paths
	
	
});



/******************************************************************************
 *								CLASS
 *****************************************************************************/
testSuite("jfork.Class - Base Object",{
	//Setup Library Test
	"Existence":function(){
		this.assertExists(jfork.Class);
		this.assertTrue(jfork.is.Function(jfork.Class));
	},
	"Public Static":function(){

		var Animal = jfork.Class({
			"static hasBlood":true,
			"public static numEyes":2,
			"static setHasBlood":function(blood){
				this.hasBlood = blood;
			},
			"public static setNumEyes":function(eyes){
				this.numEyes = eyes;	
			}
		});
		
		this.assertExists(jfork.is.Function(Animal));

		var cat = new Animal();
		
		this.assertEquals(Animal.hasBlood,true);		
		this.assertEquals(Animal.numEyes,2);
		this.assertEquals(cat.hasBlood,true);
		this.assertEquals(cat.numEyes,2);
		
		Animal.setHasBlood(false);
		cat.setNumEyes(4);
		this.assertEquals(Animal.hasBlood,false);
		this.assertEquals(Animal.numEyes,4);
		this.assertEquals(cat.hasBlood,false);
		this.assertEquals(cat.numEyes,4);
		
		var dog = new Animal();
		dog.setNumEyes(8);
		this.assertEquals(dog.hasBlood,false);
		this.assertEquals(dog.numEyes,8);
		this.assertEquals(cat.numEyes,8);
		this.assertEquals(Animal.numEyes,8);
	},
	"Private Static":function(){

		var Animal = jfork.Class({
			"private static hasBlood":true,
			"private static numEyes":2,
			"static setHasBlood":function(blood){
				this.realSetHasBlood(blood);
			},
			"public setNumEyes":function(eyes){
				this.numEyes = eyes;	
			},
			"private static realSetHasBlood":function(blood){
				this.hasBlood = blood;	
			},
			"static getHasBlood":function(){
				return this.hasBlood;	
			},
			"static getNumEyes":function(){
				return this.numEyes;
			}
		});
		
		var cat = new Animal();
		this.assertEquals(Animal.numEyes,undefined);
		this.assertEquals(Animal.hasBlood,undefined);
		this.assertEquals(Animal.realSetHasBlood,undefined);
		this.assertEquals(cat.numEyes,undefined);
		this.assertEquals(cat.hasBlood,undefined);
		this.assertEquals(cat.realSetHasBlood,undefined);
		
		this.assertEquals(cat.getHasBlood(),true);
		this.assertEquals(cat.getNumEyes(),2);
		this.assertEquals(Animal.getHasBlood(),true);
		this.assertEquals(Animal.getNumEyes(),2);

		Animal.setHasBlood(false);
		cat.setNumEyes(4);
		this.assertEquals(cat.getHasBlood(),false);
		this.assertEquals(cat.getNumEyes(),4);
		this.assertEquals(Animal.getHasBlood(),false);
		this.assertEquals(Animal.getNumEyes(),4);
		this.assertEquals(Animal.numEyes,undefined);
		this.assertEquals(Animal.hasBlood,undefined);
		this.assertEquals(Animal.realSetHasBlood,undefined);
		this.assertEquals(cat.numEyes,undefined);
		this.assertEquals(cat.hasBlood,undefined);
		this.assertEquals(cat.realSetHasBlood,undefined);
	},
	"Public Dynamic":function(){

		var Animal = jfork.Class({
			hasBlood:true,
			"public numEyes":2,
			setHasBlood:function(blood){
				this.realSetHasBlood(blood);
			},
			"public setNumEyes":function(eyes){
				this.numEyes = eyes;	
			},
			getHasBlood:function(){
				return this.hasBlood;	
			}
		});
		
		var cat = new Animal();
		var dog = new Animal();

		this.assertEquals(Animal.numEyes,undefined);
		this.assertEquals(Animal.hasBlood,undefined);
		this.assertEquals(Animal.setHasBlood,undefined);
		this.assertEquals(Animal.setNumEyes,undefined);
		
		this.assertEquals(cat.hasBlood,true);
		this.assertEquals(cat.getHasBlood(),true);
		this.assertEquals(cat.numEyes,2);
		this.assertExists(cat.setHasBlood);
		this.assertExists(cat.setNumEyes);
		
		this.assertEquals(dog.hasBlood,true);
		this.assertEquals(dog.getHasBlood(),true);
		this.assertEquals(dog.numEyes,2);
		this.assertExists(dog.setHasBlood);
		this.assertExists(dog.setNumEyes);
		
		cat.hasBlood = false;
		dog.setNumEyes(4);
		
		this.assertEquals(cat.hasBlood,false,"A");
		this.assertEquals(cat.getHasBlood(),false,"B");
		this.assertEquals(cat.numEyes,2);
		
		this.assertEquals(dog.hasBlood,true,"D");
		this.assertEquals(dog.getHasBlood(),true,"E");
		this.assertEquals(dog.numEyes,4,"F");
		
	},
	"Private Dynamic":function(){
		
		 var Animal = jfork.Class({
			"private hasBlood":true,
			"private numEyes":2,
			setNumEyes:function(eyes){
				this.numEyes = eyes;
			},
			getNumEyes:function(){
				return this.numEyes;	
			},
			getHasBlood:function(){
				return this.realGetHasBlood();	
			},
			"private realGetHasBlood":function(){
				return this.hasBlood;	
			}
		});
		 
		var cat = new Animal();
		var dog = new Animal();

		this.assertEquals(Animal.numEyes,undefined);
		this.assertEquals(Animal.hasBlood,undefined);
		this.assertEquals(Animal.realGetHasBlood,undefined);
		
		this.assertEquals(cat.numEyes,undefined);
		this.assertEquals(cat.hasBlood,undefined);
		this.assertEquals(cat.realGetHasBlood,undefined);
		
		cat.setNumEyes(4);
		this.assertEquals(cat.getNumEyes(),4);
		this.assertEquals(dog.getNumEyes(),2);
		
		dog.setNumEyes(8);
		this.assertEquals(cat.getNumEyes(),4);
		this.assertEquals(dog.getNumEyes(),8);
	},
	"Extends":function(){
		var Animal = jfork.Class({
			"public static hasBlood":true,
			numLegs:4,
			numEyes:2,
			"public getHasBlood":function(){
				return this.hasBlood;
			},
			"public setHasBlood":function(blood){
				this.hasBlood = blood;	
			}
		});
		
		var Mammal = jfork.Class({
			extend:Animal,
			"private static hasFur":true,
			numArms:4,
			setHasFur:function(fur){
				this.hasFur = fur;
			},
			getNumArms:function(){
				return this.numArms;	
			},
			setNumArms:function(arms){
				this.numArms = arms;	
			},
			"private reallySetNumArms":function(arms){
				this.setNumArms(arms);
			}
		});
		
		var Human = jfork.Class({
			extend:Mammal,
			numLegs:2,
			"private static isSmart":true,
			gender:"male",
			"public getHasFur":function(){
				return this.hasFur;	
			},
			setArmsToNormal:function(){
				this.reallySetNumArms(2);	
			}
		});
		
		var fish = new Animal();
		var dog = new Mammal();
		var jane = new Human();
		
		this.assertEquals(Animal.hasBlood,true);
		this.assertEquals(fish.hasBlood,true);
		this.assertEquals(Mammal.hasBlood,undefined);
		this.assertEquals(dog.hasBlood,undefined);
		this.assertEquals(Human.hasBlood,undefined);
		this.assertEquals(jane.hasBlood,undefined);
		
		this.assertEquals(fish.getHasBlood(),true);
		this.assertEquals(dog.getHasBlood(),true);
		this.assertEquals(jane.getHasBlood(),true);
		
		jane.setHasBlood(false);
		this.assertEquals(Animal.hasBlood,false);
		this.assertEquals(fish.hasBlood,false);
		this.assertEquals(Mammal.hasBlood,undefined);
		this.assertEquals(dog.hasBlood,undefined);
		this.assertEquals(Human.hasBlood,undefined);
		this.assertEquals(jane.hasBlood,undefined);
		
		this.assertEquals(fish.getHasBlood(),false);
		this.assertEquals(dog.getHasBlood(),false);
		this.assertEquals(jane.getHasBlood(),false);
		
		this.assertEquals(fish.numLegs,4);
		this.assertEquals(dog.numLegs,4);
		this.assertEquals(jane.numLegs,2,"X");
		
		fish.numLegs = 0;
		this.assertEquals(fish.numLegs,0);
		this.assertEquals(dog.numLegs,4);
		this.assertEquals(jane.numLegs,2,"Z");
		
		this.assertEquals(fish.numArms,undefined);
		this.assertEquals(dog.numArms,4);
		this.assertEquals(jane.numArms,4);
		this.assertEquals(dog.getNumArms(),4);
		this.assertEquals(jane.getNumArms(),4);
		
		jane.numArms = 2;
		this.assertEquals(fish.numArms,undefined);
		this.assertEquals(dog.numArms,4,"A");
		this.assertEquals(dog.getNumArms(),4,"B");
		this.assertEquals(jane.numArms,2,"C");
		this.assertEquals(jane.getNumArms(),2,"D");
		
		jane.setNumArms(3);
		dog.setNumArms(0);
		this.assertEquals(fish.numArms,undefined);
		this.assertEquals(dog.numArms,0,"A");
		this.assertEquals(dog.getNumArms(),0,"B");
		this.assertEquals(jane.numArms,3,"C");
		this.assertEquals(jane.getNumArms(),3,"D");
		
		jane.setArmsToNormal();
		this.assertEquals(fish.numArms,undefined);
		this.assertEquals(dog.numArms,0);
		this.assertEquals(dog.getNumArms(),0);
		this.assertEquals(jane.numArms,2);
		this.assertEquals(jane.getNumArms(),2);
		
		this.assertEquals(jane.getHasFur(),true);
		dog.setHasFur(false);
		this.assertEquals(jane.getHasFur(),false);
		
		
	},
	"Super Methods":function(){
		var Animal = jfork.Class({
			"private static numLegs":4,
			"public numArms":4,
			numEyes:4,
			"public getNumLegs":function(){
				return this.numLegs;
			},
			getNumArms:function(){
				return this.numArms;
			},
			"public setDefaults":function(){
				this.numArms = 8;
				this.numLegs = 8;
				this.numEyes = 8;
				return 10;
			}
		});
		
		var Human = jfork.Class({
			extend:Animal,
			numEyes:2,						
			setDefaults:function(){
				this.numArms = this.parent.setDefaults();
				this.numLegs = 2;
			}
		});
		
		var dog = new Animal();
		var jane = new Human();
		
		this.assertEquals(dog.numArms,4);
		this.assertEquals(dog.numEyes,4);
		this.assertEquals(dog.getNumLegs(),4);
		this.assertEquals(dog.getNumArms(),4);
		this.assertEquals(jane.numArms,4);
		this.assertEquals(jane.numEyes,2);
		this.assertEquals(dog.getNumLegs(),4);
		this.assertEquals(jane.getNumArms(),4);
		
		dog.setDefaults();
		this.assertEquals(dog.numArms,8);
		this.assertEquals(dog.numEyes,8);
		this.assertEquals(dog.getNumLegs(),8);
		this.assertEquals(dog.getNumArms(),8);
		this.assertEquals(jane.numArms,4);
		this.assertEquals(jane.numEyes,2);
		this.assertEquals(jane.getNumLegs(),8);
		this.assertEquals(jane.getNumArms(),4);
		
		jane.setDefaults();
		this.assertEquals(dog.numArms,8);
		this.assertEquals(dog.numEyes,8);
		this.assertEquals(dog.getNumLegs(),2);
		this.assertEquals(dog.getNumArms(),8);
		this.assertEquals(jane.numArms,10);
		this.assertEquals(jane.numEyes,8);
		this.assertEquals(jane.getNumLegs(),2);
		this.assertEquals(jane.getNumArms(),10);
		
	},
	"Constructor":function(){
		var Animal = jfork.Class({
			numEyes:4,
			type:"fish",
			numEars:2,
			construct:function(eyes,type){
				this.numEyes = eyes;
				this.type = type;
				this.numEars = 8;
			}
		});
		
		var dog = new Animal(2,"Mammal");
		var spider = new Animal(8,"Bug");
		
		this.assertEquals(dog.numEyes,2);
		this.assertEquals(dog.type,"Mammal");
		this.assertEquals(dog.numEars,8);
		this.assertEquals(spider.numEyes,8);
		this.assertEquals(spider.type,"Bug");
		this.assertEquals(spider.numEars,8);
	},
	"Method Dynamic Return Types":function(){
		var Animal = jfork.Class({
			getNumber:function(){
				return 1.1;	
			},
			getFunction:function(){
				return function(){};
			},
			getNodeList:function(){
				return document.body.getElementsByTagName("div");	
			},
			getDate:function(){
				return new Date();	
			},
			getElement:function(){
				return document.body;	
			},
			getArray:function(){
				return ["a","b","c"];	
			},
			getObject:function(){
				return {a:1,b:2,c:3};	
			},
			getString:function(){
				return "hello world";	
			},
			getBoolean:function(){
				return true;	
			},
			getNull:function(){
				return null;	
			},
			getRegExp:function(){
				return new RegExp();	
			},
			getUndefined:function(){
				return undefined;	
			}
		});
		
		var dog = new Animal();
		
		this.assertTrue(jfork.isNumber(dog.getNumber()),"isNumber");
		this.assertTrue(jfork.isFunction(dog.getFunction()),"isFunction");
		this.assertTrue(jfork.isNodeList(dog.getNodeList()),"isNodeList");
		this.assertTrue(jfork.isDate(dog.getDate()),"isDate");
		this.assertTrue(jfork.isElement(dog.getElement()),"isElement");
		this.assertTrue(jfork.isArray(dog.getArray()),"isArray");
		this.assertTrue(jfork.isObject(dog.getObject()),"isObject");
		this.assertTrue(jfork.isString(dog.getString()),"isString");
		this.assertTrue(jfork.isBoolean(dog.getBoolean()),"isBoolean");
		this.assertTrue(jfork.isNull(dog.getNull()),"isNull");
		this.assertTrue(jfork.isRegExp(dog.getRegExp()),"isRegExp");
		this.assertTrue(jfork.isUndefined(dog.getUndefined()),"isUndefined");
	},
	"Method Static Return Types":function(){
		var Animal = jfork.Class({
			"static getNumber":function(){
				return 1.1;	
			},
			"static getFunction":function(){
				return function(){};
			},
			"static getNodeList":function(){
				return document.body.getElementsByTagName("div");	
			},
			"static getDate":function(){
				return new Date();	
			},
			"static getElement":function(){
				return document.body;	
			},
			"static getArray":function(){
				return ["a","b","c"];	
			},
			"static getObject":function(){
				return {a:1,b:2,c:3};	
			},
			"static getString":function(){
				return "hello world";	
			},
			"static getBoolean":function(){
				return true;	
			},
			"static getNull":function(){
				return null;	
			},
			"static getRegExp":function(){
				return new RegExp("a");	
			},
			"static getUndefined":function(){
				return undefined;	
			}
		});

		this.assertTrue(jfork.isNumber(Animal.getNumber()),"isNumber");
		this.assertTrue(jfork.isFunction(Animal.getFunction()),"isFunction");
		this.assertTrue(jfork.isNodeList(Animal.getNodeList()),"isNodeList");
		this.assertTrue(jfork.isDate(Animal.getDate()),"isDate");
		this.assertTrue(jfork.isElement(Animal.getElement()),"isElement");
		this.assertTrue(jfork.isArray(Animal.getArray()),"isArray");
		this.assertTrue(jfork.isObject(Animal.getObject()),"isObject");
		this.assertTrue(jfork.isString(Animal.getString()),"isString");
		this.assertTrue(jfork.isBoolean(Animal.getBoolean()),"isBoolean");
		this.assertTrue(jfork.isNull(Animal.getNull()),"isNull");
		this.assertTrue(jfork.isRegExp(Animal.getRegExp()),"isRegExp");
		this.assertTrue(jfork.isUndefined(Animal.getUndefined()),"isUndefined");
	},
	"Variables Dynamic Set Types":function(){
		var Animal = jfork.Class({
			getNumber:1.1,
			getFunction:null,//set later
			getNodeList:document.getElementsByTagName("div"),
			getDate:new Date(),
			getElement:document.body,
			getArray:["a","b","c"],
			getObject:{a:1,b:2,c:3},
			getString:"hello world",
			getBoolean:true,
			getNull:null,
			getRegExp:(new RegExp("a")),
			getUndefined:undefined
		});
		
		var dog = new Animal();
		
		this.assertTrue(jfork.isNumber(dog.getNumber),"isNumber: " + dog.getNumber);
		dog.getFunction = function(){};
		this.assertTrue(jfork.isFunction(dog.getFunction),"isFunction: " + dog.getFunction);
		this.assertTrue(jfork.isNodeList(dog.getNodeList),"isNodeList: " + dog.getNodeList);
		this.assertTrue(jfork.isDate(dog.getDate),"isDate: " + dog.getDate);
		this.assertTrue(jfork.isElement(dog.getElement),"isElement: " + dog.getElement);
		this.assertTrue(jfork.isArray(dog.getArray),"isArray: " + dog.getArray);
		this.assertTrue(jfork.isObject(dog.getObject),"isObject: " + dog.getObject);
		this.assertTrue(jfork.isString(dog.getString),"isString: " + dog.getString);
		this.assertTrue(jfork.isBoolean(dog.getBoolean),"isBoolean: " + dog.getBoolean);
		this.assertTrue(jfork.isNull(dog.getNull),"isNull: " + dog.getNull);
		this.assertTrue(jfork.isRegExp(dog.getRegExp),"isRegExp: " + dog.getRegExp);
		window.dog = dog;
		this.assertTrue(jfork.isUndefined(dog.getUndefined),"isUndefined: " + dog.getUndefined);
	},
	"Override Extended Methods":function(){
		
	},
	"Returns Type Checking":function(){
		
	},
	"Arguments Type Checking":function(){
		
	},
	"Override Methods with different arguments":function(){
		
	}
});











/******************************************************************************
 *								JSON
 *****************************************************************************
testSuite("jfork.JSON",{
	"Convert to JSON":function(){
		var jsonString = "{a:1,b:[1,2,3],c:{d:2}}";
		var json = jfork.JSON.parse(jsonString);
		this.assertEquals(json.a,1);
		this.assertEquals(json.b[1],2);
		this.assertEquals(json.c.d,2);
	},
	"Convert from JSON":function(){
		var json = {a:1,b:[1,2,3],c:{d:2}};
		var jsonString = jfork.JSON.stringify(json);
		this.assertEquals(jsonString,'{"a":1,"b":[1,2,3],"c":{"d":2}}');
	}
});


*/
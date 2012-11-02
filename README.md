[jfork](http://jfork.com/) - Object Oriented JavaScript
==================================================

Overview
--------------------------------------

jfork is a JavaScript Framework which perfectly performance and usability. While most common frameworks focus entirely on performance, often the usability aspect of the framework is overlooked. jfork is not only fast and robust, it is also one of the simpliest frameworks to learn and get started. This site provides many tools, tutorials, and documentation to begin coding your project.

---

## Tutorial and Examples ##

---

### Type Checking ###

```javascript
//Check the type Explicitly
if(jfork.is.Number(123)){  
	console.log("Yay!  123 is a Number");  
}

//Get the type
console.log("123 is of type " + jfork.is(123));
```

Output:

```javascript
Yay!  123 is a Number
123 is of type Number
```

---

### Object Oriented Syntax ###
	
Basic Class Example:

```javascript
//Define the Class
var Animal = jfork.Class({
	"static isAlive":true,
	"private numEyes":2,
	construct:function(numEyes){
		this.numEyes = numEyes;
	},
	"static setIsAlive":function(isAlive){
		this.isAlive = isAlive;
	},
	"public setNumEyes":function(eyes){
		this.numEyes = eyes;	
	},
	"public getNumEyes":function(){
		return this.numEyes;	
	}
});

//Instantiate Class
var dog = new Animal(2);
var spider = new Animal(6);

console.log(dog.numEyes);
console.log(dog.isAlive);
Animal.isAlive = false;
console.log(dog.isAlive);
spider.isAlive = true;
console.log(dog.isAlive);
spider.setNumEyes(8);

```

Output:

```javascript
null
true
false
true
```



Extend Class Example:


	



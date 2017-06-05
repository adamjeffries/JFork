# OUTDATED
This project was devised before classes existed; please use them instead.  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes

[jfork](http://jfork.com/) - Object Oriented JavaScript
==================================================

Overview
--------------------------------------

This framework was developed to bring back structure to JavaScript, without destroying the flexibility we have come to enjoy.  It does this through a Class/Method relationship much like in Classical Object Oriented Notation.  However, jfork allows for much greater flexibility in its implementation of OO, so it will not take away from the power of JavaScript.

---

For Full Documentation visit: [jfork.com](http://jfork.com/)
--------------------------------------

### Object Oriented Syntax ###
	
Basic Class Example:

```javascript
//Define a new Class
var Animal = jfork({
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




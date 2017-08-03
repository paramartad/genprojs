# GenProJS

A simple basic genetic programming framework for NodeJS.

https://www.npmjs.com/package/genprojs

Sample usage: https://github.com/twinfifty/genprojs-sample/blob/master/sample1.js

_Currently still under development_

## Requirements

* [NodeJS >7.0](https://nodejs.org/en/download/)

## Install

```bash
npm install genprojs
```

## Usage

```javascript
var genpro = require('genprojs');

var result = genpro.run(
    functions,
    variables,
    trainingData,
    testingData,
    options
);
```

Parameters:
* **functions**: List of available functions/operators to be used, wrapped in `GenProJS.Operation` prototype
* **variables**: List of variables to be used, wrapped in `GenProJS.Variable` prototype
* **trainingData**: Array of JSON objects for training
* **testingData**: Array of JSON objects for testing
* **options**: _See options section below_

Returns a JSON object with properties:
* **population**: final population from latest generation
* **history**: list of average population fitness by generation
* **stat**: some statistics: max, min, and average fitness score, and maxIndividual (best individual out of population)
* **goals**: list of individuals who met the goal function (if enabled)

## Operation

GenProJS uses a wrapper prototype called `Operation` for all of its functions. These following operations are provided out of the box:
* add
* subtract
* multiply
* divide
* increment
* decrement
* power
* sqrt

To access these operations:
```javascript
var Genpro = require('genprojs');

var add = GenPro.BasicMathOperations.add;
var subtract = GenPro.BasicMathOperations.subtract;

var availableFunctions = [add, subtract];

/*....ommitted code...*/

var result = genpro.run(
    availableFunctions,
    variables,
    trainingData,
    testingData,
    options
);

```

To create new function:
```javascript
var Genpro = require('genprojs');
var Operation = Genpro.Operation;

var newFn = new Operation(fn, operationType, displayFn, name:optional);
```

Parameters:
* **fn**: The actual function
* **operationType**: Currently suppors either "**UNARY**" or "**BINARY**"
* **displayFn**: display function, i.e. toString function
* **_name-optional_**: the name of the function

Example from the add function:
```javascript
var Genpro = require('genprojs');
var Operation = Genpro.Operation;

var add = new Operation(
    (...args) => {
        return Array.prototype.reduce.call(args, (acc, elem) => {
            return acc + elem;
        });
    }, 
    "BINARY", 
    (...args) => {
        return '(' + Array.prototype.reduce.call(args, (acc, elem) => {
            return acc + ' + ' + elem;
        }) + ')';
    }
);
```

## Variable

Like operation, the variables used in GenProJS requires them to be wrapped in `GenProJS.Variable` prototype.

Example:
```javascript
var Genpro = require('genprojs');
var Variable = Genpro.Variable;

var aVariable = new Variable('a');
var variables = ['x', 'y', 'z'].map(key => new Variable(key)); // returns an array of Variable objects
variables.push(aVariable);

/*....ommitted code...*/

var result = genpro.run(
    functions,
    variables,
    trainingData,
    testingData,
    options
);
```

## Data

GenProJS expects the data to be an array of JSON objects, with all input variables specified. Additionally, an expected output property may also be included in the JSON object.

Example:
```javascript
var trainingData = [
    {
        x: 20,
        y: 30,
        z: 50,
        output: 100
    },
    {
        x: 120,
        y: 130,
        z: 150,
        output: 400
    },
    {
        x: 2,
        y: 3,
        z: 5,
        output: 10
    }
]
```

## Options

* **fitnessFn REQUIRED**: the fitness function to be used
* **populationSize**: population size (default: 100)
* **minDepth**: minimum program depth (default: 1, i.e. one operation, e.g.  a + b)
* **maxDepth**: maximum program depth (default: 3)
* **crossoverProbability**: crossover probability(default: 0.70)
* **mutationProbability**: mutation probability (default: 0.005)
* **maxIteration**: maximum number of iterations (default: 2000)
* **operationProbability**: used in generating initial population, probability that a node will be an operation instead of a variable (default: 0.75)

### Fitness Function

Fitness Function, or fitnessFn, is required. Currently, GenProJS expects a maximizing fitness function. fitnessFn requires four parameters:
* **individual**: the individual chromosome being evaluated
* **functions**: available functions
* **variables**: variables
* **data**: data to be calculated by the program (see data above)

Example of a fitnessFn:
```javascript
var Genpro = require('genprojs');
var Chromosome = Genpro.Chromosome;

var fitnessFn = (individual, functions, variables, data) => {
    // iterate through each row in data and sum
    let fitnessValSum = data.reduce((sum, vt) => {
        let val = Chromosome.val(individual, functions, variables, vt);
        return sum + val;
    }, 0);
    fitnessVal = fitnessValSum / data.length;
    // return average
    return fitnessVal;
};


var options {
    fitnessFn: fitnessFn
};

/*...code omitted...*/

var result = genpro.run(
    functions,
    variables,
    trainingData,
    testingData,
    options
);
```
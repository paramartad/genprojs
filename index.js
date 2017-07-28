const BasicOperations = require('./operations/basic');
const Operation = require('./operations/operation');
const Gene = require('./gene');

const OperationTypes = Operation.prototype.operationTypes;

let availableOps = Object.keys(BasicOperations).map(key => {
    return BasicOperations[key];
});
let input = {
    a: 1,
    b: 2,
    c: 3,
    d: 4
};
let variables = Object.keys(input).map(key => {
    return input[key];
});

let populationSize = 100;
let opProb = 0.75;
let minDepth = 2;
let maxDepth = 5;

let population = [];

const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
};

let generateChromosome = (ops, variables, opProb, minDepth, maxDepth) => {
    

    let stopExpand = (prob) => {
        return Math.random() > prob;
    };
    let getGene = (ops, variables, opProb, currentDepth, minDepth, maxDepth) => {
        if (currentDepth >= minDepth && (currentDepth >= maxDepth || stopExpand(opProb))) {
            return new Gene(variables[getRandomInt(0, variables.length)]);
        } else {
            currentDepth++;
            let fn = ops[getRandomInt(0, ops.length)];
            if (fn.type === OperationTypes.UNARY) {
                return new Gene(fn, getGene(ops, variables, opProb, currentDepth, minDepth, maxDepth));
            } else if (fn.type === OperationTypes.BINARY) {
                let gene1 = getGene(ops, variables, opProb, currentDepth, minDepth, maxDepth);
                let gene2 = getGene(ops, variables, opProb, currentDepth, minDepth, maxDepth);
                return new Gene(fn, gene1, gene2);
            }
        }
    };
    return getGene(ops, variables, opProb, 0, minDepth, maxDepth);
};

let chromosome1 = generateChromosome(availableOps, variables, opProb, minDepth, maxDepth);
console.log(chromosome1.toString());
console.log(chromosome1.val());
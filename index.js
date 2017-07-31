const BasicOperations = require('./operations/basic');
const Operation = require('./operations/operation');
const Gene = require('./gene');
const Chromosome = require('./chromosome');
const rp = require('./reproduce');

const OperationTypes = Operation.prototype.operationTypes;

let availableOps = Object.keys(BasicOperations).map(key => {
    return BasicOperations[key];
});
let input = {
    a: 1,
    b: 2,
    c: 3,
    d: 4,
    e: 5
};
let variables = Object.keys(input).map(key => {
    return input[key];
});

var gene9 = new Gene(0, 'variable', variables);
var gene8 = new Gene(2, 'variable', variables);
var gene1 = new Gene(1, 'function', availableOps, gene9, gene8);
var gene2 = new Gene(0, 'function', availableOps, gene9, gene1);
var gene3 = new Gene(3, 'function', availableOps, gene9, gene2);
console.log(gene1.toString());
console.log(gene1.length());
console.log(gene3.toString());
console.log(gene3.nodes());

// let populationSize = 2;
// let options = {
//     operationProbability: 0.85,
//     minDepth: 2,
//     maxDepth: 2
// };

// let population = Array.from(Array(populationSize), () => {
//     return new Chromosome(availableOps, variables, options);
// });
// console.log(population[0].toString());
// console.log(population[1].toString());
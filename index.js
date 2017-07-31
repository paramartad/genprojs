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

let populationSize = 2;
let options = {
    operationProbability: 0.85,
    minDepth: 2,
    maxDepth: 2
};

let population = Array.from(Array(populationSize), () => {
    return Chromosome.prototype._generate(availableOps, variables, options);
});

let offpsrings = rp.crossover(population[0], population[1], availableOps, variables);
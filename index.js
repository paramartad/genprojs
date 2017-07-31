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

population.forEach(individual => {
    console.log(individual.toString());
    console.log(individual.val());
    let replicate = Chromosome.prototype._generateFromJson(individual.nodes(), availableOps, variables);
    console.log(replicate.toString());
    console.log(replicate.val());
    let replicate2 = Chromosome.prototype._generateFromJson(replicate.nodes(), availableOps, variables);
    console.log(replicate2.toString());
    console.log(replicate2.val());
});
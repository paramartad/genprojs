const Operation = require('../operations/operation');
const Variable = require('../operations/variable');
const OperationTypes = Operation.prototype.operationTypes;
const helper = require('../helper');

const defaultOptions = {
    functionProbability: 0.85,
    minDepth: 2,
    maxDepth: 7
};

const displayGene = (gene, functions, inputVariables) => {
    if (gene instanceof Array) {
        return gene.map(basePair => displayGene(basePair, functions, inputVariables));
    } else if (gene instanceof Object) {
        let fn = functions[gene.id];
        return fn.display(...displayGene(gene.args, functions, inputVariables));
    } else {
        return inputVariables[gene].key;
    }
};

const evalGene = (gene, functions, inputVariables, variablesTuple) => {
    if (gene instanceof Array) {
        return gene.map(basePair => evalGene(basePair, functions, inputVariables, variablesTuple));
    } else if (gene instanceof Object) {
        let fn = functions[gene.id];
        return fn(...evalGene(gene.args, functions, inputVariables, variablesTuple));
    } else {
        return inputVariables[gene].val(variablesTuple);
    }
};

const getGeneDepth = (gene) => {
    if (gene instanceof Array) {
        return gene.map(getGeneDepth);
    } else if (gene instanceof Object) {
        let maxChildDepth = Math.max.apply(this, gene.args.map(getGeneDepth));
        return maxChildDepth + 1;
    } else {
        return 0;
    }
};

function Chromosome() {};

Chromosome.prototype.toString = function(chromosome, functions, inputVariables) {
    return displayGene(JSON.parse(chromosome), functions, inputVariables);
};

Chromosome.prototype.val = function(chromosome, functions, inputVariables, variablesTuple) {
    return evalGene(JSON.parse(chromosome), functions, inputVariables, variablesTuple);
};

Chromosome.prototype.depth = function(chromosome) {
    return chromosome instanceof Object ? getGeneDepth(chromosome) : getGeneDepth(JSON.parse(chromosome));
};

Chromosome.prototype.generate = (functions, inputVariables, options) => {

    options = Object.assign(defaultOptions, options);
    let fnProb = options.functionProbability;
    let minDepth = options.minDepth;
    let maxDepth =  options.maxDepth;

    let stopExpand = (prob) => {
        return Math.random() > prob;
    };
    let getGene = (functions, inputVariables, fnProb, currentDepth, minDepth, maxDepth) => {
        if (currentDepth >= minDepth && (currentDepth >= maxDepth || stopExpand(fnProb))) {
            return helper.getRandomInt(0, inputVariables.length);
        } else {
            currentDepth++;
            let fnId = helper.getRandomInt(0, functions.length);
            let fn = functions[fnId];
            if (fn.type === OperationTypes.UNARY) {
                return {id: fnId, args: [getGene(functions, inputVariables, fnProb, currentDepth, minDepth, maxDepth)]};
            } else if (fn.type === OperationTypes.BINARY) {
                let gene1 = getGene(functions, inputVariables, fnProb, currentDepth, minDepth, maxDepth);
                let gene2 = getGene(functions, inputVariables, fnProb, currentDepth, minDepth, maxDepth);
                return {id: fnId, args: [gene1, gene2]};
            }
        }
    };
    return JSON.stringify(getGene(functions, inputVariables, fnProb, 0, minDepth, maxDepth));
};

module.exports = Chromosome;
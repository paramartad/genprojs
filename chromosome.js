const Operation = require('./operations/operation');
const OperationTypes = Operation.prototype.operationTypes;
const Gene = require('./gene');

const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
};

const defaultOptions = {
    operationProbability: 0.85,
    minDepth: 2,
    maxDepth: 7
};

function Chromosome(ops, variables, options){
    if (Object.prototype.toString.call(ops) == '[object Array]'){
        options = Object.assign(defaultOptions, options);
        this.gene = this._generate(ops, variables, options.operationProbability, options.minDepth, options.maxDepth);
    } else {
        this.gene = new Gene(ops.fn);
    }

    this.toString = () => {return this.gene.toString()};
    this.val = () => {return this.gene.val()};
    this.depth = () => {return this.gene.depth()};
    this.length = () => {return this.gene.length()};
    this.nodes = () => {return this.gene.nodes()};
};

Chromosome.prototype._generate = (ops, variables, opProb, minDepth, maxDepth) => {
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

module.exports = Chromosome;
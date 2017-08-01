const Operation = require('../operations/operation');
const Variable = require('../operations/variable');
const OperationTypes = Operation.prototype.operationTypes;
const Gene = require('./gene');
const helper = require('../helper');

const defaultOptions = {
    functionProbability: 0.85,
    minDepth: 2,
    maxDepth: 7
};

function Chromosome(functions, inputVariables){
    this.gene = null;
    this.functions = functions;
    this.inputVariables = inputVariables;

    this.toString = (func, iv) => this.gene.toString(func, iv);
    this.val = (variablesTuple, func, iv) => this.gene.val(variablesTuple, func, iv);
    this.map = (mapFn, func, iv) => this.gene.map(mapFn, func, iv);
    this.depth = () => this.gene.depth();
    this.length = () => this.gene.length();
    this.nodes = (func, iv) => this.gene.nodes(func, iv);

    this.delete = () => {
        this.gene.delete();

        delete this.gene;
        delete this.functions;
        delete this.inputVariables;
    }
};

Chromosome.prototype._generateFromNodes = (geneNodes, functions, inputVariables) => {
    let chromosome = new Chromosome(functions, inputVariables);
    let mapGene = (gene) => {
        let geneId = gene.id;
        let geneType = gene.type;
        let geneArgs = gene.args;
        if (!geneArgs) {
            return new Gene(geneId, geneType);
        }
        
        let resolvedGeneArgs = geneArgs.map(g => mapGene(g));
        return new Gene(geneId, geneType, ...resolvedGeneArgs);
    };
    chromosome.gene = mapGene(geneNodes);
    return chromosome;
};

Chromosome.prototype._generate = (functions, inputVariables, options) => {

    options = Object.assign(defaultOptions, options);
    let fnProb = options.functionProbability;
    let minDepth = options.minDepth;
    let maxDepth =  options.maxDepth;

    let chromosome = new Chromosome(functions, inputVariables);

    let stopExpand = (prob) => {
        return Math.random() > prob;
    };
    let getGene = (functions, inputVariables, fnProb, currentDepth, minDepth, maxDepth) => {
        if (currentDepth >= minDepth && (currentDepth >= maxDepth || stopExpand(fnProb))) {
            return new Gene(helper.getRandomInt(0, inputVariables.length), 'variable');
        } else {
            currentDepth++;
            let fnId = helper.getRandomInt(0, functions.length);
            let fn = functions[fnId];
            if (fn.type === OperationTypes.UNARY) {
                return new Gene(fnId, 'function', getGene(functions, inputVariables, fnProb, currentDepth, minDepth, maxDepth));
            } else if (fn.type === OperationTypes.BINARY) {
                let gene1 = getGene(functions, inputVariables, fnProb, currentDepth, minDepth, maxDepth);
                let gene2 = getGene(functions, inputVariables, fnProb, currentDepth, minDepth, maxDepth);
                return new Gene(fnId, 'function', gene1, gene2);
            }
        }
    };
    chromosome.gene = getGene(functions, inputVariables, fnProb, 0, minDepth, maxDepth);
    return chromosome;
};

module.exports = Chromosome;
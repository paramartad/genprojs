const Operation = require('./operations/operation');
const OperationTypes = Operation.prototype.operationTypes;
const Gene = require('./gene');

const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
};

const defaultOptions = {
    functionProbability: 0.85,
    minDepth: 2,
    maxDepth: 7
};

function Chromosome(functions, variables){
    this.gene = null;
    this.functions = functions;
    this.variables = variables;

    this.toString = () => {return this.gene.toString()};
    this.val = () => {return this.gene.val()};
    this.depth = () => {return this.gene.depth()};
    this.length = () => {return this.gene.length()};
    this.nodes = () => {return this.gene.nodes()};
};

Chromosome.prototype._generateFromJson = (geneJson, functions, variables) => {
    let chromosome = new Chromosome(functions, variables);
    let mapGene = (gene) => {
        let geneId = gene.id;
        let geneType = gene.type;
        let geneArgs = gene.args;
        let collection = geneType === 'function' ? functions : variables;
        if (!geneArgs) {
            return new Gene(geneId, geneType, collection);
        }
        
        let resolvedGeneArgs = geneArgs.map(g => mapGene(g));
        return new Gene(geneId, geneType, collection, ...resolvedGeneArgs);
    };
    chromosome.gene = mapGene(geneJson);
    return chromosome;
};

Chromosome.prototype._generate = (functions, variables, options) => {

    options = Object.assign(defaultOptions, options);
    let fnProb = options.functionProbability;
    let minDepth = options.minDepth;
    let maxDepth =  options.maxDepth;

    let chromosome = new Chromosome(functions, variables);

    let stopExpand = (prob) => {
        return Math.random() > prob;
    };
    let getGene = (functions, variables, fnProb, currentDepth, minDepth, maxDepth) => {
        if (currentDepth >= minDepth && (currentDepth >= maxDepth || stopExpand(fnProb))) {
            return new Gene(getRandomInt(0, variables.length), 'variable', variables);
        } else {
            currentDepth++;
            let fnId = getRandomInt(0, functions.length);
            let fn = functions[fnId];
            if (fn.type === OperationTypes.UNARY) {
                return new Gene(fnId, 'function', functions, getGene(functions, variables, fnProb, currentDepth, minDepth, maxDepth));
            } else if (fn.type === OperationTypes.BINARY) {
                let gene1 = getGene(functions, variables, fnProb, currentDepth, minDepth, maxDepth);
                let gene2 = getGene(functions, variables, fnProb, currentDepth, minDepth, maxDepth);
                return new Gene(fnId, 'function', functions, gene1, gene2);
            }
        }
    };
    chromosome.gene = getGene(functions, variables, fnProb, 0, minDepth, maxDepth);
    return chromosome;
};

module.exports = Chromosome;
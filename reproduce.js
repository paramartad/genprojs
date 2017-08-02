const Chromosome = require('./dna/chromosome');
const helper = require('./helper');

const normalizeFitnessValues = (fitnessValues) => {
    let sum = fitnessValues.reduce((acc, fv) => {
        return acc + fv;
    });
    
    return fitnessValues.map(fv => {
        return fv / sum;
    });
};

const rouletteWheelSelection =  (normalizedFitnessValues) => {
    let randomTick = Math.random();
    let currentIndex = -1;
    let currentTick = 0;
    do {
        currentIndex++;
        currentTick = currentTick + normalizedFitnessValues[currentIndex];
    } while(currentTick < randomTick);
    return currentIndex;
};

const defaultOptions = {
    crossoverProbability: 0.75,
    mutationProbability: 0.001,
    selectionFn: rouletteWheelSelection
};

const getHierarchy = (index) => {
    if (index <= 0) return [];
    
    let direction = (index-1) % 2;
    let parentIndex = Math.floor((index - 1)/2);
    return Array.prototype.concat.call(getHierarchy(parentIndex), direction);
};

const getNodeAt = (currentNode, directions) => {
    let direction = directions.shift();
    let nextNode = currentNode.args[direction];
    if (nextNode == null) return null;

    if (directions.length == 0) return nextNode;
    else if (!nextNode.args) return null;

    return getNodeAt(nextNode, directions);
};

const assignNode = (nodes, candidateNode, hierarchy) => {
    if (hierarchy.length == 0) return candidateNode;
    
    let direction = hierarchy.shift();
    nodes.args[direction] = assignNode(nodes.args[direction], candidateNode, hierarchy);
    return nodes;
};


const mutateNode = (node, mutationProbability, functions, inputVariables) => {
    if (node instanceof Array) {
        return node.map(basePair => mutateNode(node, mutationProbability, functions, inputVariables));
    } else if (node instanceof Object) {
        if (Math.random() < mutationProbability) {
            let fnId = node.id;
            let mutatedNodeId = fnId;
            while (mutatedNodeId === fnId) {
                mutatedNodeId = helper.getRandomInt(0, functions.length);
            }
            node.id = mutatedNodeId;
        }
        node.args = node.args.map(basePair => mutateNode(basePair, mutationProbability, functions, inputVariables));
        return node;
    } else {
        if (Math.random() < mutationProbability) {
            let mutatedNode = node;
            while (mutatedNode === node) {
                mutatedNode = helper.getRandomInt(0, inputVariables.length);
            }
            node = mutatedNode;
        }
        return node;
    }
};

const crossover = (parent1, parent2, functions, inputVariables) => {
    let parent1Depth = Chromosome.prototype.depth(parent1);
    let parent2Depth = Chromosome.prototype.depth(parent2);
    let depth = Math.min(parent1Depth, parent2Depth);
    
    let maxLength;
    if (depth < 2) {
        maxLength = Math.min(parent1.args.length, parent2.args.length);
    } else {
        maxLength = Math.pow(2, depth + 1) - 2;
    }

    let offspring1Nodes = Object.assign({}, parent1);
    let offspring2Nodes = Object.assign({}, parent2);

    let hierarchy, swapCandidate1, swapCandidate2;
    let tryCount = 0;
    while (swapCandidate1 == null || swapCandidate2 == null) {
        let randomPos = helper.getRandomInt(1, maxLength);
        hierarchy = getHierarchy(randomPos);
        let hierarchy1 = hierarchy.slice(0);
        let hierarchy2 = hierarchy.slice(0);
        swapCandidate1 = getNodeAt(parent1, hierarchy1);
        swapCandidate2 = getNodeAt(parent2, hierarchy2);
        tryCount++;
        if (tryCount > 100) {
            randomPos = 1;
            let hierarchy1 = hierarchy.slice(0);
            let hierarchy2 = hierarchy.slice(0);
            swapCandidate1 = getNodeAt(parent1, hierarchy1);
            swapCandidate2 = getNodeAt(parent2, hierarchy2);
        }
    }
    let tempSwap = Object.assign({}, swapCandidate2);
    let hierarchy1 = hierarchy.slice(0);
    let hierarchy2 = hierarchy.slice(0);
    offspring1Nodes = assignNode(offspring1Nodes, swapCandidate2, hierarchy1);
    offspring2Nodes = assignNode(offspring2Nodes, swapCandidate1, hierarchy2);
    
    let offspring1 = JSON.stringify(offspring1Nodes);
    let offspring2 = JSON.stringify(offspring2Nodes);
    
    return [offspring1, offspring2];
};

const mutate = (parent, mutationProbability, functions, inputVariables) => {
    let offspringNodes = Object.assign({}, parent);
    offspringNodes = mutateNode(offspringNodes, mutationProbability, functions, inputVariables);
    return JSON.stringify(offspringNodes);
};

const getOffsprings = (parentPopulation, parentFitnessValues, functions, inputVariables, options) => {
    options = Object.assign(defaultOptions, options);

    let parsedParents = parentPopulation.map(JSON.parse);
    let normalizedFitnessValues = normalizeFitnessValues(parentFitnessValues);

    let crossoverProbability = options.crossoverProbability;
    let mutationProbability = options.mutationProbability;
    let trueMutationProbability = mutationProbability / (1-crossoverProbability);

    let offsprings = [];
    while (offsprings.length < parsedParents.length) {
        let offspring;
        if (Math.random() < crossoverProbability) {
            let chosenIndex1 = options.selectionFn(normalizedFitnessValues);
            let chosenIndex2 = options.selectionFn(normalizedFitnessValues);
            let tryCount = 0;
            while (chosenIndex1 === chosenIndex2) {
                chosenIndex2 = options.selectionFn(normalizedFitnessValues);
                tryCount++;
                if (tryCount > parsedParents.length) {
                    while (chosenIndex1 === chosenIndex2) {
                        chosenIndex2 = helper.getRandomInt(0, parsedParents.length);
                    }
                    break;
                }
            }

            let parent1 = parsedParents[chosenIndex1];
            let parent2 = parsedParents[chosenIndex2];
            offsprings.push.apply(this, crossover(parent1, parent2, functions, inputVariables));
            

        } else {
            let chosenIndex = options.selectionFn(normalizedFitnessValues);
            let parent = parsedParents[chosenIndex];
            offsprings.push(mutate(parent, trueMutationProbability, functions, inputVariables));
        }
    }

    if (offsprings.length > parsedParents.length) {
        console.log('slicing offsprings');
        offsprings = offsprings.slice(0, parsedParents.length);
    }

    return offsprings;
};

module.exports = {
    crossover,
    mutate,
    getOffsprings,
    getNodeAt
};
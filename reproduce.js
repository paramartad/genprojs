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
    if (!nextNode) return null;

    if (directions.length == 0) return nextNode;
    else if (!nextNode.args) return null;

    return getNodeAt(nextNode, directions);
};

const assignNode = (nodes, candidateNode, hierarchy) => {
    let iterateNodes = (currentNode, directions) => {
        let direction = directions.shift();
        let nextNode = currentNode.args[direction];
        if (directions.length == 0) {
            nextNode = candidateNode;
            return;
        }
        iterateNodes(nextNode, directions);
    };

    iterateNodes(nodes, hierarchy)
};

const crossover = (parent1, parent2, functions, inputVariables) => {
    let parent1Nodes = parent1.nodes(functions, inputVariables);
    let parent2Nodes = parent2.nodes(functions, inputVariables);

    let depth = Math.min(parent1.depth(), parent2.depth()) + 1;
    let maxLength = Math.pow(2, depth) - 1;

    let offspring1Nodes = JSON.parse(JSON.stringify(parent1Nodes));
    let offspring2Nodes = JSON.parse(JSON.stringify(parent2Nodes));

    let hierarchy, swapCandidate1, swapCandidate2;
    while (!swapCandidate1 || !swapCandidate2) {
        let randomPos = helper.getRandomInt(1, maxLength);
        hierarchy = getHierarchy(randomPos);
        let hierarchy1 = hierarchy.slice(0);
        let hierarchy2 = hierarchy.slice(0);
        swapCandidate1 = getNodeAt(parent1Nodes, hierarchy1);
        swapCandidate2 = getNodeAt(parent2Nodes, hierarchy2);
    }
    let tempSwap = JSON.parse(JSON.stringify(swapCandidate2));
    let hierarchy1 = hierarchy.slice(0);
    let hierarchy2 = hierarchy.slice(0);
    assignNode(offspring1Nodes, swapCandidate2, hierarchy1);
    assignNode(offspring2Nodes, swapCandidate1, hierarchy2);
    
    let offspring1 = Chromosome.prototype._generateFromNodes(offspring1Nodes, functions, inputVariables);
    let offspring2 = Chromosome.prototype._generateFromNodes(offspring2Nodes, functions, inputVariables);
    
    return [offspring1, offspring2];
};

const mutate = (parent, mutationProbability, functions, inputVariables) => {
    let hasMutation = false;
    let offspringNodes = parent.map((fn, id, type, args) => {
        if (Math.random() > mutationProbability) {
            return args && args.length ? {id, type, args} : {id, type};
        }
        
        hasMutation = true;

        let isFunction = type === 'function';
        let collection = isFunction ? functions : inputVariables;
        let mutatedId = id;
        while (mutatedId === id) {
            mutatedId = helper.getRandomInt(0, collection.length);
        }
        if (isFunction) {
            if (functions[mutatedId].type === 'binary' && args.length < 2) {
                let newArgId = helper.getRandomInt(0, inputVariables.length);
                args.push({id: newArgId, type: 'variable'});
            }
        }
        return args && args.length ? {id: mutatedId, type, args} : {id: mutatedId, type};
    }, functions, inputVariables);

    return Chromosome.prototype._generateFromNodes(offspringNodes, functions, inputVariables);
};

const getOffsprings = (parentPopulation, parentFitnessValues, functions, inputVariables, options) => {
    options = Object.assign(defaultOptions, options);
    let normalizedFitnessValues = normalizeFitnessValues(parentFitnessValues);
    let crossoverProbability = options.crossoverProbability;
    let mutationProbability = options.mutationProbability;
    let trueMutationProbability = mutationProbability / (1-crossoverProbability);

    let offsprings = [];
    while (offsprings.length < parentPopulation.length) {
        let offspring;
        if (Math.random() < crossoverProbability) {
            let chosenIndex1 = options.selectionFn(normalizedFitnessValues);
            let chosenIndex2 = options.selectionFn(normalizedFitnessValues);
            while (chosenIndex1 === chosenIndex2) {
                chosenIndex2 = options.selectionFn(normalizedFitnessValues);
            }

            let parent1 = parentPopulation[chosenIndex1];
            let parent2 = parentPopulation[chosenIndex2];
            offsprings.push.apply(this, crossover(parent1, parent2, functions, inputVariables));
            

        } else {
            let chosenIndex = options.selectionFn(normalizedFitnessValues);
            let parent = parentPopulation[chosenIndex];
            offsprings.push(mutate(parent, trueMutationProbability, functions, inputVariables));
        }
    }

    if (offsprings.length > parentPopulation.length) {
        offsprings = offsprings.slice(0, parentPopulation.length);
    }

    parentPopulation.forEach((o, i, a) => {
        delete a[i];
    });
    return offsprings;
};

module.exports = {
    crossover,
    mutate,
    getOffsprings
};
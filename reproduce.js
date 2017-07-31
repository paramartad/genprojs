const Chromosome = require('./chromosome');
const helper = require('./helper');



let getHierarchy = (index) => {
    if (index <= 0) return [];
    
    let direction = (index-1) % 2;
    let parentIndex = Math.floor((index - 1)/2);
    return Array.prototype.concat.call(getHierarchy(parentIndex), direction);
};

let getNodeAt = (currentNode, directions) => {
    let direction = directions.shift();
    let nextNode = currentNode.args[direction];
    if (!nextNode) return null;

    if (directions.length == 0) return nextNode;
    else if (!nextNode.args) return null;

    return getNodeAt(nextNode, directions);
};

let assignNode = (nodes, candidateNode, hierarchy) => {
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

let crossover = (parent1, parent2, functions, variables) => {
    let parent1Nodes = parent1.nodes();
    let parent2Nodes = parent2.nodes();

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
    
    let offspring1 = Chromosome.prototype._generateFromNodes(offspring1Nodes, functions, variables);
    let offspring2 = Chromosome.prototype._generateFromNodes(offspring2Nodes, functions, variables);
    
    return [offspring1, offspring2];
};

let mutate = (parent, mutationProbability, functions, variables) => {
    let hasMutation = false;
    let offspringNodes = parent.map((fn, id, type, args) => {
        if (Math.random() > mutationProbability) {
            return args && args.length ? {id, type, args} : {id, type};
        }
        
        hasMutation = true;

        let isFunction = type === 'function';
        let collection = isFunction ? functions : variables;
        let mutatedId = id;
        while (mutatedId === id) {
            mutatedId = helper.getRandomInt(0, collection.length);
        }
        if (isFunction) {
            if (functions[mutatedId].type === 'binary' && args.length < 2) {
                let newArgId = helper.getRandomInt(0, variables.length);
                args.push({id: newArgId, type: 'variable'});
            }
        }
        return args && args.length ? {id: mutatedId, type, args} : {id: mutatedId, type};
    });

    let offspring = hasMutation ? Chromosome.prototype._generateFromNodes(offspringNodes, functions, variables) : parent;
    return offspring;
};

module.exports = {
    crossover,
    mutate
};
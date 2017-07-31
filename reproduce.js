const Chromosome = require('./chromosome');
const helper = require('./helper');


let getNodeAt = (nodes, directions) => {
    let direction = directions.shift();
    let node = nodes[direction];
    if (!node) return node;
    if (directions.length == 0 || !nodes.args) return node;
    return getNodeAt(node.args, directions);
};

let assignNode = (nodes, candidateNode, hierarchy) => {
    let iterateNodes = (args, directions) => {
        let direction = directions.shift();
        if (directions.length == 0) {
            args[direction] = candidateNode;
            return;
        }
        iterateNodes(args[direction].args, directions);
    };

    iterateNodes(nodes.args, hierarchy)
};

let crossover = (parent1, parent2, functions, variables) => {
    let parent1Nodes = parent1.nodes();
    let parent2Nodes = parent2.nodes();

    let depth = Math.min(parent1.depth(), parent2.depth()) + 1;
    let maxLength = Math.pow(2, depth) - 1;

    let getHierarchy = (index) => {
        if (index <= 0) return [];
        
        let direction = (index-1) % 2;
        let parentIndex = Math.floor((index - 1)/2);
        return Array.prototype.concat.call(getHierarchy(parentIndex), direction);
    };

    let offspring1Nodes = JSON.parse(JSON.stringify(parent1Nodes));
    let offspring2Nodes = JSON.parse(JSON.stringify(parent2Nodes));

    let hierarchy, swapCandidate1, swapCandidate2;
    while (!swapCandidate1 || !swapCandidate2) {
        let randomPos = helper.getRandomInt(1, maxLength);
        hierarchy = getHierarchy(randomPos);
        let hierarchy1 = hierarchy.slice(0);
        let hierarchy2 = hierarchy.slice(0);
        swapCandidate1 = getNodeAt(parent1Nodes.args, hierarchy1);
        swapCandidate2 = getNodeAt(parent2Nodes.args, hierarchy2);
        
        if (swapCandidate1 && swapCandidate2) {
            console.log('crossing over at node ' + randomPos);
        };
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

module.exports = {
    crossover
};
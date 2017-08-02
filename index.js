const BasicOperations = require('./operations/basic');
const Operation = require('./operations/operation');
const Variable = require('./operations/variable');
const Gene = require('./dna/gene');
const Chromosome = require('./dna/chromosome');
const rp = require('./reproduce');

const OperationTypes = Operation.prototype.operationTypes;

let availableOps = Object.keys(BasicOperations).map(key => {
    return BasicOperations[key];
});
let input = {
    a: 3,
    b: 4
};

let variablesTuples = [
    {
        a: 3,
        b: 4,
        c: 16
    },
    {
        a: 5,
        b: 12,
        c: 72
    },
    {
        a: 8,
        b: 15,
        c: 135
    }
];

let inputVariables = Object.keys(input).map(key => {
    return new Variable(key);
});

let goalFn = (individual, functions, inputVariables) => {
    return variablesTuples.every(vt => {
        return individual.val(vt, functions, inputVariables) === vt.c;
    });
};

let fitnessFn = (individual, functions, inputVariables) => {
    let minFitnessVal = 0.0001;
    let fitnessValFactor = 100;
    let maxFitnessVal = fitnessValFactor / minFitnessVal;
    let fitnessValSum = variablesTuples.reduce((sum, vt) => {
        let val = individual.val(vt, functions, inputVariables);
        if (isNaN(val)) return sum + minFitnessVal;

        let distance = Math.abs(vt.c-val);
        return sum + ( distance === 0 ? maxFitnessVal  : Math.max(fitnessValFactor/distance, minFitnessVal));
    }, 0);
    fitnessVal = fitnessValSum / variablesTuples.length;

    return fitnessVal;
};

let options = {
    populationSize: 100,
    operationProbability: 0.85,
    minDepth: 1,
    maxDepth: 2,
    crossoverProbability: 0.75,
    mutationProbability: 0.001,
    maxIteration: 500,
    maxMemory: 1000000000,
    fitnessFn: fitnessFn,
    goalFn: goalFn
};

let initialPopulation = Array.from(Array(options.populationSize), () => {
    return Chromosome.prototype.generate(availableOps, inputVariables, options);
});
initialPopulation.forEach(individual => {
    console.log(Chromosome.prototype.toString(individual, availableOps, inputVariables) + ' = ' + Chromosome.prototype.val(individual, availableOps, inputVariables, variablesTuples[0]));
});


// let iterate = (population, functions, inputVariables, options, currentGeneration) => {
//     if (Object.prototype.toString.call(options.goalFn) === '[object Function]') {
//         let achievedGoals = population.filter(individual => options.goalFn(individual, functions, inputVariables));
//         if (achievedGoals.length > 0) {
//             console.log(achievedGoals.length + ' individuals meeting goal function found');
//             achievedGoals.forEach((individual) => console.log(individual.toString(functions, inputVariables)));
//             return [population, achievedGoals];
//         }
//     }
    
//     let fitnessVals = population.map(individual => options.fitnessFn(individual, functions, inputVariables));
//     let populationFitnessVal = fitnessVals.reduce((sum, fv) => sum + fv) / fitnessVals.length;
//     console.log('Generation ' + currentGeneration + ' population fitness: ' + populationFitnessVal);

//     if (options.maxIteration - currentGeneration <= 0) {
//         console.log('Maximum iterations reached');
//         return [population, []];
//     }

//     let offsprings = rp.getOffsprings(population, fitnessVals, functions, inputVariables, options);
//     currentGeneration++;
//     return [offsprings, []];
// }

// let currentGeneration = 0;
// population = initialPopulation;
// let program = {
//     population: initialPopulation
// };

// while (currentGeneration <= options.maxIteration) {
//     let result = iterate(program.population, availableOps, inputVariables, options, currentGeneration);
//     if (result[1].length) break;

//     program.population = result[0];
//     currentGeneration++;
    
//     let memoryUsage = process.memoryUsage().heapUsed;
//     if (memoryUsage > options.maxMemory) {
//         console.log('WARNING: Maximum memory reached');
//         console.log(Math.round(memoryUsage) / 1024 / 1024 + ' MB');
//         console.log('Exiting program now');
//         break;
//     }
// }
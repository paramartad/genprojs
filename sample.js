
const Genpro = require('./index.js');
const Operation = Genpro.Operation;
const Variable = Genpro.Variable;
const Chromosome = Genpro.Chromosome;

const availableOps = Genpro.BasicMathOperations;

let input = {
    a: 3,
    b: 4
};

let data = [
    {
        a: 3,
        b: 4,
        c: 5
    },
    {
        a: 5,
        b: 12,
        c: 13
    },
    {
        a: 8,
        b: 15,
        c: 17
    }
];

let inputVariables = Object.keys(input).map(key => {
    return new Variable(key);
});

let goalFn = (individual, functions, inputVariables, variableTuples) => {
    return data.every(vt => {
        return Chromosome.val(individual, functions, inputVariables, vt) === vt.c;
    });
};

let fitnessFn = (individual, functions, inputVariables, variableTuples) => {
    let minFitnessVal = 0.01;
    let fitnessValFactor = 100;
    let maxFitnessVal = fitnessValFactor / minFitnessVal;
    let fitnessValSum = data.reduce((sum, vt) => {
        let val = Chromosome.val(individual, functions, inputVariables, vt);
        if (isNaN(val)) return sum + minFitnessVal;

        let distance = Math.abs(vt.c-val);
        return sum + ( distance === 0 ? maxFitnessVal  : Math.max(fitnessValFactor/distance, minFitnessVal));
    }, 0);
    fitnessVal = fitnessValSum / data.length;

    return fitnessVal;
};

let options = {
    populationSize: 100,
    operationProbability: 0.75,
    minDepth: 1,
    maxDepth: 6,
    crossoverProbability: 0.70,
    mutationProbability: 0.005,
    maxIteration: 2000,
    maxMemory: 1000000000,
    fitnessFn: fitnessFn,
    goalFn: goalFn
};

let initialPopulation = Array.from(Array(options.populationSize), () => {
    return Chromosome.generate(availableOps, inputVariables, options);
});

let result = Genpro.run(initialPopulation, availableOps, inputVariables, data, data, options);
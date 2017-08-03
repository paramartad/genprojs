const BasicOperations = require('./operations/basic');
const Operation = require('./operations/operation');
const Variable = require('./operations/variable');
const Chromosome = require('./dna/chromosome');
const rp = require('./reproduce');

const OperationTypes = Operation.prototype.operationTypes;

const defaultOptions = {
    populationSize: 100,
    operationProbability: 0.75,
    minDepth: 1,
    maxDepth: 3,
    crossoverProbability: 0.70,
    mutationProbability: 0.005,
    maxIteration: 2000,
    maxMemory: -1
};

const getPopulationFitnessValues = (fitnessFn, population, functions, variables, data) => {
    return population.map(individual => fitnessFn(individual, functions, variables, data));
};

const calculateStat = (fitnessFn, population, functions, variables, data) => {
    console.log('Calculating stat using test data');

    let fitnessVals = getPopulationFitnessValues(fitnessFn, population, functions, variables, data);
    let populationWithFitness = population.map((individual, i, pop) => {
        return {
            individual,
            fitnessValue: fitnessVals[i]
        };
    });

    let averageFitnessVal = fitnessVals.reduce((sum, fv) => sum + fv) / fitnessVals.length;

    populationWithFitness.sort((a, b) => {
        return a.fitnessValue - b.fitnessValue;
    });

    let max = populationWithFitness[populationWithFitness.length - 1];
    let min = populationWithFitness[0];

    let stat = {
        fitnessValues: fitnessVals,
        average: averageFitnessVal,
        max: max.fitnessValue,
        min: min.fitnessValue,
        maxIndividual: max.individual
    };

    console.log('BEST INDIVIDUAL: ' + Chromosome.toString(stat.maxIndividual, functions, variables));
    console.log('2nd BEST INDIVIDUAL: ' + Chromosome.toString(populationWithFitness[populationWithFitness.length - 2], functions, variables));
    console.log('3rd BEST INDIVIDUAL: ' + Chromosome.toString(populationWithFitness[populationWithFitness.length - 3], functions, variables));
    console.log('MAX: ' + stat.max);
    console.log('AVG: ' + stat.average);
    console.log('MIN: ' + stat.min);

    return stat;
};

const generatePopulation = (populationSize, functions, variables, options) => {
    return Array.from(Array(populationSize), () => {
        return Chromosome.generate(functions, variables, options);
    });
};

const iterate = (population, functions, variables, options, trainingData, testData, currentGeneration) => {
    if (Object.prototype.toString.call(options.goalFn) === '[object Function]') {
        let achievedGoals = population.filter(individual => options.goalFn(individual, functions, variables, testData));
        if (achievedGoals.length > 0) {
            return [population, achievedGoals];
        }
    }
    
    let fitnessVals = getPopulationFitnessValues(options.fitnessFn, population, functions, variables, trainingData);
    let populationFitnessVal = fitnessVals.reduce((sum, fv) => sum + fv) / fitnessVals.length;
    console.log('Generation ' + currentGeneration + ' population fitness: ' + populationFitnessVal);

    if (options.maxIteration - currentGeneration <= 0) {
        console.log('Maximum iterations reached');
        return [population, []];
    }

    let offsprings = rp.getOffsprings(population, fitnessVals, functions, variables, options);
    currentGeneration++;
    
    return [offsprings, []];
};

const run = (functions, variables, trainingData, testData, options) => {
    options = Object.assign(defaultOptions, options);
    let population = generatePopulation(options.populationSize, functions, variables, options);

    let currentGeneration = 0;
    while (currentGeneration <= options.maxIteration) {
        let result = iterate(population, functions, variables, options, trainingData, testData, currentGeneration);
        if (result[1].length) break;

        if (result.length > 1 && result[1].length) {
            let achievedGoals = result[1];
            console.log(achievedGoals.length + ' individuals meeting goal function found');
            achievedGoals.forEach((individual) => console.log(Chromosome.toString(individual, functions, variables)));
            let stat = calculateStat(options.fitnessFn, population, functions, variables, testData);

            console.log('EXITING PROGRAM');
            return {
                population: population,
                goals: achievedGoals,
                stat: stat
            };
        }

        population = result[0];
        currentGeneration++;
        
        let memoryUsage = process.memoryUsage().heapUsed;
        if (options.maxMemory > 0 && memoryUsage > options.maxMemory) {
            console.log('WARNING: Maximum memory reached');
            console.log(Math.round(memoryUsage) / 1024 / 1024 + ' MB');
            console.log('EXITING PROGRAM');
            break;
        }
    }
    let stat = calculateStat(options.fitnessFn, population, functions, variables, testData);
    console.log('END OF RUN');

    return {
        population: population,
        goals: [],
        stat: stat
    };
};


module.exports = {
    BasicMathOperations: BasicOperations,
    Chromosome: Chromosome,
    Operation: Operation,
    run: run,
    Variable: Variable
};
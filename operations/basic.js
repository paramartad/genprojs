const Operation = require('./operation');
const OperationTypes = Operation.prototype.operationTypes;

let add = new Operation(
    (...args) => {
        return Array.prototype.reduce.call(args, (acc, elem) => {
            return acc + elem;
        });
    }, 
    OperationTypes.BINARY, 
    (...args) => {
        return '(' + Array.prototype.reduce.call(args, (acc, elem) => {
            return acc + ' + ' + elem;
        }) + ')';
    }
);

let subtract = new Operation(
    (...args) => {
        return Array.prototype.reduce.call(args, (acc, elem) => {
            return acc - elem;
        });
    }, OperationTypes.BINARY,
    (...args) => {
        return '(' + Array.prototype.reduce.call(args, (acc, elem) => {
            return acc + ' - ' + elem;
        }) + ')';
    }
);

let multiply =new Operation(
    (...args) => {
        return Array.prototype.reduce.call(args, (acc, elem) => {
            return acc * elem;
        });
    }, OperationTypes.BINARY, 
    (...args) => {
        return '(' + Array.prototype.reduce.call(args, (acc, elem) => {
            return acc + ' * ' + elem;
        }) + ')';
    }
);

let divide = new Operation(
    (...args) => {
        return Array.prototype.reduce.call(args, (acc, elem) => {
            return acc / elem;
        });
    },
    OperationTypes.BINARY, 
    (...args) => {
        return '(' + Array.prototype.reduce.call(args, (acc, elem) => {
            return acc + ' / ' + elem;
        }) + ')';
    }
);

let increment = new Operation(
    (val) => {
        return add(val, 1);
    }, 
    OperationTypes.UNARY, 
    (val) => {
        return '(' + val + '++)';
    }
);

let decrement = new Operation((val) => {
        return add(val, -1);
    },
    OperationTypes.UNARY,
    (val) => {
        return '(' + val + '--)';
    }
);

let power = new Operation(
    (base, exponent) => {
        return Math.pow(base, exponent);
    }, OperationTypes.BINARY,
    (base, exponent) => {
        return '(' + base + '^' + exponent + ')';
    }
);

let sqrt = new Operation(
    (val) => {
        return Math.sqrt(val);
    },
    OperationTypes.UNARY,
    (val) => {
        return '(sqrt(' + val + '))';
    }
);

let basicOps = {
    add,
    subtract,
    multiply,
    divide,
    increment,
    decrement,
    power,
    sqrt
};

Object.keys(basicOps).forEach(key => {
    basicOps[key].id = key;
});

module.exports = basicOps;
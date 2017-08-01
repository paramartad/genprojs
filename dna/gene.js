
function Gene(id, type, ...args) {
    this.isVariable = type === 'variable';
    this.isFunction = type === 'function';

    this.id = id;
    this.type = type;
    this.args = args;
    
    this.val = (variablesTuple, functions, inputVariables) => this._val(variablesTuple, functions, inputVariables, this.id, this.args, this.isVariable);
    // this.toString = (functions, inputVariables) => this._toString(functions, inputVariables, this.id, this.args, this.isVariable);
    this.toString = (functions, inputVariables) => JSON.stringify(this.nodes(functions, inputVariables));
    this.map = (mapFn, functions, inputVariables) => this._map(mapFn, functions, inputVariables, this.id, this.type, this.args, this.isVariable);
    this.depth = () => this._depth(this.args, this.isVariable);
    this.length = () => this._length(this.args, this.isVariable);

    this.nodes = (functions, inputVariables) => this.map((fn, id, type, args) => {
        return args && args.length ? {id, type, args} : {id, type};
    }, functions, inputVariables);

    this.delete = () => {
        delete this.id;
        delete this.type;
        delete this.args;
    };
};

Gene.prototype._val = (variablesTuple, functions, inputVariables, id, args, isVariable) => {
    let collection = isVariable ? inputVariables : functions;
    let fn = collection[id];
    if (isVariable) return fn.val(variablesTuple);

    resolvedArgs = args.map(arg => {
        return arg.val(variablesTuple, functions, inputVariables);
    });
    
    return fn.apply(this, resolvedArgs);
};

Gene.prototype._toString = (functions, inputVariables, id, args, isVariable) => {
    // let collection = isVariable ? inputVariables : functions;
    // console.log(isVariable);
    // let fn = collection[id];
    // if (isVariable) return fn.key;

    // return fn.display(...args);
};

Gene.prototype._depth = (args, isVariable) => {
    if (isVariable) return 0;

    let maxChildDepth = Math.max.apply(this, args.map(arg => {
        return arg.depth();
    }));

    return maxChildDepth + 1;
};

Gene.prototype._length = (args, isVariable) => {
    if (isVariable) return 1;
    
    let childLength = args.reduce((acc, arg) => {
        return acc + arg.length();
    }, 0);

    return childLength + 1;
};


Gene.prototype._map = (mapFn, functions, inputVariables, id, type, args, isVariable) => {
    let collection = isVariable ? inputVariables : functions;
    let fn = collection[id];
    if (isVariable) {
        return mapFn(fn, id, type, args);
    };

    let resolvedChildren = args.reduce((acc, arg) => {
        acc.push(arg.map(mapFn, functions, inputVariables))
        return acc;
    }, []);
    return mapFn(fn, id, type, resolvedChildren);
};

module.exports = Gene;
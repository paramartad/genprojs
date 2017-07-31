
function Gene(id, type, collection, ...args) {
    this.isVariable = type === 'variable';
    this.isFunction = type === 'function';

    this.id = id;
    this.type = type;
    this.collection = collection;
    this.args = args;
    
    this.val = () => this._val(this.collection, this.id, this.args, this.isFunction, this.isVariable);
    this.toString = () => this._toString(this.collection, this.id, this.args, this.isVariable);
    this.map = (mapFn) => this._map(this.collection, this.id, this.type, this.args, this.isVariable, mapFn);
    this.depth = () => this._depth(this.args, this.isVariable);
    this.length = () => this._length(this.args, this.isVariable);

    this.nodes = () => this.map((fn, id, type, args) => {
        return args && args.length ? {id, type, args} : {id, type};
    });;
};

Gene.prototype._val = (collection, id, args, isFunction, isVariable) => {
    let fn = collection[id];
    if (isVariable) return fn;

    resolvedArgs = args.map(arg => {
        if (Object.prototype.toString.call(arg) === '[object Object]') {
            return arg.val(collection);
        } else {
            return arg;
        }
    });
    
    return fn.apply(this, resolvedArgs);
};

Gene.prototype._toString = (collection, id, args, isVariable) => {
    let fn = collection[id];
    if (isVariable) return fn;
    return fn.display(...args);
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


Gene.prototype._map = (collection, id, type, args, isVariable, mapFn) => {
    let fn = collection[id];
    if (isVariable) {
        return mapFn(fn, id, type, args);
    };

    let resolvedChildren = args.reduce((acc, arg) => {
        acc.push(arg.map(mapFn))
        return acc;
    }, []);
    return mapFn(fn, id, type, resolvedChildren);
};

module.exports = Gene;
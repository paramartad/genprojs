
function Gene(id, type, collection, ...args) {
    this.isVariable = type === 'variable';
    this.isGene = type === 'function';

    this.id = id;
    this.type = type;
    this.collection = collection;
    this.args = args;
    
    this.val = () => this._val(this.collection, this.id, this.args, this.isGene, this.isVariable);
    this.toString = () => this._toString(this.collection, this.id, this.args, this.isVariable);
    this.depth = () => this._depth(this.args, this.isVariable);
    this.length = () => this._length(this.args, this.isVariable);
    this.nodes = () => this._nodes(this.id, this.type, this.args, this.isVariable);
};

Gene.prototype._val = (collection, id, args, isGene, isVariable) => {
    var fn = collection[id];
    if (isVariable) return fn;
    else if (isGene) return fn.val(collection);

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
    var fn = collection[id];
    if (isVariable) return fn;

    return fn.display(...args);
};

Gene.prototype._depth = (args, isVariable) => {
    if (isVariable) return 0;

    var maxChildDepth = Math.max.apply(this, args.map(arg => {
        return arg.depth();
    }));

    return maxChildDepth + 1;
};

Gene.prototype._length = (args, isVariable) => {
    if (isVariable) return 1;
    
    var childLength = args.reduce((acc, arg) => {
        return acc + arg.length();
    }, 0);

    return childLength + 1;
};

Gene.prototype._nodes = (id, type, args, isVariable) => {
    if (isVariable) return {id, type};

    var childNodes = args.reduce((acc, arg) => {
        acc.push(arg.nodes())
        return acc;
    }, []);
    return result = [{id, type}, childNodes]
};

module.exports = Gene;

function Gene(fn, ...args) {
    this.isFunction = Object.prototype.toString.call(fn) === '[object Function]';
    this.isGene = Object.prototype.toString.call(fn) === '[object Object]';
    this.isPrim = !this.isFunction && !this.isGene;

    this.fn = fn;
    this.args = args;
    this.id = fn.id;
    
    this.val = () => this._val(this.fn, this.args, this.isGene, this.isPrim);
    this.toString = () => this._toString(this.fn, this.args, this.isPrim);
    this.depth = () => this._depth(this.args, this.isPrim);
    this.length = () => this._length(this.args, this.isPrim);
    this.nodes = () => this._nodes(this.fn, this.args, this.isPrim);
};

Gene.prototype._val = (fn, args, isGene, isPrim) => {
    if (isPrim) return fn;
    else if (isGene) return fn.val();

    resolvedArgs = args.map(arg => {
        if (Object.prototype.toString.call(arg) === '[object Object]') {
            return arg.val();
        } else if (Object.prototype.toString.call(arg) === '[object Function]') {
            return arg();
        } else {
            return arg;
        }
    });
    
    return fn.apply(this, resolvedArgs);
};

Gene.prototype._toString = (fn, args, isPrim) => {
    if (isPrim) return fn;

    return fn.display(...args);
};

Gene.prototype._depth = (args, isPrim) => {
    if (isPrim) return 0;

    var maxChildDepth = Math.max.apply(this, args.map(arg => {
        return arg.depth();
    }));

    return maxChildDepth + 1;
};

Gene.prototype._length = (args, isPrim) => {
    if (isPrim) return 1;
    
    var childLength = args.reduce((acc, arg) => {
        return acc + arg.length();
    }, 0);

    return childLength + 1;
};

Gene.prototype._nodes = (fn, args, isPrim) => {
    if (isPrim) return [fn];
    var childNodes = args.reduce((acc, arg) => {
        return Array.prototype.concat.apply(acc, [arg.nodes()]);
    }, []);
    return Array.prototype.concat.apply([fn], childNodes);
};

module.exports = Gene;
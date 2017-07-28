
function Gene(fn, ...args) {
    this.isFunction = Object.prototype.toString.call(fn) === '[object Function]';
    this.isGene = Object.prototype.toString.call(fn) === '[object Object]';
    this.isPrim = !this.isFunction && !this.isGene;

    this.fn = fn;
    this.args = args;
    this.id = fn.id;
    
    this.val = () => this._val(this.fn, this.args, this.isFunction, this.isGene, this.isPrim);
    this.toString = () => this._toString(this.fn, this.args, this.isFunction, this.isGene, this.isPrim);
};

Gene.prototype._val = (fn, args, isFunction, isGene, isPrim) => {
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
Gene.prototype._toString = (fn, args, isFunction, isGene, isPrim) => {
    if (isFunction) return fn.display(...args);
    if (isPrim) return fn;

    return fn.display(...args);
}

module.exports = Gene;
function Variable(key) {
    this.key = key;
    this.val = (variablesTuple) => this._val(variablesTuple, this.key);
};

Variable.prototype._val = (variablesTuple, key) => {
    return variablesTuple[key];
};

module.exports = Variable;
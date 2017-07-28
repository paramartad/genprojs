let operationTypes = {
    BINARY: "binary",
    UNARY: "unary"
};

function Operation(fn, type = operationTypes.BINARY, toStringFn = null, id = null){
    fn.id = id;
    fn.type = type;
    fn.display = toStringFn ? toStringFn : fn.toString;
    return fn;
};
Operation.prototype.operationTypes = operationTypes;


module.exports = Operation;
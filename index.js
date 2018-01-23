// Validator
'use strict';

var validator = {};

function isNotFunction(fn) {
    return typeof fn !== 'function'
}

validator._identity = function identity(value) {
    return value;
};

validator._getLength = function getLength(value) {
    return value.length;
};

validator._getTime = function getTime(date) {
    return date.getTime();
};

// Validation functions
['string', 'number', 'boolean'].forEach(function (dataType) {
    validator[dataType] = function (key, value) {
        return (typeof value !== dataType || value === null || value === undefined) ? 'must be a ' + dataType : true;
    };
});

validator.regex = function (pattern) {
    if (!(pattern instanceof RegExp))
        throw new Error('Regex validator accepts object of type RegExp');
    return function (key, value) {
        return pattern.test(value) ? true : 'invalid pattern';
    };
};

validator.email = validator.regex(/^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i);

validator.indianMobile = validator.regex(/^[789]\d{9}$/);

validator.alphaNumericString = validator.regex(/^[a-zA-Z0-9 ]{0,128}$/);

validator.rstring = validator.regex(/^[a-zA-Z0-9 .,'!()@?-]{1,128}$/);

validator.optional = function (func) {
    if (isNotFunction(func))
        throw new Error('Optional validator accepts a validator function');
    return function (key, value, obj) {
        return (key in obj) ? func.call(null, key, value, obj) : true;
    };
};

validator.any = function (arr, msg) {
    if (!(arr instanceof Array) || arr.some(isNotFunction))
        throw new Error('Any validator accepts an array of validators');
    return function (key, value, obj) {
        for (var i = 0; i < arr.length; i++) {
            var validOrMessage = arr[i].call(null, key, value, obj);
            if (typeof validOrMessage !== 'string')
                return true;
        }
        return msg;
    };
};

validator.all = function (arr, msg) {
    if (!(arr instanceof Array) || arr.some(isNotFunction))
        throw new Error('All validator accepts an array of validators');
    return function (key, value, obj) {
        for (var i = 0; i < arr.length; i++) {
            var validOrMessage = arr[i].call(null, key, value, obj);
            if (typeof validOrMessage === 'string')
                return msg || validOrMessage;
        }
        return true
    };
};

validator.between = function (lower, upper, property) {
    //TODO check if lower and upper are numbers and throw exception if not

    property = property || validator._identity;
    return function (key, value, obj) {
        return property(value, obj) >= lower && property(value, obj) <= upper ? true : 'should be between ' + lower + ' and ' + upper;
    };
};

validator.length = function (length) {
    return validator.between(length, length, validator._getLength);
};

validator.minLength = function (length) {
    return validator.between(length, Infinity, validator._getLength);
};

validator.maxLength = function (length) {
    return validator.between(0, length, validator._getLength);
};

validator.before = function (date) {
    return validator.between(0, new Date(date).getTime(), validator._getTime);
};

validator.after = function (date) {
    return validator.between(new Date(date).getTime(), Infinity, validator._getTime);
};

validator.enum = function (allowedValues) {
    if (!(allowedValues instanceof Array))
        throw new Error('enum validator accepts an array of allowed values');
    return function (key, value) {
        return allowedValues.indexOf(value) >= 0 ? true : 'allowed values are [' + allowedValues + ']';
    };
};

validator.object = function (schemaObj) {
    return function object(objKey, objValue) {
        var result = {};
        if (objValue === null || objValue === undefined || !(objValue instanceof Object && objValue.constructor == Object.prototype.constructor))
            return {
                error: 'must be an object'
            };
        var keys = Object.keys(objValue);
        if (keys.length > 0 && !keys.every(function (key) {
                return key in schemaObj;
            }))
            return {
                error: 'Allowed properties are [' + Object.keys(schemaObj) + ']'
            };

        for (var _key in schemaObj) {
            var validOrMessage = schemaObj[_key].call(null, _key, objValue[_key], objValue);
            if (typeof validOrMessage === 'string')
                result['error_' + _key] = validOrMessage;
            else if (typeof validOrMessage === 'object')
                result[_key] = validOrMessage;
        }
        return result;
    };
};

validator.array = function (key, value) {
    return (value instanceof Array) ? true : 'must be an Array';
};

validator.arrayOf = function (dataTypeValidator, msg) {
    if (isNotFunction(dataTypeValidator))
        throw new Error('arrayOf validator accepts a data type validator function');
    return function (key, value) {
        if (!(value instanceof Array))
            return 'must be an Array'

        if (dataTypeValidator.name !== 'object') {
            for (var i = 0; i < value.length; i++) {
                if (typeof dataTypeValidator(null, value[i]) === 'string') // in case of error
                    return msg ? msg : 'must be an Array'
            }
        } else {
            return value.map(function (v) {
                return dataTypeValidator('main', v);
            })
        }

    };
}

function isObjectEmpty(obj) {
    if (obj && obj instanceof Object && obj.constructor == Object.prototype.constructor) {
        var keys = Object.keys(obj)
        if (keys.length === 0)
            return true
        return keys.every(function (key) {
            return isObjectEmpty(obj[key])
        })
    } else if (obj instanceof Array && obj.length > 0) {
        return obj.every(function (element) {
            return isObjectEmpty(element)
        })
    } else {
        return false;
    }
}

// Validation helper
validator.validate = function (schema, input) {
    var result = schema.call(null, 'main', input);
    return isObjectEmpty(result) ? true : result;
};


validator.contract = function () {
    var contractArgs = Array.prototype.slice.call(arguments);
    var resultValidator = contractArgs[contractArgs.length - 2];
    var fn = contractArgs[contractArgs.length - 1];

    for (var i = 0; i < contractArgs.length - 1; i++) {
        var contractArg = contractArgs[i];
        if (isNotFunction(contractArg))
            throw Error('Argument validator error. Provide appropriate validator for argument number ' + (i + 1));
    }
    if (isNotFunction(fn))
        throw Error('Last argument to contract validator must be a function');

    return function () {
        var args = Array.prototype.slice.call(arguments);
        if (args.length !== (contractArgs.length - 2))
            throw Error('Argument arity error. Function call does not satisfy arguments contract');

        for (var i = 0; i < args.length; i++) {
            var contractArg = contractArgs[i];
            var arg = args[i];
            var valid = contractArg.name === 'object' ? validator.validate(contractArg, arg) : contractArg(null, arg);
            if (valid !== true)
                throw Error('Validation failed for argument number ' + (i + 1));
        }

        var result = fn.apply(null, args);
        var resultValid = resultValidator.name === 'object' ? validator.validate(resultValidator, result) : resultValidator(null, result);
        if (resultValid !== true)
            throw Error('Result of the function does not satisfy contract');
        return result;
    }
}

module.exports = validator;
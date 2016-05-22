// Validator
'use strict';

var validator = {};

// Validation functions
['string', 'number', 'boolean'].forEach(function(dataType) {
  validator[dataType] = function(key, value) {
    if (typeof value !== dataType || value === null || value === undefined || value.toString().trim().length < 1)
      return "must be a "+ dataType;
  };
});

validator.regex = function(pattern) {
  if (!(pattern instanceof RegExp))
    throw new Error("Regex validator accepts object of type RegExp");
  return function(key, value) {
    if (!pattern.test(value))
      return 'invalid pattern';
  };
};

validator.email = validator.regex(/^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i);

validator.indianMobile = validator.regex(/^[789]\d{9}$/);

validator.optional = function(func) {
  if (typeof func !== 'function')
    throw new Error("Optional validator accepts a validator function");
  return function(key, value, obj) {
    return key in obj ? func.call(null, key, value, obj) : true;
  };
};

validator.any = function(arr, msg) {
  if(!(arr instanceof Array)) {
    throw new Error("Any validator accepts an array of validators");
  }
  return function(key, value, obj) {
    for (var i = 0; i < arr.length; i++) {
      var validOrMessage = arr[i].call(null, key, value, obj);
      if(typeof(validOrMessage) !== "string")
        return;
    }
    return msg;
  };
};

validator.all = function(arr, msg) {
  if(!(arr instanceof Array)) {
    throw new Error("Any validator accepts an array of validators");
  }
  return function(key, value, obj) {
    for (var i = 0; i < arr.length; i++) {
      var validOrMessage = arr[i].call(null, key, value, obj);
      if(typeof(validOrMessage) === "string")
        return msg || validOrMessage;
    }
  };
};

validator.object = function(schemaObj) {
  return function(objKey, objValue) {
    var result = {};
    if (objValue === null || objValue === undefined || !(objValue instanceof Object && objValue.constructor == Object.prototype.constructor))
      return {
        error: "must be an object"
      };
    var keys = Object.keys(objValue);
    if(keys.length > 0 && !keys.every(function(key){
          return key in schemaObj;
        }))
      return {
        error: "Allowed properties are [" + Object.keys(schemaObj) + "]"
      };

    for (var _key in schemaObj) {
      var validOrMessage = schemaObj[_key].call(null, _key, objValue[_key], objValue);
      if(typeof(validOrMessage) === "string")
        result["error_"+_key] = validOrMessage;
      else if (typeof(validOrMessage) === "object")
        result[_key] = validOrMessage;
    }
    return result;
  };
};

// validator.array = function(func){
//   if (typeof func !== 'function')
//     throw new Error("Array validator accepts a validator function");
//   return function(key, values){
//     if(!Array.isArray(values)) {
//       this[`error_${key}`] = "must be an Array";
//       return;
//     }
//     var context = {};
//     values.forEach((value) => {
//       func.call(context, key, value);
//     });
//     this[`error_${key}`]=context[`error_${key}`];
//   };
// };

// Validation helper
validator.validate = function(schema, input) {
  return schema.call(null, "main", input);
};

module.exports = validator;

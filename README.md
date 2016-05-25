# fn-validator
Extendable and Isomorphic functional schema validator for browser and Node.js

-------
# Motivation

JavaScript being dynamic and weakly typed language, does not support anything which can help you validate the JSON object structure.

However, writing business logic in NodeJS, or even writing a browser based application requires strong type object contract interface to validate the data coming from or going to external sources and acknowledge the error messages in case of mismatch.
Now there are some JSON schema standards and libraries out there which help you do that but they lack the extensibility in terms of defining new kind of validators or composing them to make hybrid validators.

This library aims at
1. Defining flexible and tiny architecture to plug in any kind of reusable custom validator.
2. Using JavaScript as functional language without side effects. All validators are pure functions.
3. Providing facility to compose different kind of validators along with custom error messages.
4. Being predictable with full test coverage.

--------
# Install

`npm install fn-validator --save`

--------
# Use


```
var v = require("fn-validator");

var schema = v.object({
   firstName : v.string,
   lastName : v.all([v.string, v.minLength(2), v.maxLength(30)]),
   gender : v.enum(["Male", "Female", "Other"]),
   age : v.number,
   height : v.between(160, 190),
   graduationDate : v.before(new Date("2000-01-01")),
   single : v.boolean,
   hasGirlfriend : v.optional(v.boolean)
 })

var isValid = v.validate(schema, objectToBeValidated);

if(!Object.isEmpty(result))
  //handle error
else
  // all good

```

-------

# Custom Validator


If there is an error, Return `String` value which is a error message

Return `true` or don't return anything at all if value is valid

### Define Validator

```

function customValidator(key, value, object) {
  var errorMessageString = "Value is not valid";
  if(value is not valid) {
    return errorMessageString;
  }
//  else
//    return true;
}

```

### Define schema

```

var schema = object({
  attribute: customValidator
})

```
### Validate

```
expect(v.validate(schema, objectToBeValidated)).toEqual({
  error_attribute : "Value is not valid"
})


```

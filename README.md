# fn-validator
Extendable and Isomorphic functional schema validator for browser and Node.js

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

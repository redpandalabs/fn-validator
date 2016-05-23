# fn-validator
Extendable and Isomorphic functional schema validator for browser and Node.js

```
var v = require("fn-validator");

var schema = v.object({
   firstName : v.string,
   lastName : v.all([v.string, v.minLength(2), v.maxLength(30)]),
   gender : v.enum(["Male", "Female", "Other"]),
   age : v.number,
   birthDate : v.before(new Date("2000-01-01")),
   single : v.boolean
 })

v.validate(schema, {
   ...
});
```

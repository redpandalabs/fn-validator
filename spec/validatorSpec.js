'use strict'

describe('Validator Spec', function () {

    var validator = require('../index')
    var object = validator.object
    var optional = validator.optional
    var mobile = validator.indianMobile

    var string = validator.string
    var boolean = validator.boolean
    var number = validator.number
    var any = validator.any
    var all = validator.all
    var between = validator.between
    var enums = validator.enum
    var array = validator.array
    var arrayOf = validator.arrayOf
    var rstring = validator.rstring
    var alphaNumericString = validator.alphaNumericString

    describe('Validating basic data types', function () {

        it('should validate object data type', function () {
            var schema = object({
                name: string
            })
            var data = 123
            expect(validator.validate(schema, data)).toEqual({
                error: "must be an object"
            })
        })

        it('should check null or undefined values for string data type', function () {
            var schema = object({
                name: string
            })

            var invalidData = {
                name: null
            }

            expect(validator.validate(schema, invalidData)).toEqual({
                error_name: "must be a string"
            })
        })

        it('should validate string data type', function () {
            var schema = object({
                name: string
            })

            var invalidData = {
                name: 123
            }

            var data = {
                name: "John"
            }

            expect(validator.validate(schema, invalidData)).toEqual({
                error_name: "must be a string"
            })

            expect(validator.validate(schema, data)).toEqual(true)

        })

        it('should validate restricted string data type', function () {
            var schema = object({
                name: rstring
            })

            var invalidData = {
                name: "$$$function"
            }

            var data = {
                name: "Hey, Do you know why Johny's sister 13 died ? I guess @lex knows-"
            }

            expect(validator.validate(schema, invalidData)).toEqual({
                error_name: "invalid pattern"
            })

            expect(validator.validate(schema, data)).toEqual(true)

        })

        it('should validate alpha numeric string data type', function () {
            var schema = object({
                name: alphaNumericString
            })

            var invalidData = {
                name: "Hi, Johny how are you ?"
            }

            var data = {
                name: "Johny 123"
            }

            expect(validator.validate(schema, invalidData)).toEqual({
                error_name: "invalid pattern"
            })

            expect(validator.validate(schema, data)).toEqual(true)

        })

        it('should validate boolean data type', function () {
            var schema = object({
                isCrazy: boolean
            })

            var invalidData = {
                isCrazy: '123'
            }

            var data = {
                isCrazy: false
            }

            expect(validator.validate(schema, invalidData)).toEqual({
                error_isCrazy: "must be a boolean"
            })

            expect(validator.validate(schema, data)).toEqual(true)

        })

        it('should validate number data type', function () {
            var schema = object({
                salary: number
            })

            var invalidData = {
                salary: 'Ten thousand'
            }

            var data = {
                salary: 10000
            }

            expect(validator.validate(schema, invalidData)).toEqual({
                error_salary: "must be a number"
            })

            expect(validator.validate(schema, data)).toEqual(true)

        })

    })

    describe('Validating optional type', function () {

        it('should not accept other than validator functions', function () {
            expect(function () {
                object({
                    salary: optional(123)
                })
            }).toThrowError('Optional validator accepts a validator function')
        })

        it('should allow absence of value', function () {
            var schema = object({
                age: number,
                salary: optional(number)
            })

            var data = {
                age: 10
            }

            expect(validator.validate(schema, data)).toEqual(true)

        })

        it('should allow presence of value', function () {
            var schema = object({
                salary: optional(number)
            })

            var data = {
                salary: 10000
            }

            expect(validator.validate(schema, data)).toEqual(true)

        })

        it('should allow presence of value and value should not be null or undefined', function () {
            var schema = object({
                name: optional(string),
                salary: optional(number)
            })

            var data = {
                name: 'Manish',
                salary: null
            }

            expect(validator.validate(schema, data)).toEqual({
                error_salary: "must be a number"
            })

        })

    })


    it("should validate that JSON object contains attributes which are mentioned in schemaObj", function () {

        var schema = object({
            salary: number
        })

        var invalidData = {
            salary: 10000,
            age: 10
        }

        var data = {
            salary: 10000
        }

        expect(validator.validate(schema, invalidData)).toEqual({
            error: "Allowed properties are [salary]"
        })

        expect(validator.validate(schema, data)).toEqual(true)

    })

    describe('Composite Types :', function () {

        it('should validate nested JSON object', function () {

            var schema = object({
                salary: number,
                name: object({
                    firstName: string,
                    lastName: string
                })
            })

            var invalidData = {
                salary: 10000,
                name: {
                    firstName: "Piyush",
                    lastName: 12.5
                }
            }

            expect(validator.validate(schema, invalidData)).toEqual({
                name: {
                    error_lastName: "must be a string"
                }
            })

        })

        it('should validate nested JSON objects', function () {

            var schema = object({
                oldName: object({
                    firstName: string,
                    lastName: string
                }),
                name: object({
                    firstName: string,
                    lastName: string
                })

            })

            var invalidData = {
                oldName: {
                    firstName: 'string',
                    lastName: 'string'
                },
                name: {
                    firstName: "Piyush",
                    lastName: 4
                }
            }
            expect(validator.validate(schema, invalidData)).toEqual({
                oldName: {},
                name: {
                    error_lastName: 'must be a string'
                }
            })

        })

        it('should validate nested JSON objects', function () {

            var schema = object({
                oldName: object({
                    firstName: string,
                    lastName: object({
                        isFamilyName: boolean,
                        name: string
                    })
                }),
                name: object({
                    firstName: string,
                    lastName: string
                })

            })

            var invalidData = {
                oldName: {
                    firstName: 'string',
                    lastName: 'string'
                },
                name: {
                    firstName: "Piyush",
                    lastName: 4
                }
            }

            expect(validator.validate(schema, invalidData)).toEqual({
                oldName: {
                    lastName: {
                        error: 'must be an object'
                    }
                },
                name: {
                    error_lastName: 'must be a string'
                }
            })

        })
    })

    describe("any validator", function () {

        it("should raise an exception if array is not passed an argument", function () {
            expect(function () {
                object({
                    salary: any(true)
                })
            }).toThrowError()
        })

        it("should execute validators in sequence and short circuit when one of the validator matches", function () {

            var msg = "should match number or string"

            var schema = object({
                salary: any([number, string], msg)
            })

            var invalidData = {
                salary: true
            }

            var data1 = {
                salary: 10000
            }

            var data2 = {
                salary: "Ten thousand"
            }

            expect(validator.validate(schema, invalidData)).toEqual({
                error_salary: msg
            })

            expect(validator.validate(schema, data1)).toEqual(true)
            expect(validator.validate(schema, data2)).toEqual(true)

        })

    })

    describe("all validator", function () {

        it("should raise an exception if array is not passed an argument", function () {
            expect(function () {
                object({
                    salary: all(true)
                })
            }).toThrowError()
        })

        it("should execute validators in sequence and short circuit when one of the validator matches", function () {

            var msg = "should be a string and match pattern"

            var schema = object({
                mobile: all([number, mobile], msg)
            })

            var invalidData = {
                mobile: 123
            }

            var data = {
                mobile: 8886103303
            }

            expect(validator.validate(schema, invalidData)).toEqual({
                error_mobile: msg
            })

            expect(validator.validate(schema, data)).toEqual(true)

        })

    })

    describe("between validator", function () {

        it("should check for number which falls in between the given range", function () {

            var msg = "should be between 1 and 100"

            var schema = object({
                age: between(1, 100)
            })

            var invalidData1 = {
                age: 0
            }

            var invalidData2 = {
                age: 123
            }

            var data1 = {
                age: 1
            }

            var data2 = {
                age: 10
            }

            var data3 = {
                age: 100
            }

            expect(validator.validate(schema, invalidData1)).toEqual({
                error_age: msg
            })

            expect(validator.validate(schema, invalidData2)).toEqual({
                error_age: msg
            })

            expect(validator.validate(schema, data1)).toEqual(true)
            expect(validator.validate(schema, data2)).toEqual(true)
            expect(validator.validate(schema, data3)).toEqual(true)

        })

        it("should check range of values yield by property function", function () {

            var msg = "should be between 1 and 10"

            var p = {
                property: function () {}
            }

            spyOn(p, "property").and.returnValue(5)

            var schema = object({
                age: between(1, 10, p.property)
            })

            var data = {
                age: 10
            }

            expect(validator.validate(schema, data)).toEqual(true)
            expect(p.property).toHaveBeenCalledWith(10, data)
            expect(p.property).toHaveBeenCalledTimes(2)
        })

    })

    describe("length validators", function () {

        it("should check length", function () {
            var result = {}
            spyOn(validator, "between").and.returnValue(result)

            expect(validator.length(10)).toBe(result)
            expect(validator.between).toHaveBeenCalledWith(10, 10, validator._getLength)
        })

        it("should check minLength", function () {
            var result = {}
            spyOn(validator, "between").and.returnValue(result)

            expect(validator.minLength(10)).toBe(result)
            expect(validator.between).toHaveBeenCalledWith(10, Infinity, validator._getLength)
        })

        it("should check maxLength", function () {
            var result = {}
            spyOn(validator, "between").and.returnValue(result)

            expect(validator.maxLength(10)).toBe(result)
            expect(validator.between).toHaveBeenCalledWith(0, 10, validator._getLength)
        })

    })

    describe("Date validators", function () {

        it("should check if date is before the given date", function () {
            var result = {},
                date = new Date()
            spyOn(validator, "between").and.returnValue(result)

            expect(validator.before(date)).toBe(result)
            expect(validator.between).toHaveBeenCalledWith(0, date.getTime(), validator._getTime)
        })

        it("should check if date is after the given date", function () {
            var result = {},
                date = new Date()
            spyOn(validator, "between").and.returnValue(result)

            expect(validator.after(date)).toBe(result)
            expect(validator.between).toHaveBeenCalledWith(date.getTime(), Infinity, validator._getTime)
        })

    })

    describe("enum validator", function () {

        it("should check if the values passed as array argument", function () {
            expect(function () {
                enums(1, 2)
            }).toThrowError()
        })

        it("should accept only set of defined values", function () {

            var schema = object({
                age: enums([10, 20, 30])
            })

            var invalidData = {
                age: 15
            };

            [10, 20, 30].forEach(function (age) {
                expect(validator.validate(schema, {
                    age: age
                })).toEqual(true)
            })

            expect(validator.validate(schema, invalidData)).toEqual({
                error_age: "allowed values are [10,20,30]"
            })

        })

    })

    describe("array validator", function () {

        it("should validate array", function () {
            var schema = object({
                movies: array
            })
            var invalidData = {
                "movies": {
                    "mission": "impossible"
                }
            }
            var validData = {
                "movies": ["mission impossible"]
            }
            expect(validator.validate(schema, invalidData)).toEqual({
                error_movies: "must be an Array"
            })
            expect(validator.validate(schema, validData)).toEqual(true)
        })

        it("should validate array of data types", function () {
            var schema = object({
                choices: arrayOf(number)
            })
            var invalidData = {
                "choices": [1, 2.1, 3, "four"]
            }
            var validData = {
                "choices": [1, 2, 3.4, 5]
            }
            expect(validator.validate(schema, invalidData)).toEqual({
                error_choices: "must be an Array"
            })
            expect(validator.validate(schema, validData)).toEqual(true)
        })

        it("should validate array of data types along with custom message", function () {
            var message = "Please provide all numbers"
            var schema = object({
                choices: arrayOf(number, message)
            })
            var invalidData = {
                "choices": [1, 2.1, 3, "four"]
            }
            expect(validator.validate(schema, invalidData)).toEqual({
                error_choices: message
            })
        })

        it("should validate array of objects", function () {
            var message = "Please provide all numbers"
            var schema = object({
                choices: arrayOf(object({
                    rating: number
                }))
            })
            var invalidData = {
                "choices": [{
                    rating: 3
                }, {
                    rating: "three"
                }]
            }
            expect(validator.validate(schema, invalidData)).toEqual({
                choices: [{}, {
                    error_rating: "must be a number"
                }]
            })
        })

    })

    describe('Function Contract Validator', function () {

        var contract = validator.contract


        it('should validate contract validator usage', function () {

            expect(function () {
                contract('hello', 'world')
            }).toThrowError()
        })

        it('should validate functions contract', function () {

            function add(a, b) {
                return a + b
            }

            var contractAdd = contract(number, number, number, add)
            expect(function () {
                contractAdd('hello', 'world')
            }).toThrowError()

            expect(function () {
                contractAdd('hello', 2)
            }).toThrowError()

            expect(function () {
                contractAdd(1, 'hello')
            }).toThrowError()

            expect(function () {
                contractAdd(1)
            }).toThrowError()

            expect(contractAdd(1, 2)).toEqual(3)

            expect(function () {
                contract(number, number, number, function (a, b) {
                    return ''
                })(1, 2)
            }).toThrowError()

            expect(function () {
                contract(number, number, number, function (a, b) {
                    return 'Hello'
                })(1, 2)
            }).toThrowError()

        })

    })

})
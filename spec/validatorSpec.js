'use strict';

describe('Validator Spec', function() {

  var validator = require('../index');
  var object = validator.object;
  var optional = validator.optional;
  var mobile = validator.indianMobile;

  var string = validator.string;
  var boolean = validator.boolean;
  var number = validator.number;
  var any = validator.any;
  var all = validator.all;

  describe('Validating basic data types', function() {

    it('should validate object data type', function() {
      var schema = object({
        name: string
      });
      var data = 123;
      expect(validator.validate(schema, data)).toEqual({
        error: "must be an object"
      });
    });

    it('should check null or undefined values for string data type', function(){
      var schema = object({
        name: string
      });

      var invalidData = {
        name: null
      };

      expect(validator.validate(schema, invalidData)).toEqual({
        error_name: "must be a string"
      });
    });

    it('should validate string data type', function() {
      var schema = object({
        name: string
      });

      var invalidData = {
        name: 123
      };

      var data = {
        name: "John"
      };

      expect(validator.validate(schema, invalidData)).toEqual({
        error_name: "must be a string"
      });

      expect(validator.validate(schema, data)).toEqual({});

    });

    it('should validate boolean data type', function() {
      var schema = object({
        isCrazy: boolean
      });

      var invalidData = {
        isCrazy: '123'
      };

      var data = {
        isCrazy: false
      };

      expect(validator.validate(schema, invalidData)).toEqual({
        error_isCrazy: "must be a boolean"
      });

      expect(validator.validate(schema, data)).toEqual({});

    });

    it('should validate number data type', function() {
      var schema = object({
        salary: number
      });

      var invalidData = {
        salary: 'Ten thousand'
      };

      var data = {
        salary: 10000
      };

      expect(validator.validate(schema, invalidData)).toEqual({
        error_salary: "must be a number"
      });

      expect(validator.validate(schema, data)).toEqual({});

    });

  });

  describe('Validating optional type', function() {

    it('should not accept other than validator functions', function() {
      expect(function() {
        object({
          salary: optional(123)
        });
      }).toThrowError("Optional validator accepts a validator function");
    });

    it('should allow absence of value', function() {
      var schema = object({
        age : number,
        salary: optional(number)
      });

      var data = {
        age: 10
      };

      expect(validator.validate(schema, data)).toEqual({});

    });

    it('should allow presence of value', function() {
      var schema = object({
        salary: optional(number)
      });

      var data = {
        salary: 10000
      };

      expect(validator.validate(schema, data)).toEqual({});

    });

    it('should allow presence of value and value should not be null or undefined', function() {
      var schema = object({
        name: optional(string),
        salary: optional(number)
      });

      var data = {
        name: 'Manish',
        salary: null
      };

      expect(validator.validate(schema, data)).toEqual({
        error_salary: "must be a number"
      });

    });

  });


  it("should validate that JSON object contains attributes which are mentioned in schemaObj", function(){

    var schema = object({
      salary: number
    });

    var invalidData = {
      salary: 10000,
      age: 10
    };

    var data = {
      salary: 10000
    };

    expect(validator.validate(schema, invalidData)).toEqual({
      error: "Allowed properties are [salary]"
    });

    expect(validator.validate(schema, data)).toEqual({});

  });

  describe('Composite Types :', function(){

    it('should validate nested JSON object', function(){

      var schema = object({
        salary : number,
        name : object({
          firstName : string,
          lastName : string
        })
      });

      var invalidData = {
        salary : 10000,
        name : {
          firstName : "Piyush",
          lastName : 12.5
        }
      };

      expect(validator.validate(schema, invalidData)).toEqual({
        name : {
          error_lastName : "must be a string"
        }
      });

    });

    // it('should validate array object', function(){
    //
    //   var schema = object({
    //     salary : number,
    //     car : array(string)
    //   });
    //
    //   var invalidData = {
    //     salary : 10000,
    //     car : ["BMW", "Merc", 100]
    //   };
    //
    //   expect(validator.validate(schema, invalidData)).toEqual({
    //     error_car : "must be a string"
    //   });
    //
    // });
  });

  describe("any validator", function(){

    it("should raise an exception if array is not passed an argument", function(){
        expect(function(){
          object({
            salary : any(true)
          });
        }).toThrowError();
    });

    it("should execute validators in sequence and short circuit when one of the validator matches", function(){

      var msg = "should match number or string";

      var schema = object({
        salary: any([number, string], msg)
      });

      var invalidData = {
        salary: true
      };

      var data1 = {
        salary: 10000
      };

      var data2 = {
        salary: "Ten thousand"
      };

      expect(validator.validate(schema, invalidData)).toEqual({
        error_salary: msg
      });

      expect(validator.validate(schema, data1)).toEqual({});
      expect(validator.validate(schema, data2)).toEqual({});

    });

  });

  describe("all validator", function(){

    it("should raise an exception if array is not passed an argument", function(){
        expect(function(){
          object({
            salary : all(true)
          });
        }).toThrowError();
    });

    it("should execute validators in sequence and short circuit when one of the validator matches", function(){

      var msg = "should be a string and match pattern";

      var schema = object({
        mobile: all([number, mobile], msg)
      });

      var invalidData = {
        mobile: 123
      };

      var data = {
        mobile: 8886103303
      };

      expect(validator.validate(schema, invalidData)).toEqual({
        error_mobile: msg
      });

      expect(validator.validate(schema, data)).toEqual({});

    });

  });

});

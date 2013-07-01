/*global define:true*/

'use strict';

// Generates random values of the types defined in:
//
// Standard ECMA-262 ECMAScript® Language Specification Edition 5.1 (June 2011)
// http://www.ecma-international.org/publications/standards/Ecma-262.htm

define(['underscore'], function (_) {
  var types, atoms;

  function randomElement(array) {
    return array[_.random(array.length - 1)];
  }

  function random(maximumDepth) {
    var name, type, generator;

    maximumDepth = maximumDepth || 5;

    name = randomElement(maximumDepth > 1 ? Object.keys(types) : atoms);
    type = types[name];
    generator = type.generator;

    return type.atomic
      ? generator()
      : generator(maximumDepth);
  }

  types = {
    // 8.1 Undefined
    undefined: {
      atomic: true,

      generator: function () {
        return undefined;
      }
    },

    // 8.2 Null
    null: {
      atomic: true,

      generator: function () {
        return null;
      }
    },

    // 8.3 Boolean
    boolean: {
      atomic: true,

      generator: function () {
        return Math.random() < 0.5;
      }
    },

    // 8.4 String
    string: {
      atomic: true,

      generator: function (maximumLength) {
        var charCodes, charCodeLimit;

        charCodes = [];
        charCodeLimit = Math.pow(2, 16);

        _.times(_.random(maximumLength || 10), function () {
          charCodes.push(_.random(charCodeLimit));
        });

        return String.fromCharCode.apply(null, charCodes);
      }
    },

    // 8.5 Number
    number: {
      atomic: true,

      generator: function () {
        return randomElement([
          function () {
            var sign;

            sign = random.boolean() ? -1 : 1;
            return sign * Math.random() * Number.MAX_VALUE;
          },

          // This must be generated separately because the above function will
          // never generate it.
          function () { return Number.MAX_VALUE; },

          function () { return NaN; },
          function () { return -Infinity; },
          function () { return Infinity; }
        ])();
      }
    },

    // 8.6 Object
    object: {
      atomic: false,

      generator: function (maximumDepth, maximumLength) {
        var length, names, name, object;

        length = _.random(maximumLength || 10);

        // Choose random but unique property names.
        names = [];

        while (names.length < length) {
          name = random.string();

          if (names.indexOf(name) == -1)
            names.push(name);
        }

        object = {};

        names.forEach(function (name) {
          Object.defineProperty(object, name, random.boolean()
            ? {
                value: random((maximumDepth || 5) - 1),
                writable: random.boolean(),
                enumerable: random.boolean(),
                configurable: random.boolean()
              }
            : {
                get: function () {},
                set: function () {},
                enumerable: random.boolean(),
                configurable: random.boolean()
            });
        });

        return object;
      }
    },

    // Everything that follows is a type of an object, but it's more convenient
    // to break them out as separate types.

    // 15.3 Function
    function: {
      atomic: true,

      generator: function () {
        return function () {};
      }
    },

    // 15.4 Array
    array: {
      atomic: false,

      generator: function (maximumDepth, maximumLength) {
        var array;

        array = [];

        _.times(_.random(maximumLength || 10), function () {
          array.push(random((maximumDepth || 5) - 1));
        });

        return array;
      }
    },

    // 15.9 Date
    date: {
      atomic: true,

      generator: function () {
        // The actual range of times supported by ECMAScript Date objects is ...
        // exactly –100,000,000 days to 100,000,000 days measured relative to
        // midnight at the beginning of 01 January, 1970 UTC. This gives a range
        // of 8,640,000,000,000,000 milliseconds to either side of 01 January,
        // 1970 UTC.
        return new Date(_.random(-8640000000000000, 8640000000000000));
      }
    }
  };

  atoms = [];

  Object.keys(types).forEach(function (type) {
    if (types[type].atomic)
      atoms.push(type);

    random[type] = types[type].generator;
  });

  return random;
});
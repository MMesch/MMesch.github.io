// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"node_modules/js-yaml/dist/js-yaml.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.types = exports.safeLoadAll = exports.safeLoad = exports.safeDump = exports.loadAll = exports.load = exports.dump = exports.YAMLException = exports.Type = exports.Schema = exports.JSON_SCHEMA = exports.FAILSAFE_SCHEMA = exports.DEFAULT_SCHEMA = exports.CORE_SCHEMA = exports.default = void 0;

/*! js-yaml 4.1.0 https://github.com/nodeca/js-yaml @license MIT */
function isNothing(subject) {
  return typeof subject === 'undefined' || subject === null;
}

function isObject(subject) {
  return typeof subject === 'object' && subject !== null;
}

function toArray(sequence) {
  if (Array.isArray(sequence)) return sequence;else if (isNothing(sequence)) return [];
  return [sequence];
}

function extend(target, source) {
  var index, length, key, sourceKeys;

  if (source) {
    sourceKeys = Object.keys(source);

    for (index = 0, length = sourceKeys.length; index < length; index += 1) {
      key = sourceKeys[index];
      target[key] = source[key];
    }
  }

  return target;
}

function repeat(string, count) {
  var result = '',
      cycle;

  for (cycle = 0; cycle < count; cycle += 1) {
    result += string;
  }

  return result;
}

function isNegativeZero(number) {
  return number === 0 && Number.NEGATIVE_INFINITY === 1 / number;
}

var isNothing_1 = isNothing;
var isObject_1 = isObject;
var toArray_1 = toArray;
var repeat_1 = repeat;
var isNegativeZero_1 = isNegativeZero;
var extend_1 = extend;
var common = {
  isNothing: isNothing_1,
  isObject: isObject_1,
  toArray: toArray_1,
  repeat: repeat_1,
  isNegativeZero: isNegativeZero_1,
  extend: extend_1
}; // YAML error class. http://stackoverflow.com/questions/8458984

function formatError(exception, compact) {
  var where = '',
      message = exception.reason || '(unknown reason)';
  if (!exception.mark) return message;

  if (exception.mark.name) {
    where += 'in "' + exception.mark.name + '" ';
  }

  where += '(' + (exception.mark.line + 1) + ':' + (exception.mark.column + 1) + ')';

  if (!compact && exception.mark.snippet) {
    where += '\n\n' + exception.mark.snippet;
  }

  return message + ' ' + where;
}

function YAMLException$1(reason, mark) {
  // Super constructor
  Error.call(this);
  this.name = 'YAMLException';
  this.reason = reason;
  this.mark = mark;
  this.message = formatError(this, false); // Include stack trace in error object

  if (Error.captureStackTrace) {
    // Chrome and NodeJS
    Error.captureStackTrace(this, this.constructor);
  } else {
    // FF, IE 10+ and Safari 6+. Fallback for others
    this.stack = new Error().stack || '';
  }
} // Inherit from Error


YAMLException$1.prototype = Object.create(Error.prototype);
YAMLException$1.prototype.constructor = YAMLException$1;

YAMLException$1.prototype.toString = function toString(compact) {
  return this.name + ': ' + formatError(this, compact);
};

var exception = YAMLException$1; // get snippet for a single line, respecting maxLength

function getLine(buffer, lineStart, lineEnd, position, maxLineLength) {
  var head = '';
  var tail = '';
  var maxHalfLength = Math.floor(maxLineLength / 2) - 1;

  if (position - lineStart > maxHalfLength) {
    head = ' ... ';
    lineStart = position - maxHalfLength + head.length;
  }

  if (lineEnd - position > maxHalfLength) {
    tail = ' ...';
    lineEnd = position + maxHalfLength - tail.length;
  }

  return {
    str: head + buffer.slice(lineStart, lineEnd).replace(/\t/g, '→') + tail,
    pos: position - lineStart + head.length // relative position

  };
}

function padStart(string, max) {
  return common.repeat(' ', max - string.length) + string;
}

function makeSnippet(mark, options) {
  options = Object.create(options || null);
  if (!mark.buffer) return null;
  if (!options.maxLength) options.maxLength = 79;
  if (typeof options.indent !== 'number') options.indent = 1;
  if (typeof options.linesBefore !== 'number') options.linesBefore = 3;
  if (typeof options.linesAfter !== 'number') options.linesAfter = 2;
  var re = /\r?\n|\r|\0/g;
  var lineStarts = [0];
  var lineEnds = [];
  var match;
  var foundLineNo = -1;

  while (match = re.exec(mark.buffer)) {
    lineEnds.push(match.index);
    lineStarts.push(match.index + match[0].length);

    if (mark.position <= match.index && foundLineNo < 0) {
      foundLineNo = lineStarts.length - 2;
    }
  }

  if (foundLineNo < 0) foundLineNo = lineStarts.length - 1;
  var result = '',
      i,
      line;
  var lineNoLength = Math.min(mark.line + options.linesAfter, lineEnds.length).toString().length;
  var maxLineLength = options.maxLength - (options.indent + lineNoLength + 3);

  for (i = 1; i <= options.linesBefore; i++) {
    if (foundLineNo - i < 0) break;
    line = getLine(mark.buffer, lineStarts[foundLineNo - i], lineEnds[foundLineNo - i], mark.position - (lineStarts[foundLineNo] - lineStarts[foundLineNo - i]), maxLineLength);
    result = common.repeat(' ', options.indent) + padStart((mark.line - i + 1).toString(), lineNoLength) + ' | ' + line.str + '\n' + result;
  }

  line = getLine(mark.buffer, lineStarts[foundLineNo], lineEnds[foundLineNo], mark.position, maxLineLength);
  result += common.repeat(' ', options.indent) + padStart((mark.line + 1).toString(), lineNoLength) + ' | ' + line.str + '\n';
  result += common.repeat('-', options.indent + lineNoLength + 3 + line.pos) + '^' + '\n';

  for (i = 1; i <= options.linesAfter; i++) {
    if (foundLineNo + i >= lineEnds.length) break;
    line = getLine(mark.buffer, lineStarts[foundLineNo + i], lineEnds[foundLineNo + i], mark.position - (lineStarts[foundLineNo] - lineStarts[foundLineNo + i]), maxLineLength);
    result += common.repeat(' ', options.indent) + padStart((mark.line + i + 1).toString(), lineNoLength) + ' | ' + line.str + '\n';
  }

  return result.replace(/\n$/, '');
}

var snippet = makeSnippet;
var TYPE_CONSTRUCTOR_OPTIONS = ['kind', 'multi', 'resolve', 'construct', 'instanceOf', 'predicate', 'represent', 'representName', 'defaultStyle', 'styleAliases'];
var YAML_NODE_KINDS = ['scalar', 'sequence', 'mapping'];

function compileStyleAliases(map) {
  var result = {};

  if (map !== null) {
    Object.keys(map).forEach(function (style) {
      map[style].forEach(function (alias) {
        result[String(alias)] = style;
      });
    });
  }

  return result;
}

function Type$1(tag, options) {
  options = options || {};
  Object.keys(options).forEach(function (name) {
    if (TYPE_CONSTRUCTOR_OPTIONS.indexOf(name) === -1) {
      throw new exception('Unknown option "' + name + '" is met in definition of "' + tag + '" YAML type.');
    }
  }); // TODO: Add tag format check.

  this.options = options; // keep original options in case user wants to extend this type later

  this.tag = tag;
  this.kind = options['kind'] || null;

  this.resolve = options['resolve'] || function () {
    return true;
  };

  this.construct = options['construct'] || function (data) {
    return data;
  };

  this.instanceOf = options['instanceOf'] || null;
  this.predicate = options['predicate'] || null;
  this.represent = options['represent'] || null;
  this.representName = options['representName'] || null;
  this.defaultStyle = options['defaultStyle'] || null;
  this.multi = options['multi'] || false;
  this.styleAliases = compileStyleAliases(options['styleAliases'] || null);

  if (YAML_NODE_KINDS.indexOf(this.kind) === -1) {
    throw new exception('Unknown kind "' + this.kind + '" is specified for "' + tag + '" YAML type.');
  }
}

var type = Type$1;
/*eslint-disable max-len*/

function compileList(schema, name) {
  var result = [];
  schema[name].forEach(function (currentType) {
    var newIndex = result.length;
    result.forEach(function (previousType, previousIndex) {
      if (previousType.tag === currentType.tag && previousType.kind === currentType.kind && previousType.multi === currentType.multi) {
        newIndex = previousIndex;
      }
    });
    result[newIndex] = currentType;
  });
  return result;
}

function compileMap()
/* lists... */
{
  var result = {
    scalar: {},
    sequence: {},
    mapping: {},
    fallback: {},
    multi: {
      scalar: [],
      sequence: [],
      mapping: [],
      fallback: []
    }
  },
      index,
      length;

  function collectType(type) {
    if (type.multi) {
      result.multi[type.kind].push(type);
      result.multi['fallback'].push(type);
    } else {
      result[type.kind][type.tag] = result['fallback'][type.tag] = type;
    }
  }

  for (index = 0, length = arguments.length; index < length; index += 1) {
    arguments[index].forEach(collectType);
  }

  return result;
}

function Schema$1(definition) {
  return this.extend(definition);
}

Schema$1.prototype.extend = function extend(definition) {
  var implicit = [];
  var explicit = [];

  if (definition instanceof type) {
    // Schema.extend(type)
    explicit.push(definition);
  } else if (Array.isArray(definition)) {
    // Schema.extend([ type1, type2, ... ])
    explicit = explicit.concat(definition);
  } else if (definition && (Array.isArray(definition.implicit) || Array.isArray(definition.explicit))) {
    // Schema.extend({ explicit: [ type1, type2, ... ], implicit: [ type1, type2, ... ] })
    if (definition.implicit) implicit = implicit.concat(definition.implicit);
    if (definition.explicit) explicit = explicit.concat(definition.explicit);
  } else {
    throw new exception('Schema.extend argument should be a Type, [ Type ], ' + 'or a schema definition ({ implicit: [...], explicit: [...] })');
  }

  implicit.forEach(function (type$1) {
    if (!(type$1 instanceof type)) {
      throw new exception('Specified list of YAML types (or a single Type object) contains a non-Type object.');
    }

    if (type$1.loadKind && type$1.loadKind !== 'scalar') {
      throw new exception('There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.');
    }

    if (type$1.multi) {
      throw new exception('There is a multi type in the implicit list of a schema. Multi tags can only be listed as explicit.');
    }
  });
  explicit.forEach(function (type$1) {
    if (!(type$1 instanceof type)) {
      throw new exception('Specified list of YAML types (or a single Type object) contains a non-Type object.');
    }
  });
  var result = Object.create(Schema$1.prototype);
  result.implicit = (this.implicit || []).concat(implicit);
  result.explicit = (this.explicit || []).concat(explicit);
  result.compiledImplicit = compileList(result, 'implicit');
  result.compiledExplicit = compileList(result, 'explicit');
  result.compiledTypeMap = compileMap(result.compiledImplicit, result.compiledExplicit);
  return result;
};

var schema = Schema$1;
var str = new type('tag:yaml.org,2002:str', {
  kind: 'scalar',
  construct: function (data) {
    return data !== null ? data : '';
  }
});
var seq = new type('tag:yaml.org,2002:seq', {
  kind: 'sequence',
  construct: function (data) {
    return data !== null ? data : [];
  }
});
var map = new type('tag:yaml.org,2002:map', {
  kind: 'mapping',
  construct: function (data) {
    return data !== null ? data : {};
  }
});
var failsafe = new schema({
  explicit: [str, seq, map]
});

function resolveYamlNull(data) {
  if (data === null) return true;
  var max = data.length;
  return max === 1 && data === '~' || max === 4 && (data === 'null' || data === 'Null' || data === 'NULL');
}

function constructYamlNull() {
  return null;
}

function isNull(object) {
  return object === null;
}

var _null = new type('tag:yaml.org,2002:null', {
  kind: 'scalar',
  resolve: resolveYamlNull,
  construct: constructYamlNull,
  predicate: isNull,
  represent: {
    canonical: function () {
      return '~';
    },
    lowercase: function () {
      return 'null';
    },
    uppercase: function () {
      return 'NULL';
    },
    camelcase: function () {
      return 'Null';
    },
    empty: function () {
      return '';
    }
  },
  defaultStyle: 'lowercase'
});

function resolveYamlBoolean(data) {
  if (data === null) return false;
  var max = data.length;
  return max === 4 && (data === 'true' || data === 'True' || data === 'TRUE') || max === 5 && (data === 'false' || data === 'False' || data === 'FALSE');
}

function constructYamlBoolean(data) {
  return data === 'true' || data === 'True' || data === 'TRUE';
}

function isBoolean(object) {
  return Object.prototype.toString.call(object) === '[object Boolean]';
}

var bool = new type('tag:yaml.org,2002:bool', {
  kind: 'scalar',
  resolve: resolveYamlBoolean,
  construct: constructYamlBoolean,
  predicate: isBoolean,
  represent: {
    lowercase: function (object) {
      return object ? 'true' : 'false';
    },
    uppercase: function (object) {
      return object ? 'TRUE' : 'FALSE';
    },
    camelcase: function (object) {
      return object ? 'True' : 'False';
    }
  },
  defaultStyle: 'lowercase'
});

function isHexCode(c) {
  return 0x30
  /* 0 */
  <= c && c <= 0x39
  /* 9 */
  || 0x41
  /* A */
  <= c && c <= 0x46
  /* F */
  || 0x61
  /* a */
  <= c && c <= 0x66
  /* f */
  ;
}

function isOctCode(c) {
  return 0x30
  /* 0 */
  <= c && c <= 0x37
  /* 7 */
  ;
}

function isDecCode(c) {
  return 0x30
  /* 0 */
  <= c && c <= 0x39
  /* 9 */
  ;
}

function resolveYamlInteger(data) {
  if (data === null) return false;
  var max = data.length,
      index = 0,
      hasDigits = false,
      ch;
  if (!max) return false;
  ch = data[index]; // sign

  if (ch === '-' || ch === '+') {
    ch = data[++index];
  }

  if (ch === '0') {
    // 0
    if (index + 1 === max) return true;
    ch = data[++index]; // base 2, base 8, base 16

    if (ch === 'b') {
      // base 2
      index++;

      for (; index < max; index++) {
        ch = data[index];
        if (ch === '_') continue;
        if (ch !== '0' && ch !== '1') return false;
        hasDigits = true;
      }

      return hasDigits && ch !== '_';
    }

    if (ch === 'x') {
      // base 16
      index++;

      for (; index < max; index++) {
        ch = data[index];
        if (ch === '_') continue;
        if (!isHexCode(data.charCodeAt(index))) return false;
        hasDigits = true;
      }

      return hasDigits && ch !== '_';
    }

    if (ch === 'o') {
      // base 8
      index++;

      for (; index < max; index++) {
        ch = data[index];
        if (ch === '_') continue;
        if (!isOctCode(data.charCodeAt(index))) return false;
        hasDigits = true;
      }

      return hasDigits && ch !== '_';
    }
  } // base 10 (except 0)
  // value should not start with `_`;


  if (ch === '_') return false;

  for (; index < max; index++) {
    ch = data[index];
    if (ch === '_') continue;

    if (!isDecCode(data.charCodeAt(index))) {
      return false;
    }

    hasDigits = true;
  } // Should have digits and should not end with `_`


  if (!hasDigits || ch === '_') return false;
  return true;
}

function constructYamlInteger(data) {
  var value = data,
      sign = 1,
      ch;

  if (value.indexOf('_') !== -1) {
    value = value.replace(/_/g, '');
  }

  ch = value[0];

  if (ch === '-' || ch === '+') {
    if (ch === '-') sign = -1;
    value = value.slice(1);
    ch = value[0];
  }

  if (value === '0') return 0;

  if (ch === '0') {
    if (value[1] === 'b') return sign * parseInt(value.slice(2), 2);
    if (value[1] === 'x') return sign * parseInt(value.slice(2), 16);
    if (value[1] === 'o') return sign * parseInt(value.slice(2), 8);
  }

  return sign * parseInt(value, 10);
}

function isInteger(object) {
  return Object.prototype.toString.call(object) === '[object Number]' && object % 1 === 0 && !common.isNegativeZero(object);
}

var int = new type('tag:yaml.org,2002:int', {
  kind: 'scalar',
  resolve: resolveYamlInteger,
  construct: constructYamlInteger,
  predicate: isInteger,
  represent: {
    binary: function (obj) {
      return obj >= 0 ? '0b' + obj.toString(2) : '-0b' + obj.toString(2).slice(1);
    },
    octal: function (obj) {
      return obj >= 0 ? '0o' + obj.toString(8) : '-0o' + obj.toString(8).slice(1);
    },
    decimal: function (obj) {
      return obj.toString(10);
    },

    /* eslint-disable max-len */
    hexadecimal: function (obj) {
      return obj >= 0 ? '0x' + obj.toString(16).toUpperCase() : '-0x' + obj.toString(16).toUpperCase().slice(1);
    }
  },
  defaultStyle: 'decimal',
  styleAliases: {
    binary: [2, 'bin'],
    octal: [8, 'oct'],
    decimal: [10, 'dec'],
    hexadecimal: [16, 'hex']
  }
});
var YAML_FLOAT_PATTERN = new RegExp( // 2.5e4, 2.5 and integers
'^(?:[-+]?(?:[0-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?' + // .2e4, .2
// special case, seems not from spec
'|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?' + // .inf
'|[-+]?\\.(?:inf|Inf|INF)' + // .nan
'|\\.(?:nan|NaN|NAN))$');

function resolveYamlFloat(data) {
  if (data === null) return false;

  if (!YAML_FLOAT_PATTERN.test(data) || // Quick hack to not allow integers end with `_`
  // Probably should update regexp & check speed
  data[data.length - 1] === '_') {
    return false;
  }

  return true;
}

function constructYamlFloat(data) {
  var value, sign;
  value = data.replace(/_/g, '').toLowerCase();
  sign = value[0] === '-' ? -1 : 1;

  if ('+-'.indexOf(value[0]) >= 0) {
    value = value.slice(1);
  }

  if (value === '.inf') {
    return sign === 1 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
  } else if (value === '.nan') {
    return NaN;
  }

  return sign * parseFloat(value, 10);
}

var SCIENTIFIC_WITHOUT_DOT = /^[-+]?[0-9]+e/;

function representYamlFloat(object, style) {
  var res;

  if (isNaN(object)) {
    switch (style) {
      case 'lowercase':
        return '.nan';

      case 'uppercase':
        return '.NAN';

      case 'camelcase':
        return '.NaN';
    }
  } else if (Number.POSITIVE_INFINITY === object) {
    switch (style) {
      case 'lowercase':
        return '.inf';

      case 'uppercase':
        return '.INF';

      case 'camelcase':
        return '.Inf';
    }
  } else if (Number.NEGATIVE_INFINITY === object) {
    switch (style) {
      case 'lowercase':
        return '-.inf';

      case 'uppercase':
        return '-.INF';

      case 'camelcase':
        return '-.Inf';
    }
  } else if (common.isNegativeZero(object)) {
    return '-0.0';
  }

  res = object.toString(10); // JS stringifier can build scientific format without dots: 5e-100,
  // while YAML requres dot: 5.e-100. Fix it with simple hack

  return SCIENTIFIC_WITHOUT_DOT.test(res) ? res.replace('e', '.e') : res;
}

function isFloat(object) {
  return Object.prototype.toString.call(object) === '[object Number]' && (object % 1 !== 0 || common.isNegativeZero(object));
}

var float = new type('tag:yaml.org,2002:float', {
  kind: 'scalar',
  resolve: resolveYamlFloat,
  construct: constructYamlFloat,
  predicate: isFloat,
  represent: representYamlFloat,
  defaultStyle: 'lowercase'
});
var json = failsafe.extend({
  implicit: [_null, bool, int, float]
});
var core = json;
var YAML_DATE_REGEXP = new RegExp('^([0-9][0-9][0-9][0-9])' + // [1] year
'-([0-9][0-9])' + // [2] month
'-([0-9][0-9])$'); // [3] day

var YAML_TIMESTAMP_REGEXP = new RegExp('^([0-9][0-9][0-9][0-9])' + // [1] year
'-([0-9][0-9]?)' + // [2] month
'-([0-9][0-9]?)' + // [3] day
'(?:[Tt]|[ \\t]+)' + // ...
'([0-9][0-9]?)' + // [4] hour
':([0-9][0-9])' + // [5] minute
':([0-9][0-9])' + // [6] second
'(?:\\.([0-9]*))?' + // [7] fraction
'(?:[ \\t]*(Z|([-+])([0-9][0-9]?)' + // [8] tz [9] tz_sign [10] tz_hour
'(?::([0-9][0-9]))?))?$'); // [11] tz_minute

function resolveYamlTimestamp(data) {
  if (data === null) return false;
  if (YAML_DATE_REGEXP.exec(data) !== null) return true;
  if (YAML_TIMESTAMP_REGEXP.exec(data) !== null) return true;
  return false;
}

function constructYamlTimestamp(data) {
  var match,
      year,
      month,
      day,
      hour,
      minute,
      second,
      fraction = 0,
      delta = null,
      tz_hour,
      tz_minute,
      date;
  match = YAML_DATE_REGEXP.exec(data);
  if (match === null) match = YAML_TIMESTAMP_REGEXP.exec(data);
  if (match === null) throw new Error('Date resolve error'); // match: [1] year [2] month [3] day

  year = +match[1];
  month = +match[2] - 1; // JS month starts with 0

  day = +match[3];

  if (!match[4]) {
    // no hour
    return new Date(Date.UTC(year, month, day));
  } // match: [4] hour [5] minute [6] second [7] fraction


  hour = +match[4];
  minute = +match[5];
  second = +match[6];

  if (match[7]) {
    fraction = match[7].slice(0, 3);

    while (fraction.length < 3) {
      // milli-seconds
      fraction += '0';
    }

    fraction = +fraction;
  } // match: [8] tz [9] tz_sign [10] tz_hour [11] tz_minute


  if (match[9]) {
    tz_hour = +match[10];
    tz_minute = +(match[11] || 0);
    delta = (tz_hour * 60 + tz_minute) * 60000; // delta in mili-seconds

    if (match[9] === '-') delta = -delta;
  }

  date = new Date(Date.UTC(year, month, day, hour, minute, second, fraction));
  if (delta) date.setTime(date.getTime() - delta);
  return date;
}

function representYamlTimestamp(object
/*, style*/
) {
  return object.toISOString();
}

var timestamp = new type('tag:yaml.org,2002:timestamp', {
  kind: 'scalar',
  resolve: resolveYamlTimestamp,
  construct: constructYamlTimestamp,
  instanceOf: Date,
  represent: representYamlTimestamp
});

function resolveYamlMerge(data) {
  return data === '<<' || data === null;
}

var merge = new type('tag:yaml.org,2002:merge', {
  kind: 'scalar',
  resolve: resolveYamlMerge
});
/*eslint-disable no-bitwise*/
// [ 64, 65, 66 ] -> [ padding, CR, LF ]

var BASE64_MAP = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=\n\r';

function resolveYamlBinary(data) {
  if (data === null) return false;
  var code,
      idx,
      bitlen = 0,
      max = data.length,
      map = BASE64_MAP; // Convert one by one.

  for (idx = 0; idx < max; idx++) {
    code = map.indexOf(data.charAt(idx)); // Skip CR/LF

    if (code > 64) continue; // Fail on illegal characters

    if (code < 0) return false;
    bitlen += 6;
  } // If there are any bits left, source was corrupted


  return bitlen % 8 === 0;
}

function constructYamlBinary(data) {
  var idx,
      tailbits,
      input = data.replace(/[\r\n=]/g, ''),
      // remove CR/LF & padding to simplify scan
  max = input.length,
      map = BASE64_MAP,
      bits = 0,
      result = []; // Collect by 6*4 bits (3 bytes)

  for (idx = 0; idx < max; idx++) {
    if (idx % 4 === 0 && idx) {
      result.push(bits >> 16 & 0xFF);
      result.push(bits >> 8 & 0xFF);
      result.push(bits & 0xFF);
    }

    bits = bits << 6 | map.indexOf(input.charAt(idx));
  } // Dump tail


  tailbits = max % 4 * 6;

  if (tailbits === 0) {
    result.push(bits >> 16 & 0xFF);
    result.push(bits >> 8 & 0xFF);
    result.push(bits & 0xFF);
  } else if (tailbits === 18) {
    result.push(bits >> 10 & 0xFF);
    result.push(bits >> 2 & 0xFF);
  } else if (tailbits === 12) {
    result.push(bits >> 4 & 0xFF);
  }

  return new Uint8Array(result);
}

function representYamlBinary(object
/*, style*/
) {
  var result = '',
      bits = 0,
      idx,
      tail,
      max = object.length,
      map = BASE64_MAP; // Convert every three bytes to 4 ASCII characters.

  for (idx = 0; idx < max; idx++) {
    if (idx % 3 === 0 && idx) {
      result += map[bits >> 18 & 0x3F];
      result += map[bits >> 12 & 0x3F];
      result += map[bits >> 6 & 0x3F];
      result += map[bits & 0x3F];
    }

    bits = (bits << 8) + object[idx];
  } // Dump tail


  tail = max % 3;

  if (tail === 0) {
    result += map[bits >> 18 & 0x3F];
    result += map[bits >> 12 & 0x3F];
    result += map[bits >> 6 & 0x3F];
    result += map[bits & 0x3F];
  } else if (tail === 2) {
    result += map[bits >> 10 & 0x3F];
    result += map[bits >> 4 & 0x3F];
    result += map[bits << 2 & 0x3F];
    result += map[64];
  } else if (tail === 1) {
    result += map[bits >> 2 & 0x3F];
    result += map[bits << 4 & 0x3F];
    result += map[64];
    result += map[64];
  }

  return result;
}

function isBinary(obj) {
  return Object.prototype.toString.call(obj) === '[object Uint8Array]';
}

var binary = new type('tag:yaml.org,2002:binary', {
  kind: 'scalar',
  resolve: resolveYamlBinary,
  construct: constructYamlBinary,
  predicate: isBinary,
  represent: representYamlBinary
});
var _hasOwnProperty$3 = Object.prototype.hasOwnProperty;
var _toString$2 = Object.prototype.toString;

function resolveYamlOmap(data) {
  if (data === null) return true;
  var objectKeys = [],
      index,
      length,
      pair,
      pairKey,
      pairHasKey,
      object = data;

  for (index = 0, length = object.length; index < length; index += 1) {
    pair = object[index];
    pairHasKey = false;
    if (_toString$2.call(pair) !== '[object Object]') return false;

    for (pairKey in pair) {
      if (_hasOwnProperty$3.call(pair, pairKey)) {
        if (!pairHasKey) pairHasKey = true;else return false;
      }
    }

    if (!pairHasKey) return false;
    if (objectKeys.indexOf(pairKey) === -1) objectKeys.push(pairKey);else return false;
  }

  return true;
}

function constructYamlOmap(data) {
  return data !== null ? data : [];
}

var omap = new type('tag:yaml.org,2002:omap', {
  kind: 'sequence',
  resolve: resolveYamlOmap,
  construct: constructYamlOmap
});
var _toString$1 = Object.prototype.toString;

function resolveYamlPairs(data) {
  if (data === null) return true;
  var index,
      length,
      pair,
      keys,
      result,
      object = data;
  result = new Array(object.length);

  for (index = 0, length = object.length; index < length; index += 1) {
    pair = object[index];
    if (_toString$1.call(pair) !== '[object Object]') return false;
    keys = Object.keys(pair);
    if (keys.length !== 1) return false;
    result[index] = [keys[0], pair[keys[0]]];
  }

  return true;
}

function constructYamlPairs(data) {
  if (data === null) return [];
  var index,
      length,
      pair,
      keys,
      result,
      object = data;
  result = new Array(object.length);

  for (index = 0, length = object.length; index < length; index += 1) {
    pair = object[index];
    keys = Object.keys(pair);
    result[index] = [keys[0], pair[keys[0]]];
  }

  return result;
}

var pairs = new type('tag:yaml.org,2002:pairs', {
  kind: 'sequence',
  resolve: resolveYamlPairs,
  construct: constructYamlPairs
});
var _hasOwnProperty$2 = Object.prototype.hasOwnProperty;

function resolveYamlSet(data) {
  if (data === null) return true;
  var key,
      object = data;

  for (key in object) {
    if (_hasOwnProperty$2.call(object, key)) {
      if (object[key] !== null) return false;
    }
  }

  return true;
}

function constructYamlSet(data) {
  return data !== null ? data : {};
}

var set = new type('tag:yaml.org,2002:set', {
  kind: 'mapping',
  resolve: resolveYamlSet,
  construct: constructYamlSet
});

var _default = core.extend({
  implicit: [timestamp, merge],
  explicit: [binary, omap, pairs, set]
});
/*eslint-disable max-len,no-use-before-define*/


var _hasOwnProperty$1 = Object.prototype.hasOwnProperty;
var CONTEXT_FLOW_IN = 1;
var CONTEXT_FLOW_OUT = 2;
var CONTEXT_BLOCK_IN = 3;
var CONTEXT_BLOCK_OUT = 4;
var CHOMPING_CLIP = 1;
var CHOMPING_STRIP = 2;
var CHOMPING_KEEP = 3;
var PATTERN_NON_PRINTABLE = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;
var PATTERN_NON_ASCII_LINE_BREAKS = /[\x85\u2028\u2029]/;
var PATTERN_FLOW_INDICATORS = /[,\[\]\{\}]/;
var PATTERN_TAG_HANDLE = /^(?:!|!!|![a-z\-]+!)$/i;
var PATTERN_TAG_URI = /^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;

function _class(obj) {
  return Object.prototype.toString.call(obj);
}

function is_EOL(c) {
  return c === 0x0A
  /* LF */
  || c === 0x0D
  /* CR */
  ;
}

function is_WHITE_SPACE(c) {
  return c === 0x09
  /* Tab */
  || c === 0x20
  /* Space */
  ;
}

function is_WS_OR_EOL(c) {
  return c === 0x09
  /* Tab */
  || c === 0x20
  /* Space */
  || c === 0x0A
  /* LF */
  || c === 0x0D
  /* CR */
  ;
}

function is_FLOW_INDICATOR(c) {
  return c === 0x2C
  /* , */
  || c === 0x5B
  /* [ */
  || c === 0x5D
  /* ] */
  || c === 0x7B
  /* { */
  || c === 0x7D
  /* } */
  ;
}

function fromHexCode(c) {
  var lc;

  if (0x30
  /* 0 */
  <= c && c <= 0x39
  /* 9 */
  ) {
    return c - 0x30;
  }
  /*eslint-disable no-bitwise*/


  lc = c | 0x20;

  if (0x61
  /* a */
  <= lc && lc <= 0x66
  /* f */
  ) {
    return lc - 0x61 + 10;
  }

  return -1;
}

function escapedHexLen(c) {
  if (c === 0x78
  /* x */
  ) {
      return 2;
    }

  if (c === 0x75
  /* u */
  ) {
      return 4;
    }

  if (c === 0x55
  /* U */
  ) {
      return 8;
    }

  return 0;
}

function fromDecimalCode(c) {
  if (0x30
  /* 0 */
  <= c && c <= 0x39
  /* 9 */
  ) {
    return c - 0x30;
  }

  return -1;
}

function simpleEscapeSequence(c) {
  /* eslint-disable indent */
  return c === 0x30
  /* 0 */
  ? '\x00' : c === 0x61
  /* a */
  ? '\x07' : c === 0x62
  /* b */
  ? '\x08' : c === 0x74
  /* t */
  ? '\x09' : c === 0x09
  /* Tab */
  ? '\x09' : c === 0x6E
  /* n */
  ? '\x0A' : c === 0x76
  /* v */
  ? '\x0B' : c === 0x66
  /* f */
  ? '\x0C' : c === 0x72
  /* r */
  ? '\x0D' : c === 0x65
  /* e */
  ? '\x1B' : c === 0x20
  /* Space */
  ? ' ' : c === 0x22
  /* " */
  ? '\x22' : c === 0x2F
  /* / */
  ? '/' : c === 0x5C
  /* \ */
  ? '\x5C' : c === 0x4E
  /* N */
  ? '\x85' : c === 0x5F
  /* _ */
  ? '\xA0' : c === 0x4C
  /* L */
  ? '\u2028' : c === 0x50
  /* P */
  ? '\u2029' : '';
}

function charFromCodepoint(c) {
  if (c <= 0xFFFF) {
    return String.fromCharCode(c);
  } // Encode UTF-16 surrogate pair
  // https://en.wikipedia.org/wiki/UTF-16#Code_points_U.2B010000_to_U.2B10FFFF


  return String.fromCharCode((c - 0x010000 >> 10) + 0xD800, (c - 0x010000 & 0x03FF) + 0xDC00);
}

var simpleEscapeCheck = new Array(256); // integer, for fast access

var simpleEscapeMap = new Array(256);

for (var i = 0; i < 256; i++) {
  simpleEscapeCheck[i] = simpleEscapeSequence(i) ? 1 : 0;
  simpleEscapeMap[i] = simpleEscapeSequence(i);
}

function State$1(input, options) {
  this.input = input;
  this.filename = options['filename'] || null;
  this.schema = options['schema'] || _default;
  this.onWarning = options['onWarning'] || null; // (Hidden) Remove? makes the loader to expect YAML 1.1 documents
  // if such documents have no explicit %YAML directive

  this.legacy = options['legacy'] || false;
  this.json = options['json'] || false;
  this.listener = options['listener'] || null;
  this.implicitTypes = this.schema.compiledImplicit;
  this.typeMap = this.schema.compiledTypeMap;
  this.length = input.length;
  this.position = 0;
  this.line = 0;
  this.lineStart = 0;
  this.lineIndent = 0; // position of first leading tab in the current line,
  // used to make sure there are no tabs in the indentation

  this.firstTabInLine = -1;
  this.documents = [];
  /*
  this.version;
  this.checkLineBreaks;
  this.tagMap;
  this.anchorMap;
  this.tag;
  this.anchor;
  this.kind;
  this.result;*/
}

function generateError(state, message) {
  var mark = {
    name: state.filename,
    buffer: state.input.slice(0, -1),
    // omit trailing \0
    position: state.position,
    line: state.line,
    column: state.position - state.lineStart
  };
  mark.snippet = snippet(mark);
  return new exception(message, mark);
}

function throwError(state, message) {
  throw generateError(state, message);
}

function throwWarning(state, message) {
  if (state.onWarning) {
    state.onWarning.call(null, generateError(state, message));
  }
}

var directiveHandlers = {
  YAML: function handleYamlDirective(state, name, args) {
    var match, major, minor;

    if (state.version !== null) {
      throwError(state, 'duplication of %YAML directive');
    }

    if (args.length !== 1) {
      throwError(state, 'YAML directive accepts exactly one argument');
    }

    match = /^([0-9]+)\.([0-9]+)$/.exec(args[0]);

    if (match === null) {
      throwError(state, 'ill-formed argument of the YAML directive');
    }

    major = parseInt(match[1], 10);
    minor = parseInt(match[2], 10);

    if (major !== 1) {
      throwError(state, 'unacceptable YAML version of the document');
    }

    state.version = args[0];
    state.checkLineBreaks = minor < 2;

    if (minor !== 1 && minor !== 2) {
      throwWarning(state, 'unsupported YAML version of the document');
    }
  },
  TAG: function handleTagDirective(state, name, args) {
    var handle, prefix;

    if (args.length !== 2) {
      throwError(state, 'TAG directive accepts exactly two arguments');
    }

    handle = args[0];
    prefix = args[1];

    if (!PATTERN_TAG_HANDLE.test(handle)) {
      throwError(state, 'ill-formed tag handle (first argument) of the TAG directive');
    }

    if (_hasOwnProperty$1.call(state.tagMap, handle)) {
      throwError(state, 'there is a previously declared suffix for "' + handle + '" tag handle');
    }

    if (!PATTERN_TAG_URI.test(prefix)) {
      throwError(state, 'ill-formed tag prefix (second argument) of the TAG directive');
    }

    try {
      prefix = decodeURIComponent(prefix);
    } catch (err) {
      throwError(state, 'tag prefix is malformed: ' + prefix);
    }

    state.tagMap[handle] = prefix;
  }
};

function captureSegment(state, start, end, checkJson) {
  var _position, _length, _character, _result;

  if (start < end) {
    _result = state.input.slice(start, end);

    if (checkJson) {
      for (_position = 0, _length = _result.length; _position < _length; _position += 1) {
        _character = _result.charCodeAt(_position);

        if (!(_character === 0x09 || 0x20 <= _character && _character <= 0x10FFFF)) {
          throwError(state, 'expected valid JSON character');
        }
      }
    } else if (PATTERN_NON_PRINTABLE.test(_result)) {
      throwError(state, 'the stream contains non-printable characters');
    }

    state.result += _result;
  }
}

function mergeMappings(state, destination, source, overridableKeys) {
  var sourceKeys, key, index, quantity;

  if (!common.isObject(source)) {
    throwError(state, 'cannot merge mappings; the provided source object is unacceptable');
  }

  sourceKeys = Object.keys(source);

  for (index = 0, quantity = sourceKeys.length; index < quantity; index += 1) {
    key = sourceKeys[index];

    if (!_hasOwnProperty$1.call(destination, key)) {
      destination[key] = source[key];
      overridableKeys[key] = true;
    }
  }
}

function storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, startLine, startLineStart, startPos) {
  var index, quantity; // The output is a plain object here, so keys can only be strings.
  // We need to convert keyNode to a string, but doing so can hang the process
  // (deeply nested arrays that explode exponentially using aliases).

  if (Array.isArray(keyNode)) {
    keyNode = Array.prototype.slice.call(keyNode);

    for (index = 0, quantity = keyNode.length; index < quantity; index += 1) {
      if (Array.isArray(keyNode[index])) {
        throwError(state, 'nested arrays are not supported inside keys');
      }

      if (typeof keyNode === 'object' && _class(keyNode[index]) === '[object Object]') {
        keyNode[index] = '[object Object]';
      }
    }
  } // Avoid code execution in load() via toString property
  // (still use its own toString for arrays, timestamps,
  // and whatever user schema extensions happen to have @@toStringTag)


  if (typeof keyNode === 'object' && _class(keyNode) === '[object Object]') {
    keyNode = '[object Object]';
  }

  keyNode = String(keyNode);

  if (_result === null) {
    _result = {};
  }

  if (keyTag === 'tag:yaml.org,2002:merge') {
    if (Array.isArray(valueNode)) {
      for (index = 0, quantity = valueNode.length; index < quantity; index += 1) {
        mergeMappings(state, _result, valueNode[index], overridableKeys);
      }
    } else {
      mergeMappings(state, _result, valueNode, overridableKeys);
    }
  } else {
    if (!state.json && !_hasOwnProperty$1.call(overridableKeys, keyNode) && _hasOwnProperty$1.call(_result, keyNode)) {
      state.line = startLine || state.line;
      state.lineStart = startLineStart || state.lineStart;
      state.position = startPos || state.position;
      throwError(state, 'duplicated mapping key');
    } // used for this specific key only because Object.defineProperty is slow


    if (keyNode === '__proto__') {
      Object.defineProperty(_result, keyNode, {
        configurable: true,
        enumerable: true,
        writable: true,
        value: valueNode
      });
    } else {
      _result[keyNode] = valueNode;
    }

    delete overridableKeys[keyNode];
  }

  return _result;
}

function readLineBreak(state) {
  var ch;
  ch = state.input.charCodeAt(state.position);

  if (ch === 0x0A
  /* LF */
  ) {
      state.position++;
    } else if (ch === 0x0D
  /* CR */
  ) {
      state.position++;

      if (state.input.charCodeAt(state.position) === 0x0A
      /* LF */
      ) {
          state.position++;
        }
    } else {
    throwError(state, 'a line break is expected');
  }

  state.line += 1;
  state.lineStart = state.position;
  state.firstTabInLine = -1;
}

function skipSeparationSpace(state, allowComments, checkIndent) {
  var lineBreaks = 0,
      ch = state.input.charCodeAt(state.position);

  while (ch !== 0) {
    while (is_WHITE_SPACE(ch)) {
      if (ch === 0x09
      /* Tab */
      && state.firstTabInLine === -1) {
        state.firstTabInLine = state.position;
      }

      ch = state.input.charCodeAt(++state.position);
    }

    if (allowComments && ch === 0x23
    /* # */
    ) {
        do {
          ch = state.input.charCodeAt(++state.position);
        } while (ch !== 0x0A
        /* LF */
        && ch !== 0x0D
        /* CR */
        && ch !== 0);
      }

    if (is_EOL(ch)) {
      readLineBreak(state);
      ch = state.input.charCodeAt(state.position);
      lineBreaks++;
      state.lineIndent = 0;

      while (ch === 0x20
      /* Space */
      ) {
        state.lineIndent++;
        ch = state.input.charCodeAt(++state.position);
      }
    } else {
      break;
    }
  }

  if (checkIndent !== -1 && lineBreaks !== 0 && state.lineIndent < checkIndent) {
    throwWarning(state, 'deficient indentation');
  }

  return lineBreaks;
}

function testDocumentSeparator(state) {
  var _position = state.position,
      ch;
  ch = state.input.charCodeAt(_position); // Condition state.position === state.lineStart is tested
  // in parent on each call, for efficiency. No needs to test here again.

  if ((ch === 0x2D
  /* - */
  || ch === 0x2E
  /* . */
  ) && ch === state.input.charCodeAt(_position + 1) && ch === state.input.charCodeAt(_position + 2)) {
    _position += 3;
    ch = state.input.charCodeAt(_position);

    if (ch === 0 || is_WS_OR_EOL(ch)) {
      return true;
    }
  }

  return false;
}

function writeFoldedLines(state, count) {
  if (count === 1) {
    state.result += ' ';
  } else if (count > 1) {
    state.result += common.repeat('\n', count - 1);
  }
}

function readPlainScalar(state, nodeIndent, withinFlowCollection) {
  var preceding,
      following,
      captureStart,
      captureEnd,
      hasPendingContent,
      _line,
      _lineStart,
      _lineIndent,
      _kind = state.kind,
      _result = state.result,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (is_WS_OR_EOL(ch) || is_FLOW_INDICATOR(ch) || ch === 0x23
  /* # */
  || ch === 0x26
  /* & */
  || ch === 0x2A
  /* * */
  || ch === 0x21
  /* ! */
  || ch === 0x7C
  /* | */
  || ch === 0x3E
  /* > */
  || ch === 0x27
  /* ' */
  || ch === 0x22
  /* " */
  || ch === 0x25
  /* % */
  || ch === 0x40
  /* @ */
  || ch === 0x60
  /* ` */
  ) {
      return false;
    }

  if (ch === 0x3F
  /* ? */
  || ch === 0x2D
  /* - */
  ) {
      following = state.input.charCodeAt(state.position + 1);

      if (is_WS_OR_EOL(following) || withinFlowCollection && is_FLOW_INDICATOR(following)) {
        return false;
      }
    }

  state.kind = 'scalar';
  state.result = '';
  captureStart = captureEnd = state.position;
  hasPendingContent = false;

  while (ch !== 0) {
    if (ch === 0x3A
    /* : */
    ) {
        following = state.input.charCodeAt(state.position + 1);

        if (is_WS_OR_EOL(following) || withinFlowCollection && is_FLOW_INDICATOR(following)) {
          break;
        }
      } else if (ch === 0x23
    /* # */
    ) {
        preceding = state.input.charCodeAt(state.position - 1);

        if (is_WS_OR_EOL(preceding)) {
          break;
        }
      } else if (state.position === state.lineStart && testDocumentSeparator(state) || withinFlowCollection && is_FLOW_INDICATOR(ch)) {
      break;
    } else if (is_EOL(ch)) {
      _line = state.line;
      _lineStart = state.lineStart;
      _lineIndent = state.lineIndent;
      skipSeparationSpace(state, false, -1);

      if (state.lineIndent >= nodeIndent) {
        hasPendingContent = true;
        ch = state.input.charCodeAt(state.position);
        continue;
      } else {
        state.position = captureEnd;
        state.line = _line;
        state.lineStart = _lineStart;
        state.lineIndent = _lineIndent;
        break;
      }
    }

    if (hasPendingContent) {
      captureSegment(state, captureStart, captureEnd, false);
      writeFoldedLines(state, state.line - _line);
      captureStart = captureEnd = state.position;
      hasPendingContent = false;
    }

    if (!is_WHITE_SPACE(ch)) {
      captureEnd = state.position + 1;
    }

    ch = state.input.charCodeAt(++state.position);
  }

  captureSegment(state, captureStart, captureEnd, false);

  if (state.result) {
    return true;
  }

  state.kind = _kind;
  state.result = _result;
  return false;
}

function readSingleQuotedScalar(state, nodeIndent) {
  var ch, captureStart, captureEnd;
  ch = state.input.charCodeAt(state.position);

  if (ch !== 0x27
  /* ' */
  ) {
      return false;
    }

  state.kind = 'scalar';
  state.result = '';
  state.position++;
  captureStart = captureEnd = state.position;

  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    if (ch === 0x27
    /* ' */
    ) {
        captureSegment(state, captureStart, state.position, true);
        ch = state.input.charCodeAt(++state.position);

        if (ch === 0x27
        /* ' */
        ) {
            captureStart = state.position;
            state.position++;
            captureEnd = state.position;
          } else {
          return true;
        }
      } else if (is_EOL(ch)) {
      captureSegment(state, captureStart, captureEnd, true);
      writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
      captureStart = captureEnd = state.position;
    } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
      throwError(state, 'unexpected end of the document within a single quoted scalar');
    } else {
      state.position++;
      captureEnd = state.position;
    }
  }

  throwError(state, 'unexpected end of the stream within a single quoted scalar');
}

function readDoubleQuotedScalar(state, nodeIndent) {
  var captureStart, captureEnd, hexLength, hexResult, tmp, ch;
  ch = state.input.charCodeAt(state.position);

  if (ch !== 0x22
  /* " */
  ) {
      return false;
    }

  state.kind = 'scalar';
  state.result = '';
  state.position++;
  captureStart = captureEnd = state.position;

  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    if (ch === 0x22
    /* " */
    ) {
        captureSegment(state, captureStart, state.position, true);
        state.position++;
        return true;
      } else if (ch === 0x5C
    /* \ */
    ) {
        captureSegment(state, captureStart, state.position, true);
        ch = state.input.charCodeAt(++state.position);

        if (is_EOL(ch)) {
          skipSeparationSpace(state, false, nodeIndent); // TODO: rework to inline fn with no type cast?
        } else if (ch < 256 && simpleEscapeCheck[ch]) {
          state.result += simpleEscapeMap[ch];
          state.position++;
        } else if ((tmp = escapedHexLen(ch)) > 0) {
          hexLength = tmp;
          hexResult = 0;

          for (; hexLength > 0; hexLength--) {
            ch = state.input.charCodeAt(++state.position);

            if ((tmp = fromHexCode(ch)) >= 0) {
              hexResult = (hexResult << 4) + tmp;
            } else {
              throwError(state, 'expected hexadecimal character');
            }
          }

          state.result += charFromCodepoint(hexResult);
          state.position++;
        } else {
          throwError(state, 'unknown escape sequence');
        }

        captureStart = captureEnd = state.position;
      } else if (is_EOL(ch)) {
      captureSegment(state, captureStart, captureEnd, true);
      writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
      captureStart = captureEnd = state.position;
    } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
      throwError(state, 'unexpected end of the document within a double quoted scalar');
    } else {
      state.position++;
      captureEnd = state.position;
    }
  }

  throwError(state, 'unexpected end of the stream within a double quoted scalar');
}

function readFlowCollection(state, nodeIndent) {
  var readNext = true,
      _line,
      _lineStart,
      _pos,
      _tag = state.tag,
      _result,
      _anchor = state.anchor,
      following,
      terminator,
      isPair,
      isExplicitPair,
      isMapping,
      overridableKeys = Object.create(null),
      keyNode,
      keyTag,
      valueNode,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (ch === 0x5B
  /* [ */
  ) {
      terminator = 0x5D;
      /* ] */

      isMapping = false;
      _result = [];
    } else if (ch === 0x7B
  /* { */
  ) {
      terminator = 0x7D;
      /* } */

      isMapping = true;
      _result = {};
    } else {
    return false;
  }

  if (state.anchor !== null) {
    state.anchorMap[state.anchor] = _result;
  }

  ch = state.input.charCodeAt(++state.position);

  while (ch !== 0) {
    skipSeparationSpace(state, true, nodeIndent);
    ch = state.input.charCodeAt(state.position);

    if (ch === terminator) {
      state.position++;
      state.tag = _tag;
      state.anchor = _anchor;
      state.kind = isMapping ? 'mapping' : 'sequence';
      state.result = _result;
      return true;
    } else if (!readNext) {
      throwError(state, 'missed comma between flow collection entries');
    } else if (ch === 0x2C
    /* , */
    ) {
        // "flow collection entries can never be completely empty", as per YAML 1.2, section 7.4
        throwError(state, "expected the node content, but found ','");
      }

    keyTag = keyNode = valueNode = null;
    isPair = isExplicitPair = false;

    if (ch === 0x3F
    /* ? */
    ) {
        following = state.input.charCodeAt(state.position + 1);

        if (is_WS_OR_EOL(following)) {
          isPair = isExplicitPair = true;
          state.position++;
          skipSeparationSpace(state, true, nodeIndent);
        }
      }

    _line = state.line; // Save the current line.

    _lineStart = state.lineStart;
    _pos = state.position;
    composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
    keyTag = state.tag;
    keyNode = state.result;
    skipSeparationSpace(state, true, nodeIndent);
    ch = state.input.charCodeAt(state.position);

    if ((isExplicitPair || state.line === _line) && ch === 0x3A
    /* : */
    ) {
        isPair = true;
        ch = state.input.charCodeAt(++state.position);
        skipSeparationSpace(state, true, nodeIndent);
        composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
        valueNode = state.result;
      }

    if (isMapping) {
      storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, _line, _lineStart, _pos);
    } else if (isPair) {
      _result.push(storeMappingPair(state, null, overridableKeys, keyTag, keyNode, valueNode, _line, _lineStart, _pos));
    } else {
      _result.push(keyNode);
    }

    skipSeparationSpace(state, true, nodeIndent);
    ch = state.input.charCodeAt(state.position);

    if (ch === 0x2C
    /* , */
    ) {
        readNext = true;
        ch = state.input.charCodeAt(++state.position);
      } else {
      readNext = false;
    }
  }

  throwError(state, 'unexpected end of the stream within a flow collection');
}

function readBlockScalar(state, nodeIndent) {
  var captureStart,
      folding,
      chomping = CHOMPING_CLIP,
      didReadContent = false,
      detectedIndent = false,
      textIndent = nodeIndent,
      emptyLines = 0,
      atMoreIndented = false,
      tmp,
      ch;
  ch = state.input.charCodeAt(state.position);

  if (ch === 0x7C
  /* | */
  ) {
      folding = false;
    } else if (ch === 0x3E
  /* > */
  ) {
      folding = true;
    } else {
    return false;
  }

  state.kind = 'scalar';
  state.result = '';

  while (ch !== 0) {
    ch = state.input.charCodeAt(++state.position);

    if (ch === 0x2B
    /* + */
    || ch === 0x2D
    /* - */
    ) {
        if (CHOMPING_CLIP === chomping) {
          chomping = ch === 0x2B
          /* + */
          ? CHOMPING_KEEP : CHOMPING_STRIP;
        } else {
          throwError(state, 'repeat of a chomping mode identifier');
        }
      } else if ((tmp = fromDecimalCode(ch)) >= 0) {
      if (tmp === 0) {
        throwError(state, 'bad explicit indentation width of a block scalar; it cannot be less than one');
      } else if (!detectedIndent) {
        textIndent = nodeIndent + tmp - 1;
        detectedIndent = true;
      } else {
        throwError(state, 'repeat of an indentation width identifier');
      }
    } else {
      break;
    }
  }

  if (is_WHITE_SPACE(ch)) {
    do {
      ch = state.input.charCodeAt(++state.position);
    } while (is_WHITE_SPACE(ch));

    if (ch === 0x23
    /* # */
    ) {
        do {
          ch = state.input.charCodeAt(++state.position);
        } while (!is_EOL(ch) && ch !== 0);
      }
  }

  while (ch !== 0) {
    readLineBreak(state);
    state.lineIndent = 0;
    ch = state.input.charCodeAt(state.position);

    while ((!detectedIndent || state.lineIndent < textIndent) && ch === 0x20
    /* Space */
    ) {
      state.lineIndent++;
      ch = state.input.charCodeAt(++state.position);
    }

    if (!detectedIndent && state.lineIndent > textIndent) {
      textIndent = state.lineIndent;
    }

    if (is_EOL(ch)) {
      emptyLines++;
      continue;
    } // End of the scalar.


    if (state.lineIndent < textIndent) {
      // Perform the chomping.
      if (chomping === CHOMPING_KEEP) {
        state.result += common.repeat('\n', didReadContent ? 1 + emptyLines : emptyLines);
      } else if (chomping === CHOMPING_CLIP) {
        if (didReadContent) {
          // i.e. only if the scalar is not empty.
          state.result += '\n';
        }
      } // Break this `while` cycle and go to the funciton's epilogue.


      break;
    } // Folded style: use fancy rules to handle line breaks.


    if (folding) {
      // Lines starting with white space characters (more-indented lines) are not folded.
      if (is_WHITE_SPACE(ch)) {
        atMoreIndented = true; // except for the first content line (cf. Example 8.1)

        state.result += common.repeat('\n', didReadContent ? 1 + emptyLines : emptyLines); // End of more-indented block.
      } else if (atMoreIndented) {
        atMoreIndented = false;
        state.result += common.repeat('\n', emptyLines + 1); // Just one line break - perceive as the same line.
      } else if (emptyLines === 0) {
        if (didReadContent) {
          // i.e. only if we have already read some scalar content.
          state.result += ' ';
        } // Several line breaks - perceive as different lines.

      } else {
        state.result += common.repeat('\n', emptyLines);
      } // Literal style: just add exact number of line breaks between content lines.

    } else {
      // Keep all line breaks except the header line break.
      state.result += common.repeat('\n', didReadContent ? 1 + emptyLines : emptyLines);
    }

    didReadContent = true;
    detectedIndent = true;
    emptyLines = 0;
    captureStart = state.position;

    while (!is_EOL(ch) && ch !== 0) {
      ch = state.input.charCodeAt(++state.position);
    }

    captureSegment(state, captureStart, state.position, false);
  }

  return true;
}

function readBlockSequence(state, nodeIndent) {
  var _line,
      _tag = state.tag,
      _anchor = state.anchor,
      _result = [],
      following,
      detected = false,
      ch; // there is a leading tab before this token, so it can't be a block sequence/mapping;
  // it can still be flow sequence/mapping or a scalar


  if (state.firstTabInLine !== -1) return false;

  if (state.anchor !== null) {
    state.anchorMap[state.anchor] = _result;
  }

  ch = state.input.charCodeAt(state.position);

  while (ch !== 0) {
    if (state.firstTabInLine !== -1) {
      state.position = state.firstTabInLine;
      throwError(state, 'tab characters must not be used in indentation');
    }

    if (ch !== 0x2D
    /* - */
    ) {
        break;
      }

    following = state.input.charCodeAt(state.position + 1);

    if (!is_WS_OR_EOL(following)) {
      break;
    }

    detected = true;
    state.position++;

    if (skipSeparationSpace(state, true, -1)) {
      if (state.lineIndent <= nodeIndent) {
        _result.push(null);

        ch = state.input.charCodeAt(state.position);
        continue;
      }
    }

    _line = state.line;
    composeNode(state, nodeIndent, CONTEXT_BLOCK_IN, false, true);

    _result.push(state.result);

    skipSeparationSpace(state, true, -1);
    ch = state.input.charCodeAt(state.position);

    if ((state.line === _line || state.lineIndent > nodeIndent) && ch !== 0) {
      throwError(state, 'bad indentation of a sequence entry');
    } else if (state.lineIndent < nodeIndent) {
      break;
    }
  }

  if (detected) {
    state.tag = _tag;
    state.anchor = _anchor;
    state.kind = 'sequence';
    state.result = _result;
    return true;
  }

  return false;
}

function readBlockMapping(state, nodeIndent, flowIndent) {
  var following,
      allowCompact,
      _line,
      _keyLine,
      _keyLineStart,
      _keyPos,
      _tag = state.tag,
      _anchor = state.anchor,
      _result = {},
      overridableKeys = Object.create(null),
      keyTag = null,
      keyNode = null,
      valueNode = null,
      atExplicitKey = false,
      detected = false,
      ch; // there is a leading tab before this token, so it can't be a block sequence/mapping;
  // it can still be flow sequence/mapping or a scalar


  if (state.firstTabInLine !== -1) return false;

  if (state.anchor !== null) {
    state.anchorMap[state.anchor] = _result;
  }

  ch = state.input.charCodeAt(state.position);

  while (ch !== 0) {
    if (!atExplicitKey && state.firstTabInLine !== -1) {
      state.position = state.firstTabInLine;
      throwError(state, 'tab characters must not be used in indentation');
    }

    following = state.input.charCodeAt(state.position + 1);
    _line = state.line; // Save the current line.
    //
    // Explicit notation case. There are two separate blocks:
    // first for the key (denoted by "?") and second for the value (denoted by ":")
    //

    if ((ch === 0x3F
    /* ? */
    || ch === 0x3A
    /* : */
    ) && is_WS_OR_EOL(following)) {
      if (ch === 0x3F
      /* ? */
      ) {
          if (atExplicitKey) {
            storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
            keyTag = keyNode = valueNode = null;
          }

          detected = true;
          atExplicitKey = true;
          allowCompact = true;
        } else if (atExplicitKey) {
        // i.e. 0x3A/* : */ === character after the explicit key.
        atExplicitKey = false;
        allowCompact = true;
      } else {
        throwError(state, 'incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line');
      }

      state.position += 1;
      ch = following; //
      // Implicit notation case. Flow-style node as the key first, then ":", and the value.
      //
    } else {
      _keyLine = state.line;
      _keyLineStart = state.lineStart;
      _keyPos = state.position;

      if (!composeNode(state, flowIndent, CONTEXT_FLOW_OUT, false, true)) {
        // Neither implicit nor explicit notation.
        // Reading is done. Go to the epilogue.
        break;
      }

      if (state.line === _line) {
        ch = state.input.charCodeAt(state.position);

        while (is_WHITE_SPACE(ch)) {
          ch = state.input.charCodeAt(++state.position);
        }

        if (ch === 0x3A
        /* : */
        ) {
            ch = state.input.charCodeAt(++state.position);

            if (!is_WS_OR_EOL(ch)) {
              throwError(state, 'a whitespace character is expected after the key-value separator within a block mapping');
            }

            if (atExplicitKey) {
              storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
              keyTag = keyNode = valueNode = null;
            }

            detected = true;
            atExplicitKey = false;
            allowCompact = false;
            keyTag = state.tag;
            keyNode = state.result;
          } else if (detected) {
          throwError(state, 'can not read an implicit mapping pair; a colon is missed');
        } else {
          state.tag = _tag;
          state.anchor = _anchor;
          return true; // Keep the result of `composeNode`.
        }
      } else if (detected) {
        throwError(state, 'can not read a block mapping entry; a multiline key may not be an implicit key');
      } else {
        state.tag = _tag;
        state.anchor = _anchor;
        return true; // Keep the result of `composeNode`.
      }
    } //
    // Common reading code for both explicit and implicit notations.
    //


    if (state.line === _line || state.lineIndent > nodeIndent) {
      if (atExplicitKey) {
        _keyLine = state.line;
        _keyLineStart = state.lineStart;
        _keyPos = state.position;
      }

      if (composeNode(state, nodeIndent, CONTEXT_BLOCK_OUT, true, allowCompact)) {
        if (atExplicitKey) {
          keyNode = state.result;
        } else {
          valueNode = state.result;
        }
      }

      if (!atExplicitKey) {
        storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, _keyLine, _keyLineStart, _keyPos);
        keyTag = keyNode = valueNode = null;
      }

      skipSeparationSpace(state, true, -1);
      ch = state.input.charCodeAt(state.position);
    }

    if ((state.line === _line || state.lineIndent > nodeIndent) && ch !== 0) {
      throwError(state, 'bad indentation of a mapping entry');
    } else if (state.lineIndent < nodeIndent) {
      break;
    }
  } //
  // Epilogue.
  //
  // Special case: last mapping's node contains only the key in explicit notation.


  if (atExplicitKey) {
    storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
  } // Expose the resulting mapping.


  if (detected) {
    state.tag = _tag;
    state.anchor = _anchor;
    state.kind = 'mapping';
    state.result = _result;
  }

  return detected;
}

function readTagProperty(state) {
  var _position,
      isVerbatim = false,
      isNamed = false,
      tagHandle,
      tagName,
      ch;

  ch = state.input.charCodeAt(state.position);
  if (ch !== 0x21
  /* ! */
  ) return false;

  if (state.tag !== null) {
    throwError(state, 'duplication of a tag property');
  }

  ch = state.input.charCodeAt(++state.position);

  if (ch === 0x3C
  /* < */
  ) {
      isVerbatim = true;
      ch = state.input.charCodeAt(++state.position);
    } else if (ch === 0x21
  /* ! */
  ) {
      isNamed = true;
      tagHandle = '!!';
      ch = state.input.charCodeAt(++state.position);
    } else {
    tagHandle = '!';
  }

  _position = state.position;

  if (isVerbatim) {
    do {
      ch = state.input.charCodeAt(++state.position);
    } while (ch !== 0 && ch !== 0x3E
    /* > */
    );

    if (state.position < state.length) {
      tagName = state.input.slice(_position, state.position);
      ch = state.input.charCodeAt(++state.position);
    } else {
      throwError(state, 'unexpected end of the stream within a verbatim tag');
    }
  } else {
    while (ch !== 0 && !is_WS_OR_EOL(ch)) {
      if (ch === 0x21
      /* ! */
      ) {
          if (!isNamed) {
            tagHandle = state.input.slice(_position - 1, state.position + 1);

            if (!PATTERN_TAG_HANDLE.test(tagHandle)) {
              throwError(state, 'named tag handle cannot contain such characters');
            }

            isNamed = true;
            _position = state.position + 1;
          } else {
            throwError(state, 'tag suffix cannot contain exclamation marks');
          }
        }

      ch = state.input.charCodeAt(++state.position);
    }

    tagName = state.input.slice(_position, state.position);

    if (PATTERN_FLOW_INDICATORS.test(tagName)) {
      throwError(state, 'tag suffix cannot contain flow indicator characters');
    }
  }

  if (tagName && !PATTERN_TAG_URI.test(tagName)) {
    throwError(state, 'tag name cannot contain such characters: ' + tagName);
  }

  try {
    tagName = decodeURIComponent(tagName);
  } catch (err) {
    throwError(state, 'tag name is malformed: ' + tagName);
  }

  if (isVerbatim) {
    state.tag = tagName;
  } else if (_hasOwnProperty$1.call(state.tagMap, tagHandle)) {
    state.tag = state.tagMap[tagHandle] + tagName;
  } else if (tagHandle === '!') {
    state.tag = '!' + tagName;
  } else if (tagHandle === '!!') {
    state.tag = 'tag:yaml.org,2002:' + tagName;
  } else {
    throwError(state, 'undeclared tag handle "' + tagHandle + '"');
  }

  return true;
}

function readAnchorProperty(state) {
  var _position, ch;

  ch = state.input.charCodeAt(state.position);
  if (ch !== 0x26
  /* & */
  ) return false;

  if (state.anchor !== null) {
    throwError(state, 'duplication of an anchor property');
  }

  ch = state.input.charCodeAt(++state.position);
  _position = state.position;

  while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
    ch = state.input.charCodeAt(++state.position);
  }

  if (state.position === _position) {
    throwError(state, 'name of an anchor node must contain at least one character');
  }

  state.anchor = state.input.slice(_position, state.position);
  return true;
}

function readAlias(state) {
  var _position, alias, ch;

  ch = state.input.charCodeAt(state.position);
  if (ch !== 0x2A
  /* * */
  ) return false;
  ch = state.input.charCodeAt(++state.position);
  _position = state.position;

  while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
    ch = state.input.charCodeAt(++state.position);
  }

  if (state.position === _position) {
    throwError(state, 'name of an alias node must contain at least one character');
  }

  alias = state.input.slice(_position, state.position);

  if (!_hasOwnProperty$1.call(state.anchorMap, alias)) {
    throwError(state, 'unidentified alias "' + alias + '"');
  }

  state.result = state.anchorMap[alias];
  skipSeparationSpace(state, true, -1);
  return true;
}

function composeNode(state, parentIndent, nodeContext, allowToSeek, allowCompact) {
  var allowBlockStyles,
      allowBlockScalars,
      allowBlockCollections,
      indentStatus = 1,
      // 1: this>parent, 0: this=parent, -1: this<parent
  atNewLine = false,
      hasContent = false,
      typeIndex,
      typeQuantity,
      typeList,
      type,
      flowIndent,
      blockIndent;

  if (state.listener !== null) {
    state.listener('open', state);
  }

  state.tag = null;
  state.anchor = null;
  state.kind = null;
  state.result = null;
  allowBlockStyles = allowBlockScalars = allowBlockCollections = CONTEXT_BLOCK_OUT === nodeContext || CONTEXT_BLOCK_IN === nodeContext;

  if (allowToSeek) {
    if (skipSeparationSpace(state, true, -1)) {
      atNewLine = true;

      if (state.lineIndent > parentIndent) {
        indentStatus = 1;
      } else if (state.lineIndent === parentIndent) {
        indentStatus = 0;
      } else if (state.lineIndent < parentIndent) {
        indentStatus = -1;
      }
    }
  }

  if (indentStatus === 1) {
    while (readTagProperty(state) || readAnchorProperty(state)) {
      if (skipSeparationSpace(state, true, -1)) {
        atNewLine = true;
        allowBlockCollections = allowBlockStyles;

        if (state.lineIndent > parentIndent) {
          indentStatus = 1;
        } else if (state.lineIndent === parentIndent) {
          indentStatus = 0;
        } else if (state.lineIndent < parentIndent) {
          indentStatus = -1;
        }
      } else {
        allowBlockCollections = false;
      }
    }
  }

  if (allowBlockCollections) {
    allowBlockCollections = atNewLine || allowCompact;
  }

  if (indentStatus === 1 || CONTEXT_BLOCK_OUT === nodeContext) {
    if (CONTEXT_FLOW_IN === nodeContext || CONTEXT_FLOW_OUT === nodeContext) {
      flowIndent = parentIndent;
    } else {
      flowIndent = parentIndent + 1;
    }

    blockIndent = state.position - state.lineStart;

    if (indentStatus === 1) {
      if (allowBlockCollections && (readBlockSequence(state, blockIndent) || readBlockMapping(state, blockIndent, flowIndent)) || readFlowCollection(state, flowIndent)) {
        hasContent = true;
      } else {
        if (allowBlockScalars && readBlockScalar(state, flowIndent) || readSingleQuotedScalar(state, flowIndent) || readDoubleQuotedScalar(state, flowIndent)) {
          hasContent = true;
        } else if (readAlias(state)) {
          hasContent = true;

          if (state.tag !== null || state.anchor !== null) {
            throwError(state, 'alias node should not have any properties');
          }
        } else if (readPlainScalar(state, flowIndent, CONTEXT_FLOW_IN === nodeContext)) {
          hasContent = true;

          if (state.tag === null) {
            state.tag = '?';
          }
        }

        if (state.anchor !== null) {
          state.anchorMap[state.anchor] = state.result;
        }
      }
    } else if (indentStatus === 0) {
      // Special case: block sequences are allowed to have same indentation level as the parent.
      // http://www.yaml.org/spec/1.2/spec.html#id2799784
      hasContent = allowBlockCollections && readBlockSequence(state, blockIndent);
    }
  }

  if (state.tag === null) {
    if (state.anchor !== null) {
      state.anchorMap[state.anchor] = state.result;
    }
  } else if (state.tag === '?') {
    // Implicit resolving is not allowed for non-scalar types, and '?'
    // non-specific tag is only automatically assigned to plain scalars.
    //
    // We only need to check kind conformity in case user explicitly assigns '?'
    // tag, for example like this: "!<?> [0]"
    //
    if (state.result !== null && state.kind !== 'scalar') {
      throwError(state, 'unacceptable node kind for !<?> tag; it should be "scalar", not "' + state.kind + '"');
    }

    for (typeIndex = 0, typeQuantity = state.implicitTypes.length; typeIndex < typeQuantity; typeIndex += 1) {
      type = state.implicitTypes[typeIndex];

      if (type.resolve(state.result)) {
        // `state.result` updated in resolver if matched
        state.result = type.construct(state.result);
        state.tag = type.tag;

        if (state.anchor !== null) {
          state.anchorMap[state.anchor] = state.result;
        }

        break;
      }
    }
  } else if (state.tag !== '!') {
    if (_hasOwnProperty$1.call(state.typeMap[state.kind || 'fallback'], state.tag)) {
      type = state.typeMap[state.kind || 'fallback'][state.tag];
    } else {
      // looking for multi type
      type = null;
      typeList = state.typeMap.multi[state.kind || 'fallback'];

      for (typeIndex = 0, typeQuantity = typeList.length; typeIndex < typeQuantity; typeIndex += 1) {
        if (state.tag.slice(0, typeList[typeIndex].tag.length) === typeList[typeIndex].tag) {
          type = typeList[typeIndex];
          break;
        }
      }
    }

    if (!type) {
      throwError(state, 'unknown tag !<' + state.tag + '>');
    }

    if (state.result !== null && type.kind !== state.kind) {
      throwError(state, 'unacceptable node kind for !<' + state.tag + '> tag; it should be "' + type.kind + '", not "' + state.kind + '"');
    }

    if (!type.resolve(state.result, state.tag)) {
      // `state.result` updated in resolver if matched
      throwError(state, 'cannot resolve a node with !<' + state.tag + '> explicit tag');
    } else {
      state.result = type.construct(state.result, state.tag);

      if (state.anchor !== null) {
        state.anchorMap[state.anchor] = state.result;
      }
    }
  }

  if (state.listener !== null) {
    state.listener('close', state);
  }

  return state.tag !== null || state.anchor !== null || hasContent;
}

function readDocument(state) {
  var documentStart = state.position,
      _position,
      directiveName,
      directiveArgs,
      hasDirectives = false,
      ch;

  state.version = null;
  state.checkLineBreaks = state.legacy;
  state.tagMap = Object.create(null);
  state.anchorMap = Object.create(null);

  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    skipSeparationSpace(state, true, -1);
    ch = state.input.charCodeAt(state.position);

    if (state.lineIndent > 0 || ch !== 0x25
    /* % */
    ) {
        break;
      }

    hasDirectives = true;
    ch = state.input.charCodeAt(++state.position);
    _position = state.position;

    while (ch !== 0 && !is_WS_OR_EOL(ch)) {
      ch = state.input.charCodeAt(++state.position);
    }

    directiveName = state.input.slice(_position, state.position);
    directiveArgs = [];

    if (directiveName.length < 1) {
      throwError(state, 'directive name must not be less than one character in length');
    }

    while (ch !== 0) {
      while (is_WHITE_SPACE(ch)) {
        ch = state.input.charCodeAt(++state.position);
      }

      if (ch === 0x23
      /* # */
      ) {
          do {
            ch = state.input.charCodeAt(++state.position);
          } while (ch !== 0 && !is_EOL(ch));

          break;
        }

      if (is_EOL(ch)) break;
      _position = state.position;

      while (ch !== 0 && !is_WS_OR_EOL(ch)) {
        ch = state.input.charCodeAt(++state.position);
      }

      directiveArgs.push(state.input.slice(_position, state.position));
    }

    if (ch !== 0) readLineBreak(state);

    if (_hasOwnProperty$1.call(directiveHandlers, directiveName)) {
      directiveHandlers[directiveName](state, directiveName, directiveArgs);
    } else {
      throwWarning(state, 'unknown document directive "' + directiveName + '"');
    }
  }

  skipSeparationSpace(state, true, -1);

  if (state.lineIndent === 0 && state.input.charCodeAt(state.position) === 0x2D
  /* - */
  && state.input.charCodeAt(state.position + 1) === 0x2D
  /* - */
  && state.input.charCodeAt(state.position + 2) === 0x2D
  /* - */
  ) {
      state.position += 3;
      skipSeparationSpace(state, true, -1);
    } else if (hasDirectives) {
    throwError(state, 'directives end mark is expected');
  }

  composeNode(state, state.lineIndent - 1, CONTEXT_BLOCK_OUT, false, true);
  skipSeparationSpace(state, true, -1);

  if (state.checkLineBreaks && PATTERN_NON_ASCII_LINE_BREAKS.test(state.input.slice(documentStart, state.position))) {
    throwWarning(state, 'non-ASCII line breaks are interpreted as content');
  }

  state.documents.push(state.result);

  if (state.position === state.lineStart && testDocumentSeparator(state)) {
    if (state.input.charCodeAt(state.position) === 0x2E
    /* . */
    ) {
        state.position += 3;
        skipSeparationSpace(state, true, -1);
      }

    return;
  }

  if (state.position < state.length - 1) {
    throwError(state, 'end of the stream or a document separator is expected');
  } else {
    return;
  }
}

function loadDocuments(input, options) {
  input = String(input);
  options = options || {};

  if (input.length !== 0) {
    // Add tailing `\n` if not exists
    if (input.charCodeAt(input.length - 1) !== 0x0A
    /* LF */
    && input.charCodeAt(input.length - 1) !== 0x0D
    /* CR */
    ) {
        input += '\n';
      } // Strip BOM


    if (input.charCodeAt(0) === 0xFEFF) {
      input = input.slice(1);
    }
  }

  var state = new State$1(input, options);
  var nullpos = input.indexOf('\0');

  if (nullpos !== -1) {
    state.position = nullpos;
    throwError(state, 'null byte is not allowed in input');
  } // Use 0 as string terminator. That significantly simplifies bounds check.


  state.input += '\0';

  while (state.input.charCodeAt(state.position) === 0x20
  /* Space */
  ) {
    state.lineIndent += 1;
    state.position += 1;
  }

  while (state.position < state.length - 1) {
    readDocument(state);
  }

  return state.documents;
}

function loadAll$1(input, iterator, options) {
  if (iterator !== null && typeof iterator === 'object' && typeof options === 'undefined') {
    options = iterator;
    iterator = null;
  }

  var documents = loadDocuments(input, options);

  if (typeof iterator !== 'function') {
    return documents;
  }

  for (var index = 0, length = documents.length; index < length; index += 1) {
    iterator(documents[index]);
  }
}

function load$1(input, options) {
  var documents = loadDocuments(input, options);

  if (documents.length === 0) {
    /*eslint-disable no-undefined*/
    return undefined;
  } else if (documents.length === 1) {
    return documents[0];
  }

  throw new exception('expected a single document in the stream, but found more');
}

var loadAll_1 = loadAll$1;
var load_1 = load$1;
var loader = {
  loadAll: loadAll_1,
  load: load_1
};
/*eslint-disable no-use-before-define*/

var _toString = Object.prototype.toString;
var _hasOwnProperty = Object.prototype.hasOwnProperty;
var CHAR_BOM = 0xFEFF;
var CHAR_TAB = 0x09;
/* Tab */

var CHAR_LINE_FEED = 0x0A;
/* LF */

var CHAR_CARRIAGE_RETURN = 0x0D;
/* CR */

var CHAR_SPACE = 0x20;
/* Space */

var CHAR_EXCLAMATION = 0x21;
/* ! */

var CHAR_DOUBLE_QUOTE = 0x22;
/* " */

var CHAR_SHARP = 0x23;
/* # */

var CHAR_PERCENT = 0x25;
/* % */

var CHAR_AMPERSAND = 0x26;
/* & */

var CHAR_SINGLE_QUOTE = 0x27;
/* ' */

var CHAR_ASTERISK = 0x2A;
/* * */

var CHAR_COMMA = 0x2C;
/* , */

var CHAR_MINUS = 0x2D;
/* - */

var CHAR_COLON = 0x3A;
/* : */

var CHAR_EQUALS = 0x3D;
/* = */

var CHAR_GREATER_THAN = 0x3E;
/* > */

var CHAR_QUESTION = 0x3F;
/* ? */

var CHAR_COMMERCIAL_AT = 0x40;
/* @ */

var CHAR_LEFT_SQUARE_BRACKET = 0x5B;
/* [ */

var CHAR_RIGHT_SQUARE_BRACKET = 0x5D;
/* ] */

var CHAR_GRAVE_ACCENT = 0x60;
/* ` */

var CHAR_LEFT_CURLY_BRACKET = 0x7B;
/* { */

var CHAR_VERTICAL_LINE = 0x7C;
/* | */

var CHAR_RIGHT_CURLY_BRACKET = 0x7D;
/* } */

var ESCAPE_SEQUENCES = {};
ESCAPE_SEQUENCES[0x00] = '\\0';
ESCAPE_SEQUENCES[0x07] = '\\a';
ESCAPE_SEQUENCES[0x08] = '\\b';
ESCAPE_SEQUENCES[0x09] = '\\t';
ESCAPE_SEQUENCES[0x0A] = '\\n';
ESCAPE_SEQUENCES[0x0B] = '\\v';
ESCAPE_SEQUENCES[0x0C] = '\\f';
ESCAPE_SEQUENCES[0x0D] = '\\r';
ESCAPE_SEQUENCES[0x1B] = '\\e';
ESCAPE_SEQUENCES[0x22] = '\\"';
ESCAPE_SEQUENCES[0x5C] = '\\\\';
ESCAPE_SEQUENCES[0x85] = '\\N';
ESCAPE_SEQUENCES[0xA0] = '\\_';
ESCAPE_SEQUENCES[0x2028] = '\\L';
ESCAPE_SEQUENCES[0x2029] = '\\P';
var DEPRECATED_BOOLEANS_SYNTAX = ['y', 'Y', 'yes', 'Yes', 'YES', 'on', 'On', 'ON', 'n', 'N', 'no', 'No', 'NO', 'off', 'Off', 'OFF'];
var DEPRECATED_BASE60_SYNTAX = /^[-+]?[0-9_]+(?::[0-9_]+)+(?:\.[0-9_]*)?$/;

function compileStyleMap(schema, map) {
  var result, keys, index, length, tag, style, type;
  if (map === null) return {};
  result = {};
  keys = Object.keys(map);

  for (index = 0, length = keys.length; index < length; index += 1) {
    tag = keys[index];
    style = String(map[tag]);

    if (tag.slice(0, 2) === '!!') {
      tag = 'tag:yaml.org,2002:' + tag.slice(2);
    }

    type = schema.compiledTypeMap['fallback'][tag];

    if (type && _hasOwnProperty.call(type.styleAliases, style)) {
      style = type.styleAliases[style];
    }

    result[tag] = style;
  }

  return result;
}

function encodeHex(character) {
  var string, handle, length;
  string = character.toString(16).toUpperCase();

  if (character <= 0xFF) {
    handle = 'x';
    length = 2;
  } else if (character <= 0xFFFF) {
    handle = 'u';
    length = 4;
  } else if (character <= 0xFFFFFFFF) {
    handle = 'U';
    length = 8;
  } else {
    throw new exception('code point within a string may not be greater than 0xFFFFFFFF');
  }

  return '\\' + handle + common.repeat('0', length - string.length) + string;
}

var QUOTING_TYPE_SINGLE = 1,
    QUOTING_TYPE_DOUBLE = 2;

function State(options) {
  this.schema = options['schema'] || _default;
  this.indent = Math.max(1, options['indent'] || 2);
  this.noArrayIndent = options['noArrayIndent'] || false;
  this.skipInvalid = options['skipInvalid'] || false;
  this.flowLevel = common.isNothing(options['flowLevel']) ? -1 : options['flowLevel'];
  this.styleMap = compileStyleMap(this.schema, options['styles'] || null);
  this.sortKeys = options['sortKeys'] || false;
  this.lineWidth = options['lineWidth'] || 80;
  this.noRefs = options['noRefs'] || false;
  this.noCompatMode = options['noCompatMode'] || false;
  this.condenseFlow = options['condenseFlow'] || false;
  this.quotingType = options['quotingType'] === '"' ? QUOTING_TYPE_DOUBLE : QUOTING_TYPE_SINGLE;
  this.forceQuotes = options['forceQuotes'] || false;
  this.replacer = typeof options['replacer'] === 'function' ? options['replacer'] : null;
  this.implicitTypes = this.schema.compiledImplicit;
  this.explicitTypes = this.schema.compiledExplicit;
  this.tag = null;
  this.result = '';
  this.duplicates = [];
  this.usedDuplicates = null;
} // Indents every line in a string. Empty lines (\n only) are not indented.


function indentString(string, spaces) {
  var ind = common.repeat(' ', spaces),
      position = 0,
      next = -1,
      result = '',
      line,
      length = string.length;

  while (position < length) {
    next = string.indexOf('\n', position);

    if (next === -1) {
      line = string.slice(position);
      position = length;
    } else {
      line = string.slice(position, next + 1);
      position = next + 1;
    }

    if (line.length && line !== '\n') result += ind;
    result += line;
  }

  return result;
}

function generateNextLine(state, level) {
  return '\n' + common.repeat(' ', state.indent * level);
}

function testImplicitResolving(state, str) {
  var index, length, type;

  for (index = 0, length = state.implicitTypes.length; index < length; index += 1) {
    type = state.implicitTypes[index];

    if (type.resolve(str)) {
      return true;
    }
  }

  return false;
} // [33] s-white ::= s-space | s-tab


function isWhitespace(c) {
  return c === CHAR_SPACE || c === CHAR_TAB;
} // Returns true if the character can be printed without escaping.
// From YAML 1.2: "any allowed characters known to be non-printable
// should also be escaped. [However,] This isn’t mandatory"
// Derived from nb-char - \t - #x85 - #xA0 - #x2028 - #x2029.


function isPrintable(c) {
  return 0x00020 <= c && c <= 0x00007E || 0x000A1 <= c && c <= 0x00D7FF && c !== 0x2028 && c !== 0x2029 || 0x0E000 <= c && c <= 0x00FFFD && c !== CHAR_BOM || 0x10000 <= c && c <= 0x10FFFF;
} // [34] ns-char ::= nb-char - s-white
// [27] nb-char ::= c-printable - b-char - c-byte-order-mark
// [26] b-char  ::= b-line-feed | b-carriage-return
// Including s-white (for some reason, examples doesn't match specs in this aspect)
// ns-char ::= c-printable - b-line-feed - b-carriage-return - c-byte-order-mark


function isNsCharOrWhitespace(c) {
  return isPrintable(c) && c !== CHAR_BOM // - b-char
  && c !== CHAR_CARRIAGE_RETURN && c !== CHAR_LINE_FEED;
} // [127]  ns-plain-safe(c) ::= c = flow-out  ⇒ ns-plain-safe-out
//                             c = flow-in   ⇒ ns-plain-safe-in
//                             c = block-key ⇒ ns-plain-safe-out
//                             c = flow-key  ⇒ ns-plain-safe-in
// [128] ns-plain-safe-out ::= ns-char
// [129]  ns-plain-safe-in ::= ns-char - c-flow-indicator
// [130]  ns-plain-char(c) ::=  ( ns-plain-safe(c) - “:” - “#” )
//                            | ( /* An ns-char preceding */ “#” )
//                            | ( “:” /* Followed by an ns-plain-safe(c) */ )


function isPlainSafe(c, prev, inblock) {
  var cIsNsCharOrWhitespace = isNsCharOrWhitespace(c);
  var cIsNsChar = cIsNsCharOrWhitespace && !isWhitespace(c);
  return ( // ns-plain-safe
  inblock ? // c = flow-in
  cIsNsCharOrWhitespace : cIsNsCharOrWhitespace // - c-flow-indicator
  && c !== CHAR_COMMA && c !== CHAR_LEFT_SQUARE_BRACKET && c !== CHAR_RIGHT_SQUARE_BRACKET && c !== CHAR_LEFT_CURLY_BRACKET && c !== CHAR_RIGHT_CURLY_BRACKET) && // ns-plain-char
  c !== CHAR_SHARP // false on '#'
  && !(prev === CHAR_COLON && !cIsNsChar) // false on ': '
  || isNsCharOrWhitespace(prev) && !isWhitespace(prev) && c === CHAR_SHARP // change to true on '[^ ]#'
  || prev === CHAR_COLON && cIsNsChar; // change to true on ':[^ ]'
} // Simplified test for values allowed as the first character in plain style.


function isPlainSafeFirst(c) {
  // Uses a subset of ns-char - c-indicator
  // where ns-char = nb-char - s-white.
  // No support of ( ( “?” | “:” | “-” ) /* Followed by an ns-plain-safe(c)) */ ) part
  return isPrintable(c) && c !== CHAR_BOM && !isWhitespace(c) // - s-white
  // - (c-indicator ::=
  // “-” | “?” | “:” | “,” | “[” | “]” | “{” | “}”
  && c !== CHAR_MINUS && c !== CHAR_QUESTION && c !== CHAR_COLON && c !== CHAR_COMMA && c !== CHAR_LEFT_SQUARE_BRACKET && c !== CHAR_RIGHT_SQUARE_BRACKET && c !== CHAR_LEFT_CURLY_BRACKET && c !== CHAR_RIGHT_CURLY_BRACKET // | “#” | “&” | “*” | “!” | “|” | “=” | “>” | “'” | “"”
  && c !== CHAR_SHARP && c !== CHAR_AMPERSAND && c !== CHAR_ASTERISK && c !== CHAR_EXCLAMATION && c !== CHAR_VERTICAL_LINE && c !== CHAR_EQUALS && c !== CHAR_GREATER_THAN && c !== CHAR_SINGLE_QUOTE && c !== CHAR_DOUBLE_QUOTE // | “%” | “@” | “`”)
  && c !== CHAR_PERCENT && c !== CHAR_COMMERCIAL_AT && c !== CHAR_GRAVE_ACCENT;
} // Simplified test for values allowed as the last character in plain style.


function isPlainSafeLast(c) {
  // just not whitespace or colon, it will be checked to be plain character later
  return !isWhitespace(c) && c !== CHAR_COLON;
} // Same as 'string'.codePointAt(pos), but works in older browsers.


function codePointAt(string, pos) {
  var first = string.charCodeAt(pos),
      second;

  if (first >= 0xD800 && first <= 0xDBFF && pos + 1 < string.length) {
    second = string.charCodeAt(pos + 1);

    if (second >= 0xDC00 && second <= 0xDFFF) {
      // https://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
      return (first - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
    }
  }

  return first;
} // Determines whether block indentation indicator is required.


function needIndentIndicator(string) {
  var leadingSpaceRe = /^\n* /;
  return leadingSpaceRe.test(string);
}

var STYLE_PLAIN = 1,
    STYLE_SINGLE = 2,
    STYLE_LITERAL = 3,
    STYLE_FOLDED = 4,
    STYLE_DOUBLE = 5; // Determines which scalar styles are possible and returns the preferred style.
// lineWidth = -1 => no limit.
// Pre-conditions: str.length > 0.
// Post-conditions:
//    STYLE_PLAIN or STYLE_SINGLE => no \n are in the string.
//    STYLE_LITERAL => no lines are suitable for folding (or lineWidth is -1).
//    STYLE_FOLDED => a line > lineWidth and can be folded (and lineWidth != -1).

function chooseScalarStyle(string, singleLineOnly, indentPerLevel, lineWidth, testAmbiguousType, quotingType, forceQuotes, inblock) {
  var i;
  var char = 0;
  var prevChar = null;
  var hasLineBreak = false;
  var hasFoldableLine = false; // only checked if shouldTrackWidth

  var shouldTrackWidth = lineWidth !== -1;
  var previousLineBreak = -1; // count the first line correctly

  var plain = isPlainSafeFirst(codePointAt(string, 0)) && isPlainSafeLast(codePointAt(string, string.length - 1));

  if (singleLineOnly || forceQuotes) {
    // Case: no block styles.
    // Check for disallowed characters to rule out plain and single.
    for (i = 0; i < string.length; char >= 0x10000 ? i += 2 : i++) {
      char = codePointAt(string, i);

      if (!isPrintable(char)) {
        return STYLE_DOUBLE;
      }

      plain = plain && isPlainSafe(char, prevChar, inblock);
      prevChar = char;
    }
  } else {
    // Case: block styles permitted.
    for (i = 0; i < string.length; char >= 0x10000 ? i += 2 : i++) {
      char = codePointAt(string, i);

      if (char === CHAR_LINE_FEED) {
        hasLineBreak = true; // Check if any line can be folded.

        if (shouldTrackWidth) {
          hasFoldableLine = hasFoldableLine || // Foldable line = too long, and not more-indented.
          i - previousLineBreak - 1 > lineWidth && string[previousLineBreak + 1] !== ' ';
          previousLineBreak = i;
        }
      } else if (!isPrintable(char)) {
        return STYLE_DOUBLE;
      }

      plain = plain && isPlainSafe(char, prevChar, inblock);
      prevChar = char;
    } // in case the end is missing a \n


    hasFoldableLine = hasFoldableLine || shouldTrackWidth && i - previousLineBreak - 1 > lineWidth && string[previousLineBreak + 1] !== ' ';
  } // Although every style can represent \n without escaping, prefer block styles
  // for multiline, since they're more readable and they don't add empty lines.
  // Also prefer folding a super-long line.


  if (!hasLineBreak && !hasFoldableLine) {
    // Strings interpretable as another type have to be quoted;
    // e.g. the string 'true' vs. the boolean true.
    if (plain && !forceQuotes && !testAmbiguousType(string)) {
      return STYLE_PLAIN;
    }

    return quotingType === QUOTING_TYPE_DOUBLE ? STYLE_DOUBLE : STYLE_SINGLE;
  } // Edge case: block indentation indicator can only have one digit.


  if (indentPerLevel > 9 && needIndentIndicator(string)) {
    return STYLE_DOUBLE;
  } // At this point we know block styles are valid.
  // Prefer literal style unless we want to fold.


  if (!forceQuotes) {
    return hasFoldableLine ? STYLE_FOLDED : STYLE_LITERAL;
  }

  return quotingType === QUOTING_TYPE_DOUBLE ? STYLE_DOUBLE : STYLE_SINGLE;
} // Note: line breaking/folding is implemented for only the folded style.
// NB. We drop the last trailing newline (if any) of a returned block scalar
//  since the dumper adds its own newline. This always works:
//    • No ending newline => unaffected; already using strip "-" chomping.
//    • Ending newline    => removed then restored.
//  Importantly, this keeps the "+" chomp indicator from gaining an extra line.


function writeScalar(state, string, level, iskey, inblock) {
  state.dump = function () {
    if (string.length === 0) {
      return state.quotingType === QUOTING_TYPE_DOUBLE ? '""' : "''";
    }

    if (!state.noCompatMode) {
      if (DEPRECATED_BOOLEANS_SYNTAX.indexOf(string) !== -1 || DEPRECATED_BASE60_SYNTAX.test(string)) {
        return state.quotingType === QUOTING_TYPE_DOUBLE ? '"' + string + '"' : "'" + string + "'";
      }
    }

    var indent = state.indent * Math.max(1, level); // no 0-indent scalars
    // As indentation gets deeper, let the width decrease monotonically
    // to the lower bound min(state.lineWidth, 40).
    // Note that this implies
    //  state.lineWidth ≤ 40 + state.indent: width is fixed at the lower bound.
    //  state.lineWidth > 40 + state.indent: width decreases until the lower bound.
    // This behaves better than a constant minimum width which disallows narrower options,
    // or an indent threshold which causes the width to suddenly increase.

    var lineWidth = state.lineWidth === -1 ? -1 : Math.max(Math.min(state.lineWidth, 40), state.lineWidth - indent); // Without knowing if keys are implicit/explicit, assume implicit for safety.

    var singleLineOnly = iskey // No block styles in flow mode.
    || state.flowLevel > -1 && level >= state.flowLevel;

    function testAmbiguity(string) {
      return testImplicitResolving(state, string);
    }

    switch (chooseScalarStyle(string, singleLineOnly, state.indent, lineWidth, testAmbiguity, state.quotingType, state.forceQuotes && !iskey, inblock)) {
      case STYLE_PLAIN:
        return string;

      case STYLE_SINGLE:
        return "'" + string.replace(/'/g, "''") + "'";

      case STYLE_LITERAL:
        return '|' + blockHeader(string, state.indent) + dropEndingNewline(indentString(string, indent));

      case STYLE_FOLDED:
        return '>' + blockHeader(string, state.indent) + dropEndingNewline(indentString(foldString(string, lineWidth), indent));

      case STYLE_DOUBLE:
        return '"' + escapeString(string) + '"';

      default:
        throw new exception('impossible error: invalid scalar style');
    }
  }();
} // Pre-conditions: string is valid for a block scalar, 1 <= indentPerLevel <= 9.


function blockHeader(string, indentPerLevel) {
  var indentIndicator = needIndentIndicator(string) ? String(indentPerLevel) : ''; // note the special case: the string '\n' counts as a "trailing" empty line.

  var clip = string[string.length - 1] === '\n';
  var keep = clip && (string[string.length - 2] === '\n' || string === '\n');
  var chomp = keep ? '+' : clip ? '' : '-';
  return indentIndicator + chomp + '\n';
} // (See the note for writeScalar.)


function dropEndingNewline(string) {
  return string[string.length - 1] === '\n' ? string.slice(0, -1) : string;
} // Note: a long line without a suitable break point will exceed the width limit.
// Pre-conditions: every char in str isPrintable, str.length > 0, width > 0.


function foldString(string, width) {
  // In folded style, $k$ consecutive newlines output as $k+1$ newlines—
  // unless they're before or after a more-indented line, or at the very
  // beginning or end, in which case $k$ maps to $k$.
  // Therefore, parse each chunk as newline(s) followed by a content line.
  var lineRe = /(\n+)([^\n]*)/g; // first line (possibly an empty line)

  var result = function () {
    var nextLF = string.indexOf('\n');
    nextLF = nextLF !== -1 ? nextLF : string.length;
    lineRe.lastIndex = nextLF;
    return foldLine(string.slice(0, nextLF), width);
  }(); // If we haven't reached the first content line yet, don't add an extra \n.


  var prevMoreIndented = string[0] === '\n' || string[0] === ' ';
  var moreIndented; // rest of the lines

  var match;

  while (match = lineRe.exec(string)) {
    var prefix = match[1],
        line = match[2];
    moreIndented = line[0] === ' ';
    result += prefix + (!prevMoreIndented && !moreIndented && line !== '' ? '\n' : '') + foldLine(line, width);
    prevMoreIndented = moreIndented;
  }

  return result;
} // Greedy line breaking.
// Picks the longest line under the limit each time,
// otherwise settles for the shortest line over the limit.
// NB. More-indented lines *cannot* be folded, as that would add an extra \n.


function foldLine(line, width) {
  if (line === '' || line[0] === ' ') return line; // Since a more-indented line adds a \n, breaks can't be followed by a space.

  var breakRe = / [^ ]/g; // note: the match index will always be <= length-2.

  var match; // start is an inclusive index. end, curr, and next are exclusive.

  var start = 0,
      end,
      curr = 0,
      next = 0;
  var result = ''; // Invariants: 0 <= start <= length-1.
  //   0 <= curr <= next <= max(0, length-2). curr - start <= width.
  // Inside the loop:
  //   A match implies length >= 2, so curr and next are <= length-2.

  while (match = breakRe.exec(line)) {
    next = match.index; // maintain invariant: curr - start <= width

    if (next - start > width) {
      end = curr > start ? curr : next; // derive end <= length-2

      result += '\n' + line.slice(start, end); // skip the space that was output as \n

      start = end + 1; // derive start <= length-1
    }

    curr = next;
  } // By the invariants, start <= length-1, so there is something left over.
  // It is either the whole string or a part starting from non-whitespace.


  result += '\n'; // Insert a break if the remainder is too long and there is a break available.

  if (line.length - start > width && curr > start) {
    result += line.slice(start, curr) + '\n' + line.slice(curr + 1);
  } else {
    result += line.slice(start);
  }

  return result.slice(1); // drop extra \n joiner
} // Escapes a double-quoted string.


function escapeString(string) {
  var result = '';
  var char = 0;
  var escapeSeq;

  for (var i = 0; i < string.length; char >= 0x10000 ? i += 2 : i++) {
    char = codePointAt(string, i);
    escapeSeq = ESCAPE_SEQUENCES[char];

    if (!escapeSeq && isPrintable(char)) {
      result += string[i];
      if (char >= 0x10000) result += string[i + 1];
    } else {
      result += escapeSeq || encodeHex(char);
    }
  }

  return result;
}

function writeFlowSequence(state, level, object) {
  var _result = '',
      _tag = state.tag,
      index,
      length,
      value;

  for (index = 0, length = object.length; index < length; index += 1) {
    value = object[index];

    if (state.replacer) {
      value = state.replacer.call(object, String(index), value);
    } // Write only valid elements, put null instead of invalid elements.


    if (writeNode(state, level, value, false, false) || typeof value === 'undefined' && writeNode(state, level, null, false, false)) {
      if (_result !== '') _result += ',' + (!state.condenseFlow ? ' ' : '');
      _result += state.dump;
    }
  }

  state.tag = _tag;
  state.dump = '[' + _result + ']';
}

function writeBlockSequence(state, level, object, compact) {
  var _result = '',
      _tag = state.tag,
      index,
      length,
      value;

  for (index = 0, length = object.length; index < length; index += 1) {
    value = object[index];

    if (state.replacer) {
      value = state.replacer.call(object, String(index), value);
    } // Write only valid elements, put null instead of invalid elements.


    if (writeNode(state, level + 1, value, true, true, false, true) || typeof value === 'undefined' && writeNode(state, level + 1, null, true, true, false, true)) {
      if (!compact || _result !== '') {
        _result += generateNextLine(state, level);
      }

      if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
        _result += '-';
      } else {
        _result += '- ';
      }

      _result += state.dump;
    }
  }

  state.tag = _tag;
  state.dump = _result || '[]'; // Empty sequence if no valid values.
}

function writeFlowMapping(state, level, object) {
  var _result = '',
      _tag = state.tag,
      objectKeyList = Object.keys(object),
      index,
      length,
      objectKey,
      objectValue,
      pairBuffer;

  for (index = 0, length = objectKeyList.length; index < length; index += 1) {
    pairBuffer = '';
    if (_result !== '') pairBuffer += ', ';
    if (state.condenseFlow) pairBuffer += '"';
    objectKey = objectKeyList[index];
    objectValue = object[objectKey];

    if (state.replacer) {
      objectValue = state.replacer.call(object, objectKey, objectValue);
    }

    if (!writeNode(state, level, objectKey, false, false)) {
      continue; // Skip this pair because of invalid key;
    }

    if (state.dump.length > 1024) pairBuffer += '? ';
    pairBuffer += state.dump + (state.condenseFlow ? '"' : '') + ':' + (state.condenseFlow ? '' : ' ');

    if (!writeNode(state, level, objectValue, false, false)) {
      continue; // Skip this pair because of invalid value.
    }

    pairBuffer += state.dump; // Both key and value are valid.

    _result += pairBuffer;
  }

  state.tag = _tag;
  state.dump = '{' + _result + '}';
}

function writeBlockMapping(state, level, object, compact) {
  var _result = '',
      _tag = state.tag,
      objectKeyList = Object.keys(object),
      index,
      length,
      objectKey,
      objectValue,
      explicitPair,
      pairBuffer; // Allow sorting keys so that the output file is deterministic

  if (state.sortKeys === true) {
    // Default sorting
    objectKeyList.sort();
  } else if (typeof state.sortKeys === 'function') {
    // Custom sort function
    objectKeyList.sort(state.sortKeys);
  } else if (state.sortKeys) {
    // Something is wrong
    throw new exception('sortKeys must be a boolean or a function');
  }

  for (index = 0, length = objectKeyList.length; index < length; index += 1) {
    pairBuffer = '';

    if (!compact || _result !== '') {
      pairBuffer += generateNextLine(state, level);
    }

    objectKey = objectKeyList[index];
    objectValue = object[objectKey];

    if (state.replacer) {
      objectValue = state.replacer.call(object, objectKey, objectValue);
    }

    if (!writeNode(state, level + 1, objectKey, true, true, true)) {
      continue; // Skip this pair because of invalid key.
    }

    explicitPair = state.tag !== null && state.tag !== '?' || state.dump && state.dump.length > 1024;

    if (explicitPair) {
      if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
        pairBuffer += '?';
      } else {
        pairBuffer += '? ';
      }
    }

    pairBuffer += state.dump;

    if (explicitPair) {
      pairBuffer += generateNextLine(state, level);
    }

    if (!writeNode(state, level + 1, objectValue, true, explicitPair)) {
      continue; // Skip this pair because of invalid value.
    }

    if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
      pairBuffer += ':';
    } else {
      pairBuffer += ': ';
    }

    pairBuffer += state.dump; // Both key and value are valid.

    _result += pairBuffer;
  }

  state.tag = _tag;
  state.dump = _result || '{}'; // Empty mapping if no valid pairs.
}

function detectType(state, object, explicit) {
  var _result, typeList, index, length, type, style;

  typeList = explicit ? state.explicitTypes : state.implicitTypes;

  for (index = 0, length = typeList.length; index < length; index += 1) {
    type = typeList[index];

    if ((type.instanceOf || type.predicate) && (!type.instanceOf || typeof object === 'object' && object instanceof type.instanceOf) && (!type.predicate || type.predicate(object))) {
      if (explicit) {
        if (type.multi && type.representName) {
          state.tag = type.representName(object);
        } else {
          state.tag = type.tag;
        }
      } else {
        state.tag = '?';
      }

      if (type.represent) {
        style = state.styleMap[type.tag] || type.defaultStyle;

        if (_toString.call(type.represent) === '[object Function]') {
          _result = type.represent(object, style);
        } else if (_hasOwnProperty.call(type.represent, style)) {
          _result = type.represent[style](object, style);
        } else {
          throw new exception('!<' + type.tag + '> tag resolver accepts not "' + style + '" style');
        }

        state.dump = _result;
      }

      return true;
    }
  }

  return false;
} // Serializes `object` and writes it to global `result`.
// Returns true on success, or false on invalid object.
//


function writeNode(state, level, object, block, compact, iskey, isblockseq) {
  state.tag = null;
  state.dump = object;

  if (!detectType(state, object, false)) {
    detectType(state, object, true);
  }

  var type = _toString.call(state.dump);

  var inblock = block;
  var tagStr;

  if (block) {
    block = state.flowLevel < 0 || state.flowLevel > level;
  }

  var objectOrArray = type === '[object Object]' || type === '[object Array]',
      duplicateIndex,
      duplicate;

  if (objectOrArray) {
    duplicateIndex = state.duplicates.indexOf(object);
    duplicate = duplicateIndex !== -1;
  }

  if (state.tag !== null && state.tag !== '?' || duplicate || state.indent !== 2 && level > 0) {
    compact = false;
  }

  if (duplicate && state.usedDuplicates[duplicateIndex]) {
    state.dump = '*ref_' + duplicateIndex;
  } else {
    if (objectOrArray && duplicate && !state.usedDuplicates[duplicateIndex]) {
      state.usedDuplicates[duplicateIndex] = true;
    }

    if (type === '[object Object]') {
      if (block && Object.keys(state.dump).length !== 0) {
        writeBlockMapping(state, level, state.dump, compact);

        if (duplicate) {
          state.dump = '&ref_' + duplicateIndex + state.dump;
        }
      } else {
        writeFlowMapping(state, level, state.dump);

        if (duplicate) {
          state.dump = '&ref_' + duplicateIndex + ' ' + state.dump;
        }
      }
    } else if (type === '[object Array]') {
      if (block && state.dump.length !== 0) {
        if (state.noArrayIndent && !isblockseq && level > 0) {
          writeBlockSequence(state, level - 1, state.dump, compact);
        } else {
          writeBlockSequence(state, level, state.dump, compact);
        }

        if (duplicate) {
          state.dump = '&ref_' + duplicateIndex + state.dump;
        }
      } else {
        writeFlowSequence(state, level, state.dump);

        if (duplicate) {
          state.dump = '&ref_' + duplicateIndex + ' ' + state.dump;
        }
      }
    } else if (type === '[object String]') {
      if (state.tag !== '?') {
        writeScalar(state, state.dump, level, iskey, inblock);
      }
    } else if (type === '[object Undefined]') {
      return false;
    } else {
      if (state.skipInvalid) return false;
      throw new exception('unacceptable kind of an object to dump ' + type);
    }

    if (state.tag !== null && state.tag !== '?') {
      // Need to encode all characters except those allowed by the spec:
      //
      // [35] ns-dec-digit    ::=  [#x30-#x39] /* 0-9 */
      // [36] ns-hex-digit    ::=  ns-dec-digit
      //                         | [#x41-#x46] /* A-F */ | [#x61-#x66] /* a-f */
      // [37] ns-ascii-letter ::=  [#x41-#x5A] /* A-Z */ | [#x61-#x7A] /* a-z */
      // [38] ns-word-char    ::=  ns-dec-digit | ns-ascii-letter | “-”
      // [39] ns-uri-char     ::=  “%” ns-hex-digit ns-hex-digit | ns-word-char | “#”
      //                         | “;” | “/” | “?” | “:” | “@” | “&” | “=” | “+” | “$” | “,”
      //                         | “_” | “.” | “!” | “~” | “*” | “'” | “(” | “)” | “[” | “]”
      //
      // Also need to encode '!' because it has special meaning (end of tag prefix).
      //
      tagStr = encodeURI(state.tag[0] === '!' ? state.tag.slice(1) : state.tag).replace(/!/g, '%21');

      if (state.tag[0] === '!') {
        tagStr = '!' + tagStr;
      } else if (tagStr.slice(0, 18) === 'tag:yaml.org,2002:') {
        tagStr = '!!' + tagStr.slice(18);
      } else {
        tagStr = '!<' + tagStr + '>';
      }

      state.dump = tagStr + ' ' + state.dump;
    }
  }

  return true;
}

function getDuplicateReferences(object, state) {
  var objects = [],
      duplicatesIndexes = [],
      index,
      length;
  inspectNode(object, objects, duplicatesIndexes);

  for (index = 0, length = duplicatesIndexes.length; index < length; index += 1) {
    state.duplicates.push(objects[duplicatesIndexes[index]]);
  }

  state.usedDuplicates = new Array(length);
}

function inspectNode(object, objects, duplicatesIndexes) {
  var objectKeyList, index, length;

  if (object !== null && typeof object === 'object') {
    index = objects.indexOf(object);

    if (index !== -1) {
      if (duplicatesIndexes.indexOf(index) === -1) {
        duplicatesIndexes.push(index);
      }
    } else {
      objects.push(object);

      if (Array.isArray(object)) {
        for (index = 0, length = object.length; index < length; index += 1) {
          inspectNode(object[index], objects, duplicatesIndexes);
        }
      } else {
        objectKeyList = Object.keys(object);

        for (index = 0, length = objectKeyList.length; index < length; index += 1) {
          inspectNode(object[objectKeyList[index]], objects, duplicatesIndexes);
        }
      }
    }
  }
}

function dump$1(input, options) {
  options = options || {};
  var state = new State(options);
  if (!state.noRefs) getDuplicateReferences(input, state);
  var value = input;

  if (state.replacer) {
    value = state.replacer.call({
      '': value
    }, '', value);
  }

  if (writeNode(state, 0, value, true, true)) return state.dump + '\n';
  return '';
}

var dump_1 = dump$1;
var dumper = {
  dump: dump_1
};

function renamed(from, to) {
  return function () {
    throw new Error('Function yaml.' + from + ' is removed in js-yaml 4. ' + 'Use yaml.' + to + ' instead, which is now safe by default.');
  };
}

var Type = type;
exports.Type = Type;
var Schema = schema;
exports.Schema = Schema;
var FAILSAFE_SCHEMA = failsafe;
exports.FAILSAFE_SCHEMA = FAILSAFE_SCHEMA;
var JSON_SCHEMA = json;
exports.JSON_SCHEMA = JSON_SCHEMA;
var CORE_SCHEMA = core;
exports.CORE_SCHEMA = CORE_SCHEMA;
var DEFAULT_SCHEMA = _default;
exports.DEFAULT_SCHEMA = DEFAULT_SCHEMA;
var load = loader.load;
exports.load = load;
var loadAll = loader.loadAll;
exports.loadAll = loadAll;
var dump = dumper.dump;
exports.dump = dump;
var YAMLException = exception; // Re-export all types in case user wants to create custom schema

exports.YAMLException = YAMLException;
var types = {
  binary: binary,
  float: float,
  map: map,
  null: _null,
  pairs: pairs,
  set: set,
  timestamp: timestamp,
  bool: bool,
  int: int,
  merge: merge,
  omap: omap,
  seq: seq,
  str: str
}; // Removed functions from JS-YAML 3.0.x

exports.types = types;
var safeLoad = renamed('safeLoad', 'load');
exports.safeLoad = safeLoad;
var safeLoadAll = renamed('safeLoadAll', 'loadAll');
exports.safeLoadAll = safeLoadAll;
var safeDump = renamed('safeDump', 'dump');
exports.safeDump = safeDump;
var jsYaml = {
  Type: Type,
  Schema: Schema,
  FAILSAFE_SCHEMA: FAILSAFE_SCHEMA,
  JSON_SCHEMA: JSON_SCHEMA,
  CORE_SCHEMA: CORE_SCHEMA,
  DEFAULT_SCHEMA: DEFAULT_SCHEMA,
  load: load,
  loadAll: loadAll,
  dump: dump,
  YAMLException: YAMLException,
  types: types,
  safeLoad: safeLoad,
  safeLoadAll: safeLoadAll,
  safeDump: safeDump
};
var _default2 = jsYaml;
exports.default = _default2;
},{}],"build/ps.js":[function(require,module,exports) {
var global = arguments[3];
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr && (typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]); if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

// Generated by purs bundle 0.14.0
var PS = {};

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Control.Alt"] = $PS["Control.Alt"] || {};
  var exports = $PS["Control.Alt"];

  var Alt = function Alt(Functor0, alt) {
    this.Functor0 = Functor0;
    this.alt = alt;
  };

  var alt = function alt(dict) {
    return dict.alt;
  };

  exports["Alt"] = Alt;
  exports["alt"] = alt;
})(PS);

(function (exports) {
  "use strict";

  exports.arrayApply = function (fs) {
    return function (xs) {
      var l = fs.length;
      var k = xs.length;
      var result = new Array(l * k);
      var n = 0;

      for (var i = 0; i < l; i++) {
        var f = fs[i];

        for (var j = 0; j < k; j++) {
          result[n++] = f(xs[j]);
        }
      }

      return result;
    };
  };
})(PS["Control.Apply"] = PS["Control.Apply"] || {});

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Control.Semigroupoid"] = $PS["Control.Semigroupoid"] || {};
  var exports = $PS["Control.Semigroupoid"];

  var Semigroupoid = function Semigroupoid(compose) {
    this.compose = compose;
  };

  var semigroupoidFn = new Semigroupoid(function (f) {
    return function (g) {
      return function (x) {
        return f(g(x));
      };
    };
  });

  var compose = function compose(dict) {
    return dict.compose;
  };

  exports["compose"] = compose;
  exports["semigroupoidFn"] = semigroupoidFn;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Control.Category"] = $PS["Control.Category"] || {};
  var exports = $PS["Control.Category"];
  var Control_Semigroupoid = $PS["Control.Semigroupoid"];

  var Category = function Category(Semigroupoid0, identity) {
    this.Semigroupoid0 = Semigroupoid0;
    this.identity = identity;
  };

  var identity = function identity(dict) {
    return dict.identity;
  };

  var categoryFn = new Category(function () {
    return Control_Semigroupoid.semigroupoidFn;
  }, function (x) {
    return x;
  });
  exports["identity"] = identity;
  exports["categoryFn"] = categoryFn;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Data.Function"] = $PS["Data.Function"] || {};
  var exports = $PS["Data.Function"];

  var flip = function flip(f) {
    return function (b) {
      return function (a) {
        return f(a)(b);
      };
    };
  };

  var $$const = function $$const(a) {
    return function (v) {
      return a;
    };
  };

  var applyFlipped = function applyFlipped(x) {
    return function (f) {
      return f(x);
    };
  };

  exports["flip"] = flip;
  exports["const"] = $$const;
  exports["applyFlipped"] = applyFlipped;
})(PS);

(function (exports) {
  "use strict";

  exports.arrayMap = function (f) {
    return function (arr) {
      var l = arr.length;
      var result = new Array(l);

      for (var i = 0; i < l; i++) {
        result[i] = f(arr[i]);
      }

      return result;
    };
  };
})(PS["Data.Functor"] = PS["Data.Functor"] || {});

(function (exports) {
  "use strict";

  exports.unit = {};
})(PS["Data.Unit"] = PS["Data.Unit"] || {});

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Data.Unit"] = $PS["Data.Unit"] || {};
  var exports = $PS["Data.Unit"];
  var $foreign = $PS["Data.Unit"];
  exports["unit"] = $foreign.unit;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Data.Functor"] = $PS["Data.Functor"] || {};
  var exports = $PS["Data.Functor"];
  var $foreign = $PS["Data.Functor"];
  var Control_Semigroupoid = $PS["Control.Semigroupoid"];
  var Data_Function = $PS["Data.Function"];
  var Data_Unit = $PS["Data.Unit"];

  var Functor = function Functor(map) {
    this.map = map;
  };

  var map = function map(dict) {
    return dict.map;
  };

  var mapFlipped = function mapFlipped(dictFunctor) {
    return function (fa) {
      return function (f) {
        return map(dictFunctor)(f)(fa);
      };
    };
  };

  var $$void = function $$void(dictFunctor) {
    return map(dictFunctor)(Data_Function["const"](Data_Unit.unit));
  };

  var voidLeft = function voidLeft(dictFunctor) {
    return function (f) {
      return function (x) {
        return map(dictFunctor)(Data_Function["const"](x))(f);
      };
    };
  };

  var voidRight = function voidRight(dictFunctor) {
    return function (x) {
      return map(dictFunctor)(Data_Function["const"](x));
    };
  };

  var functorFn = new Functor(Control_Semigroupoid.compose(Control_Semigroupoid.semigroupoidFn));
  var functorArray = new Functor($foreign.arrayMap);
  exports["Functor"] = Functor;
  exports["map"] = map;
  exports["mapFlipped"] = mapFlipped;
  exports["void"] = $$void;
  exports["voidRight"] = voidRight;
  exports["voidLeft"] = voidLeft;
  exports["functorFn"] = functorFn;
  exports["functorArray"] = functorArray;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Control.Apply"] = $PS["Control.Apply"] || {};
  var exports = $PS["Control.Apply"];
  var $foreign = $PS["Control.Apply"];
  var Control_Category = $PS["Control.Category"];
  var Data_Function = $PS["Data.Function"];
  var Data_Functor = $PS["Data.Functor"];

  var Apply = function Apply(Functor0, apply) {
    this.Functor0 = Functor0;
    this.apply = apply;
  };

  var applyFn = new Apply(function () {
    return Data_Functor.functorFn;
  }, function (f) {
    return function (g) {
      return function (x) {
        return f(x)(g(x));
      };
    };
  });
  var applyArray = new Apply(function () {
    return Data_Functor.functorArray;
  }, $foreign.arrayApply);

  var apply = function apply(dict) {
    return dict.apply;
  };

  var applyFirst = function applyFirst(dictApply) {
    return function (a) {
      return function (b) {
        return apply(dictApply)(Data_Functor.map(dictApply.Functor0())(Data_Function["const"])(a))(b);
      };
    };
  };

  var applySecond = function applySecond(dictApply) {
    return function (a) {
      return function (b) {
        return apply(dictApply)(Data_Functor.map(dictApply.Functor0())(Data_Function["const"](Control_Category.identity(Control_Category.categoryFn)))(a))(b);
      };
    };
  };

  exports["Apply"] = Apply;
  exports["apply"] = apply;
  exports["applyFirst"] = applyFirst;
  exports["applySecond"] = applySecond;
  exports["applyFn"] = applyFn;
  exports["applyArray"] = applyArray;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Control.Applicative"] = $PS["Control.Applicative"] || {};
  var exports = $PS["Control.Applicative"];
  var Control_Apply = $PS["Control.Apply"];
  var Data_Unit = $PS["Data.Unit"];

  var Applicative = function Applicative(Apply0, pure) {
    this.Apply0 = Apply0;
    this.pure = pure;
  };

  var pure = function pure(dict) {
    return dict.pure;
  };

  var unless = function unless(dictApplicative) {
    return function (v) {
      return function (v1) {
        if (!v) {
          return v1;
        }

        ;

        if (v) {
          return pure(dictApplicative)(Data_Unit.unit);
        }

        ;
        throw new Error("Failed pattern match at Control.Applicative (line 66, column 1 - line 66, column 65): " + [v.constructor.name, v1.constructor.name]);
      };
    };
  };

  var when = function when(dictApplicative) {
    return function (v) {
      return function (v1) {
        if (v) {
          return v1;
        }

        ;

        if (!v) {
          return pure(dictApplicative)(Data_Unit.unit);
        }

        ;
        throw new Error("Failed pattern match at Control.Applicative (line 61, column 1 - line 61, column 63): " + [v.constructor.name, v1.constructor.name]);
      };
    };
  };

  var liftA1 = function liftA1(dictApplicative) {
    return function (f) {
      return function (a) {
        return Control_Apply.apply(dictApplicative.Apply0())(pure(dictApplicative)(f))(a);
      };
    };
  };

  exports["Applicative"] = Applicative;
  exports["pure"] = pure;
  exports["liftA1"] = liftA1;
  exports["unless"] = unless;
  exports["when"] = when;
})(PS);

(function (exports) {
  "use strict";

  exports.arrayBind = function (arr) {
    return function (f) {
      var result = [];

      for (var i = 0, l = arr.length; i < l; i++) {
        Array.prototype.push.apply(result, f(arr[i]));
      }

      return result;
    };
  };
})(PS["Control.Bind"] = PS["Control.Bind"] || {});

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Control.Bind"] = $PS["Control.Bind"] || {};
  var exports = $PS["Control.Bind"];
  var $foreign = $PS["Control.Bind"];
  var Control_Apply = $PS["Control.Apply"];
  var Control_Category = $PS["Control.Category"];
  var Data_Function = $PS["Data.Function"];

  var Bind = function Bind(Apply0, bind) {
    this.Apply0 = Apply0;
    this.bind = bind;
  };

  var Discard = function Discard(discard) {
    this.discard = discard;
  };

  var discard = function discard(dict) {
    return dict.discard;
  };

  var bindArray = new Bind(function () {
    return Control_Apply.applyArray;
  }, $foreign.arrayBind);

  var bind = function bind(dict) {
    return dict.bind;
  };

  var bindFlipped = function bindFlipped(dictBind) {
    return Data_Function.flip(bind(dictBind));
  };

  var composeKleisliFlipped = function composeKleisliFlipped(dictBind) {
    return function (f) {
      return function (g) {
        return function (a) {
          return bindFlipped(dictBind)(f)(g(a));
        };
      };
    };
  };

  var discardUnit = new Discard(function (dictBind) {
    return bind(dictBind);
  });

  var join = function join(dictBind) {
    return function (m) {
      return bind(dictBind)(m)(Control_Category.identity(Control_Category.categoryFn));
    };
  };

  exports["Bind"] = Bind;
  exports["bind"] = bind;
  exports["bindFlipped"] = bindFlipped;
  exports["discard"] = discard;
  exports["join"] = join;
  exports["composeKleisliFlipped"] = composeKleisliFlipped;
  exports["bindArray"] = bindArray;
  exports["discardUnit"] = discardUnit;
})(PS);

(function (exports) {
  "use strict";

  var refEq = function refEq(r1) {
    return function (r2) {
      return r1 === r2;
    };
  };

  exports.eqBooleanImpl = refEq;
  exports.eqIntImpl = refEq;
  exports.eqStringImpl = refEq;
})(PS["Data.Eq"] = PS["Data.Eq"] || {});

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Data.Eq"] = $PS["Data.Eq"] || {};
  var exports = $PS["Data.Eq"];
  var $foreign = $PS["Data.Eq"];

  var Eq = function Eq(eq) {
    this.eq = eq;
  };

  var eqString = new Eq($foreign.eqStringImpl);
  var eqInt = new Eq($foreign.eqIntImpl);
  var eqBoolean = new Eq($foreign.eqBooleanImpl);

  var eq = function eq(dict) {
    return dict.eq;
  };

  var notEq = function notEq(dictEq) {
    return function (x) {
      return function (y) {
        return eq(eqBoolean)(eq(dictEq)(x)(y))(false);
      };
    };
  };

  exports["Eq"] = Eq;
  exports["eq"] = eq;
  exports["notEq"] = notEq;
  exports["eqInt"] = eqInt;
  exports["eqString"] = eqString;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Data.Maybe"] = $PS["Data.Maybe"] || {};
  var exports = $PS["Data.Maybe"];
  var Control_Alt = $PS["Control.Alt"];
  var Control_Applicative = $PS["Control.Applicative"];
  var Control_Apply = $PS["Control.Apply"];
  var Control_Bind = $PS["Control.Bind"];
  var Control_Category = $PS["Control.Category"];
  var Data_Eq = $PS["Data.Eq"];
  var Data_Function = $PS["Data.Function"];
  var Data_Functor = $PS["Data.Functor"];

  var Nothing = function () {
    function Nothing() {}

    ;
    Nothing.value = new Nothing();
    return Nothing;
  }();

  var Just = function () {
    function Just(value0) {
      this.value0 = value0;
    }

    ;

    Just.create = function (value0) {
      return new Just(value0);
    };

    return Just;
  }();

  var maybe = function maybe(v) {
    return function (v1) {
      return function (v2) {
        if (v2 instanceof Nothing) {
          return v;
        }

        ;

        if (v2 instanceof Just) {
          return v1(v2.value0);
        }

        ;
        throw new Error("Failed pattern match at Data.Maybe (line 230, column 1 - line 230, column 51): " + [v.constructor.name, v1.constructor.name, v2.constructor.name]);
      };
    };
  };

  var isNothing = maybe(true)(Data_Function["const"](false));
  var isJust = maybe(false)(Data_Function["const"](true));
  var functorMaybe = new Data_Functor.Functor(function (v) {
    return function (v1) {
      if (v1 instanceof Just) {
        return new Just(v(v1.value0));
      }

      ;
      return Nothing.value;
    };
  });

  var fromMaybe = function fromMaybe(a) {
    return maybe(a)(Control_Category.identity(Control_Category.categoryFn));
  };

  var fromJust = function fromJust(dictPartial) {
    return function (v) {
      if (v instanceof Just) {
        return v.value0;
      }

      ;
      throw new Error("Failed pattern match at Data.Maybe (line 281, column 1 - line 281, column 46): " + [v.constructor.name]);
    };
  };

  var eqMaybe = function eqMaybe(dictEq) {
    return new Data_Eq.Eq(function (x) {
      return function (y) {
        if (x instanceof Nothing && y instanceof Nothing) {
          return true;
        }

        ;

        if (x instanceof Just && y instanceof Just) {
          return Data_Eq.eq(dictEq)(x.value0)(y.value0);
        }

        ;
        return false;
      };
    });
  };

  var applyMaybe = new Control_Apply.Apply(function () {
    return functorMaybe;
  }, function (v) {
    return function (v1) {
      if (v instanceof Just) {
        return Data_Functor.map(functorMaybe)(v.value0)(v1);
      }

      ;

      if (v instanceof Nothing) {
        return Nothing.value;
      }

      ;
      throw new Error("Failed pattern match at Data.Maybe (line 68, column 1 - line 70, column 30): " + [v.constructor.name, v1.constructor.name]);
    };
  });
  var bindMaybe = new Control_Bind.Bind(function () {
    return applyMaybe;
  }, function (v) {
    return function (v1) {
      if (v instanceof Just) {
        return v1(v.value0);
      }

      ;

      if (v instanceof Nothing) {
        return Nothing.value;
      }

      ;
      throw new Error("Failed pattern match at Data.Maybe (line 126, column 1 - line 128, column 28): " + [v.constructor.name, v1.constructor.name]);
    };
  });
  var applicativeMaybe = new Control_Applicative.Applicative(function () {
    return applyMaybe;
  }, Just.create);
  var altMaybe = new Control_Alt.Alt(function () {
    return functorMaybe;
  }, function (v) {
    return function (v1) {
      if (v instanceof Nothing) {
        return v1;
      }

      ;
      return v;
    };
  });
  exports["Nothing"] = Nothing;
  exports["Just"] = Just;
  exports["maybe"] = maybe;
  exports["fromMaybe"] = fromMaybe;
  exports["isJust"] = isJust;
  exports["isNothing"] = isNothing;
  exports["fromJust"] = fromJust;
  exports["functorMaybe"] = functorMaybe;
  exports["applicativeMaybe"] = applicativeMaybe;
  exports["altMaybe"] = altMaybe;
  exports["bindMaybe"] = bindMaybe;
  exports["eqMaybe"] = eqMaybe;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Data.Either"] = $PS["Data.Either"] || {};
  var exports = $PS["Data.Either"];
  var Control_Applicative = $PS["Control.Applicative"];
  var Control_Apply = $PS["Control.Apply"];
  var Control_Bind = $PS["Control.Bind"];
  var Data_Function = $PS["Data.Function"];
  var Data_Functor = $PS["Data.Functor"];
  var Data_Maybe = $PS["Data.Maybe"];

  var Left = function () {
    function Left(value0) {
      this.value0 = value0;
    }

    ;

    Left.create = function (value0) {
      return new Left(value0);
    };

    return Left;
  }();

  var Right = function () {
    function Right(value0) {
      this.value0 = value0;
    }

    ;

    Right.create = function (value0) {
      return new Right(value0);
    };

    return Right;
  }();

  var note = function note(a) {
    return Data_Maybe.maybe(new Left(a))(Right.create);
  };

  var functorEither = new Data_Functor.Functor(function (f) {
    return function (m) {
      if (m instanceof Left) {
        return new Left(m.value0);
      }

      ;

      if (m instanceof Right) {
        return new Right(f(m.value0));
      }

      ;
      throw new Error("Failed pattern match at Data.Either (line 31, column 1 - line 31, column 52): " + [m.constructor.name]);
    };
  });

  var fromLeft = function fromLeft(v) {
    return function (v1) {
      if (v1 instanceof Left) {
        return v1.value0;
      }

      ;
      return v;
    };
  };

  var either = function either(v) {
    return function (v1) {
      return function (v2) {
        if (v2 instanceof Left) {
          return v(v2.value0);
        }

        ;

        if (v2 instanceof Right) {
          return v1(v2.value0);
        }

        ;
        throw new Error("Failed pattern match at Data.Either (line 208, column 1 - line 208, column 64): " + [v.constructor.name, v1.constructor.name, v2.constructor.name]);
      };
    };
  };

  var hush = either(Data_Function["const"](Data_Maybe.Nothing.value))(Data_Maybe.Just.create);
  var isLeft = either(Data_Function["const"](true))(Data_Function["const"](false));
  var applyEither = new Control_Apply.Apply(function () {
    return functorEither;
  }, function (v) {
    return function (v1) {
      if (v instanceof Left) {
        return new Left(v.value0);
      }

      ;

      if (v instanceof Right) {
        return Data_Functor.map(functorEither)(v.value0)(v1);
      }

      ;
      throw new Error("Failed pattern match at Data.Either (line 70, column 1 - line 72, column 30): " + [v.constructor.name, v1.constructor.name]);
    };
  });
  var bindEither = new Control_Bind.Bind(function () {
    return applyEither;
  }, either(function (e) {
    return function (v) {
      return new Left(e);
    };
  })(function (a) {
    return function (f) {
      return f(a);
    };
  }));
  var applicativeEither = new Control_Applicative.Applicative(function () {
    return applyEither;
  }, Right.create);
  exports["Left"] = Left;
  exports["Right"] = Right;
  exports["either"] = either;
  exports["isLeft"] = isLeft;
  exports["fromLeft"] = fromLeft;
  exports["note"] = note;
  exports["hush"] = hush;
  exports["functorEither"] = functorEither;
  exports["applicativeEither"] = applicativeEither;
  exports["bindEither"] = bindEither;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Control.Plus"] = $PS["Control.Plus"] || {};
  var exports = $PS["Control.Plus"];

  var Plus = function Plus(Alt0, empty) {
    this.Alt0 = Alt0;
    this.empty = empty;
  };

  var empty = function empty(dict) {
    return dict.empty;
  };

  exports["Plus"] = Plus;
  exports["empty"] = empty;
})(PS);

(function (exports) {
  "use strict";

  exports.foldrArray = function (f) {
    return function (init) {
      return function (xs) {
        var acc = init;
        var len = xs.length;

        for (var i = len - 1; i >= 0; i--) {
          acc = f(xs[i])(acc);
        }

        return acc;
      };
    };
  };

  exports.foldlArray = function (f) {
    return function (init) {
      return function (xs) {
        var acc = init;
        var len = xs.length;

        for (var i = 0; i < len; i++) {
          acc = f(acc)(xs[i]);
        }

        return acc;
      };
    };
  };
})(PS["Data.Foldable"] = PS["Data.Foldable"] || {});

(function (exports) {
  "use strict";

  exports.boolConj = function (b1) {
    return function (b2) {
      return b1 && b2;
    };
  };

  exports.boolDisj = function (b1) {
    return function (b2) {
      return b1 || b2;
    };
  };

  exports.boolNot = function (b) {
    return !b;
  };
})(PS["Data.HeytingAlgebra"] = PS["Data.HeytingAlgebra"] || {});

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Data.HeytingAlgebra"] = $PS["Data.HeytingAlgebra"] || {};
  var exports = $PS["Data.HeytingAlgebra"];
  var $foreign = $PS["Data.HeytingAlgebra"];

  var HeytingAlgebra = function HeytingAlgebra(conj, disj, ff, implies, not, tt) {
    this.conj = conj;
    this.disj = disj;
    this.ff = ff;
    this.implies = implies;
    this.not = not;
    this.tt = tt;
  };

  var tt = function tt(dict) {
    return dict.tt;
  };

  var not = function not(dict) {
    return dict.not;
  };

  var implies = function implies(dict) {
    return dict.implies;
  };

  var ff = function ff(dict) {
    return dict.ff;
  };

  var disj = function disj(dict) {
    return dict.disj;
  };

  var heytingAlgebraBoolean = new HeytingAlgebra($foreign.boolConj, $foreign.boolDisj, false, function (a) {
    return function (b) {
      return disj(heytingAlgebraBoolean)(not(heytingAlgebraBoolean)(a))(b);
    };
  }, $foreign.boolNot, true);

  var conj = function conj(dict) {
    return dict.conj;
  };

  var heytingAlgebraFunction = function heytingAlgebraFunction(dictHeytingAlgebra) {
    return new HeytingAlgebra(function (f) {
      return function (g) {
        return function (a) {
          return conj(dictHeytingAlgebra)(f(a))(g(a));
        };
      };
    }, function (f) {
      return function (g) {
        return function (a) {
          return disj(dictHeytingAlgebra)(f(a))(g(a));
        };
      };
    }, function (v) {
      return ff(dictHeytingAlgebra);
    }, function (f) {
      return function (g) {
        return function (a) {
          return implies(dictHeytingAlgebra)(f(a))(g(a));
        };
      };
    }, function (f) {
      return function (a) {
        return not(dictHeytingAlgebra)(f(a));
      };
    }, function (v) {
      return tt(dictHeytingAlgebra);
    });
  };

  exports["ff"] = ff;
  exports["disj"] = disj;
  exports["not"] = not;
  exports["heytingAlgebraBoolean"] = heytingAlgebraBoolean;
  exports["heytingAlgebraFunction"] = heytingAlgebraFunction;
})(PS);

(function (exports) {
  "use strict";

  exports.concatString = function (s1) {
    return function (s2) {
      return s1 + s2;
    };
  };

  exports.concatArray = function (xs) {
    return function (ys) {
      if (xs.length === 0) return ys;
      if (ys.length === 0) return xs;
      return xs.concat(ys);
    };
  };
})(PS["Data.Semigroup"] = PS["Data.Semigroup"] || {});

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Data.Semigroup"] = $PS["Data.Semigroup"] || {};
  var exports = $PS["Data.Semigroup"];
  var $foreign = $PS["Data.Semigroup"];

  var Semigroup = function Semigroup(append) {
    this.append = append;
  };

  var semigroupString = new Semigroup($foreign.concatString);
  var semigroupArray = new Semigroup($foreign.concatArray);

  var append = function append(dict) {
    return dict.append;
  };

  exports["Semigroup"] = Semigroup;
  exports["append"] = append;
  exports["semigroupString"] = semigroupString;
  exports["semigroupArray"] = semigroupArray;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Data.Monoid"] = $PS["Data.Monoid"] || {};
  var exports = $PS["Data.Monoid"];
  var Data_Semigroup = $PS["Data.Semigroup"];

  var Monoid = function Monoid(Semigroup0, mempty) {
    this.Semigroup0 = Semigroup0;
    this.mempty = mempty;
  };

  var monoidString = new Monoid(function () {
    return Data_Semigroup.semigroupString;
  }, "");

  var mempty = function mempty(dict) {
    return dict.mempty;
  };

  exports["Monoid"] = Monoid;
  exports["mempty"] = mempty;
  exports["monoidString"] = monoidString;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Data.Monoid.Disj"] = $PS["Data.Monoid.Disj"] || {};
  var exports = $PS["Data.Monoid.Disj"];
  var Data_HeytingAlgebra = $PS["Data.HeytingAlgebra"];
  var Data_Monoid = $PS["Data.Monoid"];
  var Data_Semigroup = $PS["Data.Semigroup"];

  var Disj = function Disj(x) {
    return x;
  };

  var semigroupDisj = function semigroupDisj(dictHeytingAlgebra) {
    return new Data_Semigroup.Semigroup(function (v) {
      return function (v1) {
        return Data_HeytingAlgebra.disj(dictHeytingAlgebra)(v)(v1);
      };
    });
  };

  var monoidDisj = function monoidDisj(dictHeytingAlgebra) {
    return new Data_Monoid.Monoid(function () {
      return semigroupDisj(dictHeytingAlgebra);
    }, Data_HeytingAlgebra.ff(dictHeytingAlgebra));
  };

  exports["Disj"] = Disj;
  exports["monoidDisj"] = monoidDisj;
})(PS);

(function (exports) {
  "use strict"; // module Unsafe.Coerce

  exports.unsafeCoerce = function (x) {
    return x;
  };
})(PS["Unsafe.Coerce"] = PS["Unsafe.Coerce"] || {});

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Unsafe.Coerce"] = $PS["Unsafe.Coerce"] || {};
  var exports = $PS["Unsafe.Coerce"];
  var $foreign = $PS["Unsafe.Coerce"];
  exports["unsafeCoerce"] = $foreign.unsafeCoerce;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Safe.Coerce"] = $PS["Safe.Coerce"] || {};
  var exports = $PS["Safe.Coerce"];
  var Unsafe_Coerce = $PS["Unsafe.Coerce"];

  var coerce = function coerce(dictCoercible) {
    return Unsafe_Coerce.unsafeCoerce;
  };

  exports["coerce"] = coerce;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Data.Newtype"] = $PS["Data.Newtype"] || {};
  var exports = $PS["Data.Newtype"];
  var Safe_Coerce = $PS["Safe.Coerce"];

  var unwrap = function unwrap(dictNewtype) {
    return Safe_Coerce.coerce();
  };

  var over = function over(dictNewtype) {
    return function (dictNewtype1) {
      return function (v) {
        return Safe_Coerce.coerce();
      };
    };
  };

  var alaF = function alaF(dictCoercible) {
    return function (dictCoercible1) {
      return function (dictNewtype) {
        return function (dictNewtype1) {
          return function (v) {
            return Safe_Coerce.coerce();
          };
        };
      };
    };
  };

  exports["unwrap"] = unwrap;
  exports["alaF"] = alaF;
  exports["over"] = over;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Data.Foldable"] = $PS["Data.Foldable"] || {};
  var exports = $PS["Data.Foldable"];
  var $foreign = $PS["Data.Foldable"];
  var Control_Applicative = $PS["Control.Applicative"];
  var Control_Apply = $PS["Control.Apply"];
  var Data_Either = $PS["Data.Either"];
  var Data_Eq = $PS["Data.Eq"];
  var Data_Function = $PS["Data.Function"];
  var Data_HeytingAlgebra = $PS["Data.HeytingAlgebra"];
  var Data_Maybe = $PS["Data.Maybe"];
  var Data_Monoid = $PS["Data.Monoid"];
  var Data_Monoid_Disj = $PS["Data.Monoid.Disj"];
  var Data_Newtype = $PS["Data.Newtype"];
  var Data_Semigroup = $PS["Data.Semigroup"];
  var Data_Unit = $PS["Data.Unit"];

  var Foldable = function Foldable(foldMap, foldl, foldr) {
    this.foldMap = foldMap;
    this.foldl = foldl;
    this.foldr = foldr;
  };

  var foldr = function foldr(dict) {
    return dict.foldr;
  };

  var traverse_ = function traverse_(dictApplicative) {
    return function (dictFoldable) {
      return function (f) {
        return foldr(dictFoldable)(function () {
          var $311 = Control_Apply.applySecond(dictApplicative.Apply0());
          return function ($312) {
            return $311(f($312));
          };
        }())(Control_Applicative.pure(dictApplicative)(Data_Unit.unit));
      };
    };
  };

  var for_ = function for_(dictApplicative) {
    return function (dictFoldable) {
      return Data_Function.flip(traverse_(dictApplicative)(dictFoldable));
    };
  };

  var foldl = function foldl(dict) {
    return dict.foldl;
  };

  var indexl = function indexl(dictFoldable) {
    return function (idx) {
      var go = function go(cursor) {
        return function (a) {
          if (cursor.elem instanceof Data_Maybe.Just) {
            return cursor;
          }

          ;
          var $153 = cursor.pos === idx;

          if ($153) {
            return {
              elem: new Data_Maybe.Just(a),
              pos: cursor.pos
            };
          }

          ;
          return {
            pos: cursor.pos + 1 | 0,
            elem: cursor.elem
          };
        };
      };

      var $313 = foldl(dictFoldable)(go)({
        elem: Data_Maybe.Nothing.value,
        pos: 0
      });
      return function ($314) {
        return function (v) {
          return v.elem;
        }($313($314));
      };
    };
  };

  var foldableMaybe = new Foldable(function (dictMonoid) {
    return function (f) {
      return function (v) {
        if (v instanceof Data_Maybe.Nothing) {
          return Data_Monoid.mempty(dictMonoid);
        }

        ;

        if (v instanceof Data_Maybe.Just) {
          return f(v.value0);
        }

        ;
        throw new Error("Failed pattern match at Data.Foldable (line 138, column 1 - line 144, column 27): " + [f.constructor.name, v.constructor.name]);
      };
    };
  }, function (v) {
    return function (z) {
      return function (v1) {
        if (v1 instanceof Data_Maybe.Nothing) {
          return z;
        }

        ;

        if (v1 instanceof Data_Maybe.Just) {
          return v(z)(v1.value0);
        }

        ;
        throw new Error("Failed pattern match at Data.Foldable (line 138, column 1 - line 144, column 27): " + [v.constructor.name, z.constructor.name, v1.constructor.name]);
      };
    };
  }, function (v) {
    return function (z) {
      return function (v1) {
        if (v1 instanceof Data_Maybe.Nothing) {
          return z;
        }

        ;

        if (v1 instanceof Data_Maybe.Just) {
          return v(v1.value0)(z);
        }

        ;
        throw new Error("Failed pattern match at Data.Foldable (line 138, column 1 - line 144, column 27): " + [v.constructor.name, z.constructor.name, v1.constructor.name]);
      };
    };
  });
  var foldableEither = new Foldable(function (dictMonoid) {
    return function (f) {
      return function (v) {
        if (v instanceof Data_Either.Left) {
          return Data_Monoid.mempty(dictMonoid);
        }

        ;

        if (v instanceof Data_Either.Right) {
          return f(v.value0);
        }

        ;
        throw new Error("Failed pattern match at Data.Foldable (line 181, column 1 - line 187, column 28): " + [f.constructor.name, v.constructor.name]);
      };
    };
  }, function (v) {
    return function (z) {
      return function (v1) {
        if (v1 instanceof Data_Either.Left) {
          return z;
        }

        ;

        if (v1 instanceof Data_Either.Right) {
          return v(z)(v1.value0);
        }

        ;
        throw new Error("Failed pattern match at Data.Foldable (line 181, column 1 - line 187, column 28): " + [v.constructor.name, z.constructor.name, v1.constructor.name]);
      };
    };
  }, function (v) {
    return function (z) {
      return function (v1) {
        if (v1 instanceof Data_Either.Left) {
          return z;
        }

        ;

        if (v1 instanceof Data_Either.Right) {
          return v(v1.value0)(z);
        }

        ;
        throw new Error("Failed pattern match at Data.Foldable (line 181, column 1 - line 187, column 28): " + [v.constructor.name, z.constructor.name, v1.constructor.name]);
      };
    };
  });

  var foldMapDefaultR = function foldMapDefaultR(dictFoldable) {
    return function (dictMonoid) {
      return function (f) {
        return foldr(dictFoldable)(function (x) {
          return function (acc) {
            return Data_Semigroup.append(dictMonoid.Semigroup0())(f(x))(acc);
          };
        })(Data_Monoid.mempty(dictMonoid));
      };
    };
  };

  var foldableArray = new Foldable(function (dictMonoid) {
    return foldMapDefaultR(foldableArray)(dictMonoid);
  }, $foreign.foldlArray, $foreign.foldrArray);

  var foldMap = function foldMap(dict) {
    return dict.foldMap;
  };

  var any = function any(dictFoldable) {
    return function (dictHeytingAlgebra) {
      return Data_Newtype.alaF()()()()(Data_Monoid_Disj.Disj)(foldMap(dictFoldable)(Data_Monoid_Disj.monoidDisj(dictHeytingAlgebra)));
    };
  };

  var elem = function elem(dictFoldable) {
    return function (dictEq) {
      var $321 = any(dictFoldable)(Data_HeytingAlgebra.heytingAlgebraBoolean);
      var $322 = Data_Eq.eq(dictEq);
      return function ($323) {
        return $321($322($323));
      };
    };
  };

  exports["Foldable"] = Foldable;
  exports["foldr"] = foldr;
  exports["foldl"] = foldl;
  exports["foldMap"] = foldMap;
  exports["traverse_"] = traverse_;
  exports["for_"] = for_;
  exports["indexl"] = indexl;
  exports["foldableArray"] = foldableArray;
  exports["foldableMaybe"] = foldableMaybe;
  exports["foldableEither"] = foldableEither;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Data.NonEmpty"] = $PS["Data.NonEmpty"] || {};
  var exports = $PS["Data.NonEmpty"];
  var Control_Plus = $PS["Control.Plus"];
  var Data_Foldable = $PS["Data.Foldable"];
  var Data_Semigroup = $PS["Data.Semigroup"];

  var NonEmpty = function () {
    function NonEmpty(value0, value1) {
      this.value0 = value0;
      this.value1 = value1;
    }

    ;

    NonEmpty.create = function (value0) {
      return function (value1) {
        return new NonEmpty(value0, value1);
      };
    };

    return NonEmpty;
  }();

  var singleton = function singleton(dictPlus) {
    return function (a) {
      return new NonEmpty(a, Control_Plus.empty(dictPlus));
    };
  };

  var foldableNonEmpty = function foldableNonEmpty(dictFoldable) {
    return new Data_Foldable.Foldable(function (dictMonoid) {
      return function (f) {
        return function (v) {
          return Data_Semigroup.append(dictMonoid.Semigroup0())(f(v.value0))(Data_Foldable.foldMap(dictFoldable)(dictMonoid)(f)(v.value1));
        };
      };
    }, function (f) {
      return function (b) {
        return function (v) {
          return Data_Foldable.foldl(dictFoldable)(f)(f(b)(v.value0))(v.value1);
        };
      };
    }, function (f) {
      return function (b) {
        return function (v) {
          return f(v.value0)(Data_Foldable.foldr(dictFoldable)(f)(b)(v.value1));
        };
      };
    });
  };

  exports["NonEmpty"] = NonEmpty;
  exports["singleton"] = singleton;
  exports["foldableNonEmpty"] = foldableNonEmpty;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Data.List.Types"] = $PS["Data.List.Types"] || {};
  var exports = $PS["Data.List.Types"];
  var Control_Alt = $PS["Control.Alt"];
  var Control_Applicative = $PS["Control.Applicative"];
  var Control_Apply = $PS["Control.Apply"];
  var Control_Plus = $PS["Control.Plus"];
  var Data_Foldable = $PS["Data.Foldable"];
  var Data_Function = $PS["Data.Function"];
  var Data_Functor = $PS["Data.Functor"];
  var Data_Monoid = $PS["Data.Monoid"];
  var Data_NonEmpty = $PS["Data.NonEmpty"];
  var Data_Semigroup = $PS["Data.Semigroup"];

  var Nil = function () {
    function Nil() {}

    ;
    Nil.value = new Nil();
    return Nil;
  }();

  var Cons = function () {
    function Cons(value0, value1) {
      this.value0 = value0;
      this.value1 = value1;
    }

    ;

    Cons.create = function (value0) {
      return function (value1) {
        return new Cons(value0, value1);
      };
    };

    return Cons;
  }();

  var NonEmptyList = function NonEmptyList(x) {
    return x;
  };

  var toList = function toList(v) {
    return new Cons(v.value0, v.value1);
  };

  var listMap = function listMap(f) {
    var chunkedRevMap = function chunkedRevMap($copy_chunksAcc) {
      return function ($copy_v) {
        var $tco_var_chunksAcc = $copy_chunksAcc;
        var $tco_done = false;
        var $tco_result;

        function $tco_loop(chunksAcc, v) {
          if (v instanceof Cons && v.value1 instanceof Cons && v.value1.value1 instanceof Cons) {
            $tco_var_chunksAcc = new Cons(v, chunksAcc);
            $copy_v = v.value1.value1.value1;
            return;
          }

          ;

          var unrolledMap = function unrolledMap(v1) {
            if (v1 instanceof Cons && v1.value1 instanceof Cons && v1.value1.value1 instanceof Nil) {
              return new Cons(f(v1.value0), new Cons(f(v1.value1.value0), Nil.value));
            }

            ;

            if (v1 instanceof Cons && v1.value1 instanceof Nil) {
              return new Cons(f(v1.value0), Nil.value);
            }

            ;
            return Nil.value;
          };

          var reverseUnrolledMap = function reverseUnrolledMap($copy_v1) {
            return function ($copy_acc) {
              var $tco_var_v1 = $copy_v1;
              var $tco_done = false;
              var $tco_result;

              function $tco_loop(v1, acc) {
                if (v1 instanceof Cons && v1.value0 instanceof Cons && v1.value0.value1 instanceof Cons && v1.value0.value1.value1 instanceof Cons) {
                  $tco_var_v1 = v1.value1;
                  $copy_acc = new Cons(f(v1.value0.value0), new Cons(f(v1.value0.value1.value0), new Cons(f(v1.value0.value1.value1.value0), acc)));
                  return;
                }

                ;
                $tco_done = true;
                return acc;
              }

              ;

              while (!$tco_done) {
                $tco_result = $tco_loop($tco_var_v1, $copy_acc);
              }

              ;
              return $tco_result;
            };
          };

          $tco_done = true;
          return reverseUnrolledMap(chunksAcc)(unrolledMap(v));
        }

        ;

        while (!$tco_done) {
          $tco_result = $tco_loop($tco_var_chunksAcc, $copy_v);
        }

        ;
        return $tco_result;
      };
    };

    return chunkedRevMap(Nil.value);
  };

  var functorList = new Data_Functor.Functor(listMap);
  var foldableList = new Data_Foldable.Foldable(function (dictMonoid) {
    return function (f) {
      return Data_Foldable.foldl(foldableList)(function (acc) {
        var $204 = Data_Semigroup.append(dictMonoid.Semigroup0())(acc);
        return function ($205) {
          return $204(f($205));
        };
      })(Data_Monoid.mempty(dictMonoid));
    };
  }, function (f) {
    var go = function go($copy_b) {
      return function ($copy_v) {
        var $tco_var_b = $copy_b;
        var $tco_done = false;
        var $tco_result;

        function $tco_loop(b, v) {
          if (v instanceof Nil) {
            $tco_done = true;
            return b;
          }

          ;

          if (v instanceof Cons) {
            $tco_var_b = f(b)(v.value0);
            $copy_v = v.value1;
            return;
          }

          ;
          throw new Error("Failed pattern match at Data.List.Types (line 112, column 12 - line 114, column 30): " + [v.constructor.name]);
        }

        ;

        while (!$tco_done) {
          $tco_result = $tco_loop($tco_var_b, $copy_v);
        }

        ;
        return $tco_result;
      };
    };

    return go;
  }, function (f) {
    return function (b) {
      var rev = function () {
        var go = function go($copy_acc) {
          return function ($copy_v) {
            var $tco_var_acc = $copy_acc;
            var $tco_done = false;
            var $tco_result;

            function $tco_loop(acc, v) {
              if (v instanceof Nil) {
                $tco_done = true;
                return acc;
              }

              ;

              if (v instanceof Cons) {
                $tco_var_acc = new Cons(v.value0, acc);
                $copy_v = v.value1;
                return;
              }

              ;
              throw new Error("Failed pattern match at Data.List.Types (line 108, column 7 - line 108, column 23): " + [acc.constructor.name, v.constructor.name]);
            }

            ;

            while (!$tco_done) {
              $tco_result = $tco_loop($tco_var_acc, $copy_v);
            }

            ;
            return $tco_result;
          };
        };

        return go(Nil.value);
      }();

      var $206 = Data_Foldable.foldl(foldableList)(Data_Function.flip(f))(b);
      return function ($207) {
        return $206(rev($207));
      };
    };
  });
  var foldableNonEmptyList = Data_NonEmpty.foldableNonEmpty(foldableList);
  var semigroupList = new Data_Semigroup.Semigroup(function (xs) {
    return function (ys) {
      return Data_Foldable.foldr(foldableList)(Cons.create)(ys)(xs);
    };
  });
  var semigroupNonEmptyList = new Data_Semigroup.Semigroup(function (v) {
    return function (as$prime) {
      return new Data_NonEmpty.NonEmpty(v.value0, Data_Semigroup.append(semigroupList)(v.value1)(toList(as$prime)));
    };
  });
  var applyList = new Control_Apply.Apply(function () {
    return functorList;
  }, function (v) {
    return function (v1) {
      if (v instanceof Nil) {
        return Nil.value;
      }

      ;

      if (v instanceof Cons) {
        return Data_Semigroup.append(semigroupList)(Data_Functor.map(functorList)(v.value0)(v1))(Control_Apply.apply(applyList)(v.value1)(v1));
      }

      ;
      throw new Error("Failed pattern match at Data.List.Types (line 158, column 1 - line 160, column 48): " + [v.constructor.name, v1.constructor.name]);
    };
  });
  var applicativeList = new Control_Applicative.Applicative(function () {
    return applyList;
  }, function (a) {
    return new Cons(a, Nil.value);
  });
  var altList = new Control_Alt.Alt(function () {
    return functorList;
  }, Data_Semigroup.append(semigroupList));
  var plusList = new Control_Plus.Plus(function () {
    return altList;
  }, Nil.value);
  exports["Nil"] = Nil;
  exports["Cons"] = Cons;
  exports["NonEmptyList"] = NonEmptyList;
  exports["semigroupList"] = semigroupList;
  exports["foldableList"] = foldableList;
  exports["applicativeList"] = applicativeList;
  exports["plusList"] = plusList;
  exports["semigroupNonEmptyList"] = semigroupNonEmptyList;
  exports["foldableNonEmptyList"] = foldableNonEmptyList;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Data.List.NonEmpty"] = $PS["Data.List.NonEmpty"] || {};
  var exports = $PS["Data.List.NonEmpty"];
  var Data_List_Types = $PS["Data.List.Types"];
  var Data_NonEmpty = $PS["Data.NonEmpty"];

  var singleton = function () {
    var $172 = Data_NonEmpty.singleton(Data_List_Types.plusList);
    return function ($173) {
      return Data_List_Types.NonEmptyList($172($173));
    };
  }();

  var cons = function cons(y) {
    return function (v) {
      return new Data_NonEmpty.NonEmpty(y, new Data_List_Types.Cons(v.value0, v.value1));
    };
  };

  exports["singleton"] = singleton;
  exports["cons"] = cons;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Data.Tuple"] = $PS["Data.Tuple"] || {};
  var exports = $PS["Data.Tuple"];
  var Data_Functor = $PS["Data.Functor"];

  var Tuple = function () {
    function Tuple(value0, value1) {
      this.value0 = value0;
      this.value1 = value1;
    }

    ;

    Tuple.create = function (value0) {
      return function (value1) {
        return new Tuple(value0, value1);
      };
    };

    return Tuple;
  }();

  var uncurry = function uncurry(f) {
    return function (v) {
      return f(v.value0)(v.value1);
    };
  };

  var snd = function snd(v) {
    return v.value1;
  };

  var functorTuple = new Data_Functor.Functor(function (f) {
    return function (m) {
      return new Tuple(m.value0, f(m.value1));
    };
  });

  var fst = function fst(v) {
    return v.value0;
  };

  exports["Tuple"] = Tuple;
  exports["fst"] = fst;
  exports["snd"] = snd;
  exports["uncurry"] = uncurry;
  exports["functorTuple"] = functorTuple;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Control.Applicative.Free"] = $PS["Control.Applicative.Free"] || {};
  var exports = $PS["Control.Applicative.Free"];
  var Control_Applicative = $PS["Control.Applicative"];
  var Control_Apply = $PS["Control.Apply"];
  var Control_Category = $PS["Control.Category"];
  var Data_Either = $PS["Data.Either"];
  var Data_Functor = $PS["Data.Functor"];
  var Data_List_NonEmpty = $PS["Data.List.NonEmpty"];
  var Data_List_Types = $PS["Data.List.Types"];
  var Data_NonEmpty = $PS["Data.NonEmpty"];
  var Data_Tuple = $PS["Data.Tuple"];

  var Pure = function () {
    function Pure(value0) {
      this.value0 = value0;
    }

    ;

    Pure.create = function (value0) {
      return new Pure(value0);
    };

    return Pure;
  }();

  var Lift = function () {
    function Lift(value0) {
      this.value0 = value0;
    }

    ;

    Lift.create = function (value0) {
      return new Lift(value0);
    };

    return Lift;
  }();

  var Ap = function () {
    function Ap(value0, value1) {
      this.value0 = value0;
      this.value1 = value1;
    }

    ;

    Ap.create = function (value0) {
      return function (value1) {
        return new Ap(value0, value1);
      };
    };

    return Ap;
  }();

  var mkAp = function mkAp(fba) {
    return function (fb) {
      return new Ap(fba, fb);
    };
  };

  var liftFreeAp = Lift.create;

  var goLeft = function goLeft($copy_dictApplicative) {
    return function ($copy_fStack) {
      return function ($copy_valStack) {
        return function ($copy_nat) {
          return function ($copy_func) {
            return function ($copy_count) {
              var $tco_var_dictApplicative = $copy_dictApplicative;
              var $tco_var_fStack = $copy_fStack;
              var $tco_var_valStack = $copy_valStack;
              var $tco_var_nat = $copy_nat;
              var $tco_var_func = $copy_func;
              var $tco_done = false;
              var $tco_result;

              function $tco_loop(dictApplicative, fStack, valStack, nat, func, count) {
                if (func instanceof Pure) {
                  $tco_done = true;
                  return new Data_Tuple.Tuple(new Data_List_Types.Cons({
                    func: Control_Applicative.pure(dictApplicative)(func.value0),
                    count: count
                  }, fStack), valStack);
                }

                ;

                if (func instanceof Lift) {
                  $tco_done = true;
                  return new Data_Tuple.Tuple(new Data_List_Types.Cons({
                    func: nat(func.value0),
                    count: count
                  }, fStack), valStack);
                }

                ;

                if (func instanceof Ap) {
                  $tco_var_dictApplicative = dictApplicative;
                  $tco_var_fStack = fStack;
                  $tco_var_valStack = Data_List_NonEmpty.cons(func.value1)(valStack);
                  $tco_var_nat = nat;
                  $tco_var_func = func.value0;
                  $copy_count = count + 1 | 0;
                  return;
                }

                ;
                throw new Error("Failed pattern match at Control.Applicative.Free (line 102, column 41 - line 105, column 81): " + [func.constructor.name]);
              }

              ;

              while (!$tco_done) {
                $tco_result = $tco_loop($tco_var_dictApplicative, $tco_var_fStack, $tco_var_valStack, $tco_var_nat, $tco_var_func, $copy_count);
              }

              ;
              return $tco_result;
            };
          };
        };
      };
    };
  };

  var goApply = function goApply($copy_dictApplicative) {
    return function ($copy_fStack) {
      return function ($copy_vals) {
        return function ($copy_gVal) {
          var $tco_var_dictApplicative = $copy_dictApplicative;
          var $tco_var_fStack = $copy_fStack;
          var $tco_var_vals = $copy_vals;
          var $tco_done = false;
          var $tco_result;

          function $tco_loop(dictApplicative, fStack, vals, gVal) {
            if (fStack instanceof Data_List_Types.Nil) {
              $tco_done = true;
              return new Data_Either.Left(gVal);
            }

            ;

            if (fStack instanceof Data_List_Types.Cons) {
              var gRes = Control_Apply.apply(dictApplicative.Apply0())(fStack.value0.func)(gVal);
              var $14 = fStack.value0.count === 1;

              if ($14) {
                if (fStack.value1 instanceof Data_List_Types.Nil) {
                  $tco_done = true;
                  return new Data_Either.Left(gRes);
                }

                ;
                $tco_var_dictApplicative = dictApplicative;
                $tco_var_fStack = fStack.value1;
                $tco_var_vals = vals;
                $copy_gVal = gRes;
                return;
              }

              ;

              if (vals instanceof Data_List_Types.Nil) {
                $tco_done = true;
                return new Data_Either.Left(gRes);
              }

              ;

              if (vals instanceof Data_List_Types.Cons) {
                $tco_done = true;
                return Data_Either.Right.create(new Data_Tuple.Tuple(new Data_List_Types.Cons({
                  func: gRes,
                  count: fStack.value0.count - 1 | 0
                }, fStack.value1), new Data_NonEmpty.NonEmpty(vals.value0, vals.value1)));
              }

              ;
              throw new Error("Failed pattern match at Control.Applicative.Free (line 83, column 11 - line 88, column 50): " + [vals.constructor.name]);
            }

            ;
            throw new Error("Failed pattern match at Control.Applicative.Free (line 72, column 3 - line 88, column 50): " + [fStack.constructor.name]);
          }

          ;

          while (!$tco_done) {
            $tco_result = $tco_loop($tco_var_dictApplicative, $tco_var_fStack, $tco_var_vals, $copy_gVal);
          }

          ;
          return $tco_result;
        };
      };
    };
  };

  var functorFreeAp = new Data_Functor.Functor(function (f) {
    return function (x) {
      return mkAp(new Pure(f))(x);
    };
  });

  var foldFreeAp = function foldFreeAp(dictApplicative) {
    return function (nat) {
      return function (z) {
        var go = function go($copy_v) {
          var $tco_done = false;
          var $tco_result;

          function $tco_loop(v) {
            if (v.value1.value0 instanceof Pure) {
              var v1 = goApply(dictApplicative)(v.value0)(v.value1.value1)(Control_Applicative.pure(dictApplicative)(v.value1.value0.value0));

              if (v1 instanceof Data_Either.Left) {
                $tco_done = true;
                return v1.value0;
              }

              ;

              if (v1 instanceof Data_Either.Right) {
                $copy_v = v1.value0;
                return;
              }

              ;
              throw new Error("Failed pattern match at Control.Applicative.Free (line 54, column 17 - line 56, column 24): " + [v1.constructor.name]);
            }

            ;

            if (v.value1.value0 instanceof Lift) {
              var v1 = goApply(dictApplicative)(v.value0)(v.value1.value1)(nat(v.value1.value0.value0));

              if (v1 instanceof Data_Either.Left) {
                $tco_done = true;
                return v1.value0;
              }

              ;

              if (v1 instanceof Data_Either.Right) {
                $copy_v = v1.value0;
                return;
              }

              ;
              throw new Error("Failed pattern match at Control.Applicative.Free (line 57, column 17 - line 59, column 24): " + [v1.constructor.name]);
            }

            ;

            if (v.value1.value0 instanceof Ap) {
              var nextVals = new Data_NonEmpty.NonEmpty(v.value1.value0.value1, v.value1.value1);
              $copy_v = goLeft(dictApplicative)(v.value0)(nextVals)(nat)(v.value1.value0.value0)(1);
              return;
            }

            ;
            throw new Error("Failed pattern match at Control.Applicative.Free (line 53, column 5 - line 62, column 47): " + [v.value1.value0.constructor.name]);
          }

          ;

          while (!$tco_done) {
            $tco_result = $tco_loop($copy_v);
          }

          ;
          return $tco_result;
        };

        return go(new Data_Tuple.Tuple(Data_List_Types.Nil.value, Data_List_NonEmpty.singleton(z)));
      };
    };
  };

  var retractFreeAp = function retractFreeAp(dictApplicative) {
    return foldFreeAp(dictApplicative)(Control_Category.identity(Control_Category.categoryFn));
  };

  var applyFreeAp = new Control_Apply.Apply(function () {
    return functorFreeAp;
  }, function (fba) {
    return function (fb) {
      return mkAp(fba)(fb);
    };
  });
  var applicativeFreeAp = new Control_Applicative.Applicative(function () {
    return applyFreeAp;
  }, Pure.create);

  var hoistFreeAp = function hoistFreeAp(f) {
    return foldFreeAp(applicativeFreeAp)(function ($37) {
      return liftFreeAp(f($37));
    });
  };

  exports["liftFreeAp"] = liftFreeAp;
  exports["retractFreeAp"] = retractFreeAp;
  exports["hoistFreeAp"] = hoistFreeAp;
  exports["applicativeFreeAp"] = applicativeFreeAp;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Control.Monad"] = $PS["Control.Monad"] || {};
  var exports = $PS["Control.Monad"];
  var Control_Applicative = $PS["Control.Applicative"];
  var Control_Bind = $PS["Control.Bind"];

  var Monad = function Monad(Applicative0, Bind1) {
    this.Applicative0 = Applicative0;
    this.Bind1 = Bind1;
  };

  var unlessM = function unlessM(dictMonad) {
    return function (mb) {
      return function (m) {
        return Control_Bind.bind(dictMonad.Bind1())(mb)(function (b) {
          return Control_Applicative.unless(dictMonad.Applicative0())(b)(m);
        });
      };
    };
  };

  var ap = function ap(dictMonad) {
    return function (f) {
      return function (a) {
        return Control_Bind.bind(dictMonad.Bind1())(f)(function (f$prime) {
          return Control_Bind.bind(dictMonad.Bind1())(a)(function (a$prime) {
            return Control_Applicative.pure(dictMonad.Applicative0())(f$prime(a$prime));
          });
        });
      };
    };
  };

  exports["Monad"] = Monad;
  exports["unlessM"] = unlessM;
  exports["ap"] = ap;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Control.Monad.Error.Class"] = $PS["Control.Monad.Error.Class"] || {};
  var exports = $PS["Control.Monad.Error.Class"];
  var Control_Applicative = $PS["Control.Applicative"];
  var Data_Either = $PS["Data.Either"];
  var Data_Functor = $PS["Data.Functor"];

  var MonadThrow = function MonadThrow(Monad0, throwError) {
    this.Monad0 = Monad0;
    this.throwError = throwError;
  };

  var MonadError = function MonadError(MonadThrow0, catchError) {
    this.MonadThrow0 = MonadThrow0;
    this.catchError = catchError;
  };

  var throwError = function throwError(dict) {
    return dict.throwError;
  };

  var catchError = function catchError(dict) {
    return dict.catchError;
  };

  var $$try = function $$try(dictMonadError) {
    return function (a) {
      return catchError(dictMonadError)(Data_Functor.map(dictMonadError.MonadThrow0().Monad0().Bind1().Apply0().Functor0())(Data_Either.Right.create)(a))(function () {
        var $17 = Control_Applicative.pure(dictMonadError.MonadThrow0().Monad0().Applicative0());
        return function ($18) {
          return $17(Data_Either.Left.create($18));
        };
      }());
    };
  };

  exports["throwError"] = throwError;
  exports["MonadThrow"] = MonadThrow;
  exports["MonadError"] = MonadError;
  exports["try"] = $$try;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Control.Monad.Except.Trans"] = $PS["Control.Monad.Except.Trans"] || {};
  var exports = $PS["Control.Monad.Except.Trans"];
  var Control_Alt = $PS["Control.Alt"];
  var Control_Applicative = $PS["Control.Applicative"];
  var Control_Apply = $PS["Control.Apply"];
  var Control_Bind = $PS["Control.Bind"];
  var Control_Monad = $PS["Control.Monad"];
  var Control_Monad_Error_Class = $PS["Control.Monad.Error.Class"];
  var Data_Either = $PS["Data.Either"];
  var Data_Functor = $PS["Data.Functor"];
  var Data_Semigroup = $PS["Data.Semigroup"];

  var ExceptT = function ExceptT(x) {
    return x;
  };

  var withExceptT = function withExceptT(dictFunctor) {
    return function (f) {
      return function (v) {
        var mapLeft = function mapLeft(v1) {
          return function (v2) {
            if (v2 instanceof Data_Either.Right) {
              return new Data_Either.Right(v2.value0);
            }

            ;

            if (v2 instanceof Data_Either.Left) {
              return new Data_Either.Left(v1(v2.value0));
            }

            ;
            throw new Error("Failed pattern match at Control.Monad.Except.Trans (line 43, column 3 - line 43, column 32): " + [v1.constructor.name, v2.constructor.name]);
          };
        };

        return ExceptT(Data_Functor.map(dictFunctor)(mapLeft(f))(v));
      };
    };
  };

  var runExceptT = function runExceptT(v) {
    return v;
  };

  var mapExceptT = function mapExceptT(f) {
    return function (v) {
      return f(v);
    };
  };

  var functorExceptT = function functorExceptT(dictFunctor) {
    return new Data_Functor.Functor(function (f) {
      return mapExceptT(Data_Functor.map(dictFunctor)(Data_Functor.map(Data_Either.functorEither)(f)));
    });
  };

  var except = function except(dictApplicative) {
    var $89 = Control_Applicative.pure(dictApplicative);
    return function ($90) {
      return ExceptT($89($90));
    };
  };

  var monadExceptT = function monadExceptT(dictMonad) {
    return new Control_Monad.Monad(function () {
      return applicativeExceptT(dictMonad);
    }, function () {
      return bindExceptT(dictMonad);
    });
  };

  var bindExceptT = function bindExceptT(dictMonad) {
    return new Control_Bind.Bind(function () {
      return applyExceptT(dictMonad);
    }, function (v) {
      return function (k) {
        return Control_Bind.bind(dictMonad.Bind1())(v)(Data_Either.either(function () {
          var $91 = Control_Applicative.pure(dictMonad.Applicative0());
          return function ($92) {
            return $91(Data_Either.Left.create($92));
          };
        }())(function (a) {
          var v1 = k(a);
          return v1;
        }));
      };
    });
  };

  var applyExceptT = function applyExceptT(dictMonad) {
    return new Control_Apply.Apply(function () {
      return functorExceptT(dictMonad.Bind1().Apply0().Functor0());
    }, Control_Monad.ap(monadExceptT(dictMonad)));
  };

  var applicativeExceptT = function applicativeExceptT(dictMonad) {
    return new Control_Applicative.Applicative(function () {
      return applyExceptT(dictMonad);
    }, function () {
      var $93 = Control_Applicative.pure(dictMonad.Applicative0());
      return function ($94) {
        return ExceptT($93(Data_Either.Right.create($94)));
      };
    }());
  };

  var monadThrowExceptT = function monadThrowExceptT(dictMonad) {
    return new Control_Monad_Error_Class.MonadThrow(function () {
      return monadExceptT(dictMonad);
    }, function () {
      var $103 = Control_Applicative.pure(dictMonad.Applicative0());
      return function ($104) {
        return ExceptT($103(Data_Either.Left.create($104)));
      };
    }());
  };

  var altExceptT = function altExceptT(dictSemigroup) {
    return function (dictMonad) {
      return new Control_Alt.Alt(function () {
        return functorExceptT(dictMonad.Bind1().Apply0().Functor0());
      }, function (v) {
        return function (v1) {
          return Control_Bind.bind(dictMonad.Bind1())(v)(function (rm) {
            if (rm instanceof Data_Either.Right) {
              return Control_Applicative.pure(dictMonad.Applicative0())(new Data_Either.Right(rm.value0));
            }

            ;

            if (rm instanceof Data_Either.Left) {
              return Control_Bind.bind(dictMonad.Bind1())(v1)(function (rn) {
                if (rn instanceof Data_Either.Right) {
                  return Control_Applicative.pure(dictMonad.Applicative0())(new Data_Either.Right(rn.value0));
                }

                ;

                if (rn instanceof Data_Either.Left) {
                  return Control_Applicative.pure(dictMonad.Applicative0())(new Data_Either.Left(Data_Semigroup.append(dictSemigroup)(rm.value0)(rn.value0)));
                }

                ;
                throw new Error("Failed pattern match at Control.Monad.Except.Trans (line 87, column 9 - line 89, column 49): " + [rn.constructor.name]);
              });
            }

            ;
            throw new Error("Failed pattern match at Control.Monad.Except.Trans (line 83, column 5 - line 89, column 49): " + [rm.constructor.name]);
          });
        };
      });
    };
  };

  exports["runExceptT"] = runExceptT;
  exports["withExceptT"] = withExceptT;
  exports["except"] = except;
  exports["functorExceptT"] = functorExceptT;
  exports["applicativeExceptT"] = applicativeExceptT;
  exports["bindExceptT"] = bindExceptT;
  exports["altExceptT"] = altExceptT;
  exports["monadThrowExceptT"] = monadThrowExceptT;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Control.Monad.Except"] = $PS["Control.Monad.Except"] || {};
  var exports = $PS["Control.Monad.Except"];
  var Control_Monad_Except_Trans = $PS["Control.Monad.Except.Trans"];
  var Data_Newtype = $PS["Data.Newtype"];

  var runExcept = function () {
    var $0 = Data_Newtype.unwrap();
    return function ($1) {
      return $0(Control_Monad_Except_Trans.runExceptT($1));
    };
  }();

  exports["runExcept"] = runExcept;
})(PS);

(function (exports) {
  /* globals setImmediate, clearImmediate, setTimeout, clearTimeout */

  /* eslint-disable no-unused-vars, no-prototype-builtins, no-use-before-define, no-unused-labels, no-param-reassign */
  "use strict";

  var Aff = function () {
    // A unique value for empty.
    var EMPTY = {};
    /*
    An awkward approximation. We elide evidence we would otherwise need in PS for
    efficiency sake.
    data Aff eff a
    = Pure a
    | Throw Error
    | Catch (Aff eff a) (Error -> Aff eff a)
    | Sync (Eff eff a)
    | Async ((Either Error a -> Eff eff Unit) -> Eff eff (Canceler eff))
    | forall b. Bind (Aff eff b) (b -> Aff eff a)
    | forall b. Bracket (Aff eff b) (BracketConditions eff b) (b -> Aff eff a)
    | forall b. Fork Boolean (Aff eff b) ?(Fiber eff b -> a)
    | Sequential (ParAff aff a)
    */

    var PURE = "Pure";
    var THROW = "Throw";
    var CATCH = "Catch";
    var SYNC = "Sync";
    var ASYNC = "Async";
    var BIND = "Bind";
    var BRACKET = "Bracket";
    var FORK = "Fork";
    var SEQ = "Sequential";
    /*
    data ParAff eff a
    = forall b. Map (b -> a) (ParAff eff b)
    | forall b. Apply (ParAff eff (b -> a)) (ParAff eff b)
    | Alt (ParAff eff a) (ParAff eff a)
    | ?Par (Aff eff a)
    */

    var MAP = "Map";
    var APPLY = "Apply";
    var ALT = "Alt"; // Various constructors used in interpretation

    var CONS = "Cons"; // Cons-list, for stacks

    var RESUME = "Resume"; // Continue indiscriminately

    var RELEASE = "Release"; // Continue with bracket finalizers

    var FINALIZER = "Finalizer"; // A non-interruptible effect

    var FINALIZED = "Finalized"; // Marker for finalization

    var FORKED = "Forked"; // Reference to a forked fiber, with resumption stack

    var FIBER = "Fiber"; // Actual fiber reference

    var THUNK = "Thunk"; // Primed effect, ready to invoke

    function Aff(tag, _1, _2, _3) {
      this.tag = tag;
      this._1 = _1;
      this._2 = _2;
      this._3 = _3;
    }

    function AffCtr(tag) {
      var fn = function fn(_1, _2, _3) {
        return new Aff(tag, _1, _2, _3);
      };

      fn.tag = tag;
      return fn;
    }

    function nonCanceler(error) {
      return new Aff(PURE, void 0);
    }

    function runEff(eff) {
      try {
        eff();
      } catch (error) {
        setTimeout(function () {
          throw error;
        }, 0);
      }
    }

    function runSync(left, right, eff) {
      try {
        return right(eff());
      } catch (error) {
        return left(error);
      }
    }

    function runAsync(left, eff, k) {
      try {
        return eff(k)();
      } catch (error) {
        k(left(error))();
        return nonCanceler;
      }
    }

    var Scheduler = function () {
      var limit = 1024;
      var size = 0;
      var ix = 0;
      var queue = new Array(limit);
      var draining = false;

      function drain() {
        var thunk;
        draining = true;

        while (size !== 0) {
          size--;
          thunk = queue[ix];
          queue[ix] = void 0;
          ix = (ix + 1) % limit;
          thunk();
        }

        draining = false;
      }

      return {
        isDraining: function isDraining() {
          return draining;
        },
        enqueue: function enqueue(cb) {
          var i, tmp;

          if (size === limit) {
            tmp = draining;
            drain();
            draining = tmp;
          }

          queue[(ix + size) % limit] = cb;
          size++;

          if (!draining) {
            drain();
          }
        }
      };
    }();

    function Supervisor(util) {
      var fibers = {};
      var fiberId = 0;
      var count = 0;
      return {
        register: function register(fiber) {
          var fid = fiberId++;
          fiber.onComplete({
            rethrow: true,
            handler: function handler(result) {
              return function () {
                count--;
                delete fibers[fid];
              };
            }
          })();
          fibers[fid] = fiber;
          count++;
        },
        isEmpty: function isEmpty() {
          return count === 0;
        },
        killAll: function killAll(killError, cb) {
          return function () {
            if (count === 0) {
              return cb();
            }

            var killCount = 0;
            var kills = {};

            function kill(fid) {
              kills[fid] = fibers[fid].kill(killError, function (result) {
                return function () {
                  delete kills[fid];
                  killCount--;

                  if (util.isLeft(result) && util.fromLeft(result)) {
                    setTimeout(function () {
                      throw util.fromLeft(result);
                    }, 0);
                  }

                  if (killCount === 0) {
                    cb();
                  }
                };
              })();
            }

            for (var k in fibers) {
              if (fibers.hasOwnProperty(k)) {
                killCount++;
                kill(k);
              }
            }

            fibers = {};
            fiberId = 0;
            count = 0;
            return function (error) {
              return new Aff(SYNC, function () {
                for (var k in kills) {
                  if (kills.hasOwnProperty(k)) {
                    kills[k]();
                  }
                }
              });
            };
          };
        }
      };
    } // Fiber state machine


    var SUSPENDED = 0; // Suspended, pending a join.

    var CONTINUE = 1; // Interpret the next instruction.

    var STEP_BIND = 2; // Apply the next bind.

    var STEP_RESULT = 3; // Handle potential failure from a result.

    var PENDING = 4; // An async effect is running.

    var RETURN = 5; // The current stack has returned.

    var COMPLETED = 6; // The entire fiber has completed.

    function Fiber(util, supervisor, aff) {
      // Monotonically increasing tick, increased on each asynchronous turn.
      var runTick = 0; // The current branch of the state machine.

      var status = SUSPENDED; // The current point of interest for the state machine branch.

      var step = aff; // Successful step

      var fail = null; // Failure step

      var interrupt = null; // Asynchronous interrupt
      // Stack of continuations for the current fiber.

      var bhead = null;
      var btail = null; // Stack of attempts and finalizers for error recovery. Every `Cons` is also
      // tagged with current `interrupt` state. We use this to track which items
      // should be ignored or evaluated as a result of a kill.

      var attempts = null; // A special state is needed for Bracket, because it cannot be killed. When
      // we enter a bracket acquisition or finalizer, we increment the counter,
      // and then decrement once complete.

      var bracketCount = 0; // Each join gets a new id so they can be revoked.

      var joinId = 0;
      var joins = null;
      var rethrow = true; // Each invocation of `run` requires a tick. When an asynchronous effect is
      // resolved, we must check that the local tick coincides with the fiber
      // tick before resuming. This prevents multiple async continuations from
      // accidentally resuming the same fiber. A common example may be invoking
      // the provided callback in `makeAff` more than once, but it may also be an
      // async effect resuming after the fiber was already cancelled.

      function _run(localRunTick) {
        var tmp, result, attempt;

        while (true) {
          tmp = null;
          result = null;
          attempt = null;

          switch (status) {
            case STEP_BIND:
              status = CONTINUE;

              try {
                step = bhead(step);

                if (btail === null) {
                  bhead = null;
                } else {
                  bhead = btail._1;
                  btail = btail._2;
                }
              } catch (e) {
                status = RETURN;
                fail = util.left(e);
                step = null;
              }

              break;

            case STEP_RESULT:
              if (util.isLeft(step)) {
                status = RETURN;
                fail = step;
                step = null;
              } else if (bhead === null) {
                status = RETURN;
              } else {
                status = STEP_BIND;
                step = util.fromRight(step);
              }

              break;

            case CONTINUE:
              switch (step.tag) {
                case BIND:
                  if (bhead) {
                    btail = new Aff(CONS, bhead, btail);
                  }

                  bhead = step._2;
                  status = CONTINUE;
                  step = step._1;
                  break;

                case PURE:
                  if (bhead === null) {
                    status = RETURN;
                    step = util.right(step._1);
                  } else {
                    status = STEP_BIND;
                    step = step._1;
                  }

                  break;

                case SYNC:
                  status = STEP_RESULT;
                  step = runSync(util.left, util.right, step._1);
                  break;

                case ASYNC:
                  status = PENDING;
                  step = runAsync(util.left, step._1, function (result) {
                    return function () {
                      if (runTick !== localRunTick) {
                        return;
                      }

                      runTick++;
                      Scheduler.enqueue(function () {
                        // It's possible to interrupt the fiber between enqueuing and
                        // resuming, so we need to check that the runTick is still
                        // valid.
                        if (runTick !== localRunTick + 1) {
                          return;
                        }

                        status = STEP_RESULT;
                        step = result;

                        _run(runTick);
                      });
                    };
                  });
                  return;

                case THROW:
                  status = RETURN;
                  fail = util.left(step._1);
                  step = null;
                  break;
                // Enqueue the Catch so that we can call the error handler later on
                // in case of an exception.

                case CATCH:
                  if (bhead === null) {
                    attempts = new Aff(CONS, step, attempts, interrupt);
                  } else {
                    attempts = new Aff(CONS, step, new Aff(CONS, new Aff(RESUME, bhead, btail), attempts, interrupt), interrupt);
                  }

                  bhead = null;
                  btail = null;
                  status = CONTINUE;
                  step = step._1;
                  break;
                // Enqueue the Bracket so that we can call the appropriate handlers
                // after resource acquisition.

                case BRACKET:
                  bracketCount++;

                  if (bhead === null) {
                    attempts = new Aff(CONS, step, attempts, interrupt);
                  } else {
                    attempts = new Aff(CONS, step, new Aff(CONS, new Aff(RESUME, bhead, btail), attempts, interrupt), interrupt);
                  }

                  bhead = null;
                  btail = null;
                  status = CONTINUE;
                  step = step._1;
                  break;

                case FORK:
                  status = STEP_RESULT;
                  tmp = Fiber(util, supervisor, step._2);

                  if (supervisor) {
                    supervisor.register(tmp);
                  }

                  if (step._1) {
                    tmp.run();
                  }

                  step = util.right(tmp);
                  break;

                case SEQ:
                  status = CONTINUE;
                  step = sequential(util, supervisor, step._1);
                  break;
              }

              break;

            case RETURN:
              bhead = null;
              btail = null; // If the current stack has returned, and we have no other stacks to
              // resume or finalizers to run, the fiber has halted and we can
              // invoke all join callbacks. Otherwise we need to resume.

              if (attempts === null) {
                status = COMPLETED;
                step = interrupt || fail || step;
              } else {
                // The interrupt status for the enqueued item.
                tmp = attempts._3;
                attempt = attempts._1;
                attempts = attempts._2;

                switch (attempt.tag) {
                  // We cannot recover from an unmasked interrupt. Otherwise we should
                  // continue stepping, or run the exception handler if an exception
                  // was raised.
                  case CATCH:
                    // We should compare the interrupt status as well because we
                    // only want it to apply if there has been an interrupt since
                    // enqueuing the catch.
                    if (interrupt && interrupt !== tmp && bracketCount === 0) {
                      status = RETURN;
                    } else if (fail) {
                      status = CONTINUE;
                      step = attempt._2(util.fromLeft(fail));
                      fail = null;
                    }

                    break;
                  // We cannot resume from an unmasked interrupt or exception.

                  case RESUME:
                    // As with Catch, we only want to ignore in the case of an
                    // interrupt since enqueing the item.
                    if (interrupt && interrupt !== tmp && bracketCount === 0 || fail) {
                      status = RETURN;
                    } else {
                      bhead = attempt._1;
                      btail = attempt._2;
                      status = STEP_BIND;
                      step = util.fromRight(step);
                    }

                    break;
                  // If we have a bracket, we should enqueue the handlers,
                  // and continue with the success branch only if the fiber has
                  // not been interrupted. If the bracket acquisition failed, we
                  // should not run either.

                  case BRACKET:
                    bracketCount--;

                    if (fail === null) {
                      result = util.fromRight(step); // We need to enqueue the Release with the same interrupt
                      // status as the Bracket that is initiating it.

                      attempts = new Aff(CONS, new Aff(RELEASE, attempt._2, result), attempts, tmp); // We should only coninue as long as the interrupt status has not changed or
                      // we are currently within a non-interruptable finalizer.

                      if (interrupt === tmp || bracketCount > 0) {
                        status = CONTINUE;
                        step = attempt._3(result);
                      }
                    }

                    break;
                  // Enqueue the appropriate handler. We increase the bracket count
                  // because it should not be cancelled.

                  case RELEASE:
                    attempts = new Aff(CONS, new Aff(FINALIZED, step, fail), attempts, interrupt);
                    status = CONTINUE; // It has only been killed if the interrupt status has changed
                    // since we enqueued the item, and the bracket count is 0. If the
                    // bracket count is non-zero then we are in a masked state so it's
                    // impossible to be killed.

                    if (interrupt && interrupt !== tmp && bracketCount === 0) {
                      step = attempt._1.killed(util.fromLeft(interrupt))(attempt._2);
                    } else if (fail) {
                      step = attempt._1.failed(util.fromLeft(fail))(attempt._2);
                    } else {
                      step = attempt._1.completed(util.fromRight(step))(attempt._2);
                    }

                    fail = null;
                    bracketCount++;
                    break;

                  case FINALIZER:
                    bracketCount++;
                    attempts = new Aff(CONS, new Aff(FINALIZED, step, fail), attempts, interrupt);
                    status = CONTINUE;
                    step = attempt._1;
                    break;

                  case FINALIZED:
                    bracketCount--;
                    status = RETURN;
                    step = attempt._1;
                    fail = attempt._2;
                    break;
                }
              }

              break;

            case COMPLETED:
              for (var k in joins) {
                if (joins.hasOwnProperty(k)) {
                  rethrow = rethrow && joins[k].rethrow;
                  runEff(joins[k].handler(step));
                }
              }

              joins = null; // If we have an interrupt and a fail, then the thread threw while
              // running finalizers. This should always rethrow in a fresh stack.

              if (interrupt && fail) {
                setTimeout(function () {
                  throw util.fromLeft(fail);
                }, 0); // If we have an unhandled exception, and no other fiber has joined
                // then we need to throw the exception in a fresh stack.
              } else if (util.isLeft(step) && rethrow) {
                setTimeout(function () {
                  // Guard on reathrow because a completely synchronous fiber can
                  // still have an observer which was added after-the-fact.
                  if (rethrow) {
                    throw util.fromLeft(step);
                  }
                }, 0);
              }

              return;

            case SUSPENDED:
              status = CONTINUE;
              break;

            case PENDING:
              return;
          }
        }
      }

      function onComplete(join) {
        return function () {
          if (status === COMPLETED) {
            rethrow = rethrow && join.rethrow;
            join.handler(step)();
            return function () {};
          }

          var jid = joinId++;
          joins = joins || {};
          joins[jid] = join;
          return function () {
            if (joins !== null) {
              delete joins[jid];
            }
          };
        };
      }

      function kill(error, cb) {
        return function () {
          if (status === COMPLETED) {
            cb(util.right(void 0))();
            return function () {};
          }

          var canceler = onComplete({
            rethrow: false,
            handler: function handler()
            /* unused */
            {
              return cb(util.right(void 0));
            }
          })();

          switch (status) {
            case SUSPENDED:
              interrupt = util.left(error);
              status = COMPLETED;
              step = interrupt;

              _run(runTick);

              break;

            case PENDING:
              if (interrupt === null) {
                interrupt = util.left(error);
              }

              if (bracketCount === 0) {
                if (status === PENDING) {
                  attempts = new Aff(CONS, new Aff(FINALIZER, step(error)), attempts, interrupt);
                }

                status = RETURN;
                step = null;
                fail = null;

                _run(++runTick);
              }

              break;

            default:
              if (interrupt === null) {
                interrupt = util.left(error);
              }

              if (bracketCount === 0) {
                status = RETURN;
                step = null;
                fail = null;
              }

          }

          return canceler;
        };
      }

      function join(cb) {
        return function () {
          var canceler = onComplete({
            rethrow: false,
            handler: cb
          })();

          if (status === SUSPENDED) {
            _run(runTick);
          }

          return canceler;
        };
      }

      return {
        kill: kill,
        join: join,
        onComplete: onComplete,
        isSuspended: function isSuspended() {
          return status === SUSPENDED;
        },
        run: function run() {
          if (status === SUSPENDED) {
            if (!Scheduler.isDraining()) {
              Scheduler.enqueue(function () {
                _run(runTick);
              });
            } else {
              _run(runTick);
            }
          }
        }
      };
    }

    function runPar(util, supervisor, par, cb) {
      // Table of all forked fibers.
      var fiberId = 0;
      var fibers = {}; // Table of currently running cancelers, as a product of `Alt` behavior.

      var killId = 0;
      var kills = {}; // Error used for early cancelation on Alt branches.

      var early = new Error("[ParAff] Early exit"); // Error used to kill the entire tree.

      var interrupt = null; // The root pointer of the tree.

      var root = EMPTY; // Walks a tree, invoking all the cancelers. Returns the table of pending
      // cancellation fibers.

      function kill(error, par, cb) {
        var step = par;
        var head = null;
        var tail = null;
        var count = 0;
        var kills = {};
        var tmp, kid;

        loop: while (true) {
          tmp = null;

          switch (step.tag) {
            case FORKED:
              if (step._3 === EMPTY) {
                tmp = fibers[step._1];
                kills[count++] = tmp.kill(error, function (result) {
                  return function () {
                    count--;

                    if (count === 0) {
                      cb(result)();
                    }
                  };
                });
              } // Terminal case.


              if (head === null) {
                break loop;
              } // Go down the right side of the tree.


              step = head._2;

              if (tail === null) {
                head = null;
              } else {
                head = tail._1;
                tail = tail._2;
              }

              break;

            case MAP:
              step = step._2;
              break;

            case APPLY:
            case ALT:
              if (head) {
                tail = new Aff(CONS, head, tail);
              }

              head = step;
              step = step._1;
              break;
          }
        }

        if (count === 0) {
          cb(util.right(void 0))();
        } else {
          // Run the cancelation effects. We alias `count` because it's mutable.
          kid = 0;
          tmp = count;

          for (; kid < tmp; kid++) {
            kills[kid] = kills[kid]();
          }
        }

        return kills;
      } // When a fiber resolves, we need to bubble back up the tree with the
      // result, computing the applicative nodes.


      function join(result, head, tail) {
        var fail, step, lhs, rhs, tmp, kid;

        if (util.isLeft(result)) {
          fail = result;
          step = null;
        } else {
          step = result;
          fail = null;
        }

        loop: while (true) {
          lhs = null;
          rhs = null;
          tmp = null;
          kid = null; // We should never continue if the entire tree has been interrupted.

          if (interrupt !== null) {
            return;
          } // We've made it all the way to the root of the tree, which means
          // the tree has fully evaluated.


          if (head === null) {
            cb(fail || step)();
            return;
          } // The tree has already been computed, so we shouldn't try to do it
          // again. This should never happen.
          // TODO: Remove this?


          if (head._3 !== EMPTY) {
            return;
          }

          switch (head.tag) {
            case MAP:
              if (fail === null) {
                head._3 = util.right(head._1(util.fromRight(step)));
                step = head._3;
              } else {
                head._3 = fail;
              }

              break;

            case APPLY:
              lhs = head._1._3;
              rhs = head._2._3; // If we have a failure we should kill the other side because we
              // can't possible yield a result anymore.

              if (fail) {
                head._3 = fail;
                tmp = true;
                kid = killId++;
                kills[kid] = kill(early, fail === lhs ? head._2 : head._1, function ()
                /* unused */
                {
                  return function () {
                    delete kills[kid];

                    if (tmp) {
                      tmp = false;
                    } else if (tail === null) {
                      join(fail, null, null);
                    } else {
                      join(fail, tail._1, tail._2);
                    }
                  };
                });

                if (tmp) {
                  tmp = false;
                  return;
                }
              } else if (lhs === EMPTY || rhs === EMPTY) {
                // We can only proceed if both sides have resolved.
                return;
              } else {
                step = util.right(util.fromRight(lhs)(util.fromRight(rhs)));
                head._3 = step;
              }

              break;

            case ALT:
              lhs = head._1._3;
              rhs = head._2._3; // We can only proceed if both have resolved or we have a success

              if (lhs === EMPTY && util.isLeft(rhs) || rhs === EMPTY && util.isLeft(lhs)) {
                return;
              } // If both sides resolve with an error, we should continue with the
              // first error


              if (lhs !== EMPTY && util.isLeft(lhs) && rhs !== EMPTY && util.isLeft(rhs)) {
                fail = step === lhs ? rhs : lhs;
                step = null;
                head._3 = fail;
              } else {
                head._3 = step;
                tmp = true;
                kid = killId++; // Once a side has resolved, we need to cancel the side that is still
                // pending before we can continue.

                kills[kid] = kill(early, step === lhs ? head._2 : head._1, function ()
                /* unused */
                {
                  return function () {
                    delete kills[kid];

                    if (tmp) {
                      tmp = false;
                    } else if (tail === null) {
                      join(step, null, null);
                    } else {
                      join(step, tail._1, tail._2);
                    }
                  };
                });

                if (tmp) {
                  tmp = false;
                  return;
                }
              }

              break;
          }

          if (tail === null) {
            head = null;
          } else {
            head = tail._1;
            tail = tail._2;
          }
        }
      }

      function resolve(fiber) {
        return function (result) {
          return function () {
            delete fibers[fiber._1];
            fiber._3 = result;
            join(result, fiber._2._1, fiber._2._2);
          };
        };
      } // Walks the applicative tree, substituting non-applicative nodes with
      // `FORKED` nodes. In this tree, all applicative nodes use the `_3` slot
      // as a mutable slot for memoization. In an unresolved state, the `_3`
      // slot is `EMPTY`. In the cases of `ALT` and `APPLY`, we always walk
      // the left side first, because both operations are left-associative. As
      // we `RETURN` from those branches, we then walk the right side.


      function run() {
        var status = CONTINUE;
        var step = par;
        var head = null;
        var tail = null;
        var tmp, fid;

        loop: while (true) {
          tmp = null;
          fid = null;

          switch (status) {
            case CONTINUE:
              switch (step.tag) {
                case MAP:
                  if (head) {
                    tail = new Aff(CONS, head, tail);
                  }

                  head = new Aff(MAP, step._1, EMPTY, EMPTY);
                  step = step._2;
                  break;

                case APPLY:
                  if (head) {
                    tail = new Aff(CONS, head, tail);
                  }

                  head = new Aff(APPLY, EMPTY, step._2, EMPTY);
                  step = step._1;
                  break;

                case ALT:
                  if (head) {
                    tail = new Aff(CONS, head, tail);
                  }

                  head = new Aff(ALT, EMPTY, step._2, EMPTY);
                  step = step._1;
                  break;

                default:
                  // When we hit a leaf value, we suspend the stack in the `FORKED`.
                  // When the fiber resolves, it can bubble back up the tree.
                  fid = fiberId++;
                  status = RETURN;
                  tmp = step;
                  step = new Aff(FORKED, fid, new Aff(CONS, head, tail), EMPTY);
                  tmp = Fiber(util, supervisor, tmp);
                  tmp.onComplete({
                    rethrow: false,
                    handler: resolve(step)
                  })();
                  fibers[fid] = tmp;

                  if (supervisor) {
                    supervisor.register(tmp);
                  }

              }

              break;

            case RETURN:
              // Terminal case, we are back at the root.
              if (head === null) {
                break loop;
              } // If we are done with the right side, we need to continue down the
              // left. Otherwise we should continue up the stack.


              if (head._1 === EMPTY) {
                head._1 = step;
                status = CONTINUE;
                step = head._2;
                head._2 = EMPTY;
              } else {
                head._2 = step;
                step = head;

                if (tail === null) {
                  head = null;
                } else {
                  head = tail._1;
                  tail = tail._2;
                }
              }

          }
        } // Keep a reference to the tree root so it can be cancelled.


        root = step;

        for (fid = 0; fid < fiberId; fid++) {
          fibers[fid].run();
        }
      } // Cancels the entire tree. If there are already subtrees being canceled,
      // we need to first cancel those joins. We will then add fresh joins for
      // all pending branches including those that were in the process of being
      // canceled.


      function cancel(error, cb) {
        interrupt = util.left(error);
        var innerKills;

        for (var kid in kills) {
          if (kills.hasOwnProperty(kid)) {
            innerKills = kills[kid];

            for (kid in innerKills) {
              if (innerKills.hasOwnProperty(kid)) {
                innerKills[kid]();
              }
            }
          }
        }

        kills = null;
        var newKills = kill(error, root, cb);
        return function (killError) {
          return new Aff(ASYNC, function (killCb) {
            return function () {
              for (var kid in newKills) {
                if (newKills.hasOwnProperty(kid)) {
                  newKills[kid]();
                }
              }

              return nonCanceler;
            };
          });
        };
      }

      run();
      return function (killError) {
        return new Aff(ASYNC, function (killCb) {
          return function () {
            return cancel(killError, killCb);
          };
        });
      };
    }

    function sequential(util, supervisor, par) {
      return new Aff(ASYNC, function (cb) {
        return function () {
          return runPar(util, supervisor, par, cb);
        };
      });
    }

    Aff.EMPTY = EMPTY;
    Aff.Pure = AffCtr(PURE);
    Aff.Throw = AffCtr(THROW);
    Aff.Catch = AffCtr(CATCH);
    Aff.Sync = AffCtr(SYNC);
    Aff.Async = AffCtr(ASYNC);
    Aff.Bind = AffCtr(BIND);
    Aff.Bracket = AffCtr(BRACKET);
    Aff.Fork = AffCtr(FORK);
    Aff.Seq = AffCtr(SEQ);
    Aff.ParMap = AffCtr(MAP);
    Aff.ParApply = AffCtr(APPLY);
    Aff.ParAlt = AffCtr(ALT);
    Aff.Fiber = Fiber;
    Aff.Supervisor = Supervisor;
    Aff.Scheduler = Scheduler;
    Aff.nonCanceler = nonCanceler;
    return Aff;
  }();

  exports._pure = Aff.Pure;
  exports._throwError = Aff.Throw;

  exports._catchError = function (aff) {
    return function (k) {
      return Aff.Catch(aff, k);
    };
  };

  exports._map = function (f) {
    return function (aff) {
      if (aff.tag === Aff.Pure.tag) {
        return Aff.Pure(f(aff._1));
      } else {
        return Aff.Bind(aff, function (value) {
          return Aff.Pure(f(value));
        });
      }
    };
  };

  exports._bind = function (aff) {
    return function (k) {
      return Aff.Bind(aff, k);
    };
  };

  exports._fork = function (immediate) {
    return function (aff) {
      return Aff.Fork(immediate, aff);
    };
  };

  exports._liftEffect = Aff.Sync;

  exports._parAffMap = function (f) {
    return function (aff) {
      return Aff.ParMap(f, aff);
    };
  };

  exports._parAffApply = function (aff1) {
    return function (aff2) {
      return Aff.ParApply(aff1, aff2);
    };
  };

  exports.makeAff = Aff.Async;

  exports.generalBracket = function (acquire) {
    return function (options) {
      return function (k) {
        return Aff.Bracket(acquire, options, k);
      };
    };
  };

  exports._makeFiber = function (util, aff) {
    return function () {
      return Aff.Fiber(util, null, aff);
    };
  };

  exports._sequential = Aff.Seq;
})(PS["Effect.Aff"] = PS["Effect.Aff"] || {});

(function (exports) {
  "use strict";

  exports.pureE = function (a) {
    return function () {
      return a;
    };
  };

  exports.bindE = function (a) {
    return function (f) {
      return function () {
        return f(a())();
      };
    };
  };
})(PS["Effect"] = PS["Effect"] || {});

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Effect"] = $PS["Effect"] || {};
  var exports = $PS["Effect"];
  var $foreign = $PS["Effect"];
  var Control_Applicative = $PS["Control.Applicative"];
  var Control_Apply = $PS["Control.Apply"];
  var Control_Bind = $PS["Control.Bind"];
  var Control_Monad = $PS["Control.Monad"];
  var Data_Functor = $PS["Data.Functor"];
  var monadEffect = new Control_Monad.Monad(function () {
    return applicativeEffect;
  }, function () {
    return bindEffect;
  });
  var bindEffect = new Control_Bind.Bind(function () {
    return applyEffect;
  }, $foreign.bindE);
  var applyEffect = new Control_Apply.Apply(function () {
    return functorEffect;
  }, Control_Monad.ap(monadEffect));
  var applicativeEffect = new Control_Applicative.Applicative(function () {
    return applyEffect;
  }, $foreign.pureE);
  var functorEffect = new Data_Functor.Functor(Control_Applicative.liftA1(applicativeEffect));
  exports["functorEffect"] = functorEffect;
  exports["applicativeEffect"] = applicativeEffect;
  exports["bindEffect"] = bindEffect;
  exports["monadEffect"] = monadEffect;
})(PS);

(function (exports) {
  "use strict";

  exports.new = function (val) {
    return function () {
      return {
        value: val
      };
    };
  };

  exports.read = function (ref) {
    return function () {
      return ref.value;
    };
  };

  exports.modifyImpl = function (f) {
    return function (ref) {
      return function () {
        var t = f(ref.value);
        ref.value = t.state;
        return t.value;
      };
    };
  };

  exports.write = function (val) {
    return function (ref) {
      return function () {
        ref.value = val;
      };
    };
  };
})(PS["Effect.Ref"] = PS["Effect.Ref"] || {});

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Effect.Ref"] = $PS["Effect.Ref"] || {};
  var exports = $PS["Effect.Ref"];
  var $foreign = $PS["Effect.Ref"];
  var Data_Functor = $PS["Data.Functor"];
  var Effect = $PS["Effect"];
  var modify$prime = $foreign.modifyImpl;

  var modify = function modify(f) {
    return modify$prime(function (s) {
      var s$prime = f(s);
      return {
        state: s$prime,
        value: s$prime
      };
    });
  };

  var modify_ = function modify_(f) {
    return function (s) {
      return Data_Functor["void"](Effect.functorEffect)(modify(f)(s));
    };
  };

  exports["modify'"] = modify$prime;
  exports["modify_"] = modify_;
  exports["new"] = $foreign["new"];
  exports["read"] = $foreign.read;
  exports["write"] = $foreign.write;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Control.Monad.Rec.Class"] = $PS["Control.Monad.Rec.Class"] || {};
  var exports = $PS["Control.Monad.Rec.Class"];
  var Control_Bind = $PS["Control.Bind"];
  var Data_Functor = $PS["Data.Functor"];
  var Effect = $PS["Effect"];
  var Effect_Ref = $PS["Effect.Ref"];

  var Loop = function () {
    function Loop(value0) {
      this.value0 = value0;
    }

    ;

    Loop.create = function (value0) {
      return new Loop(value0);
    };

    return Loop;
  }();

  var Done = function () {
    function Done(value0) {
      this.value0 = value0;
    }

    ;

    Done.create = function (value0) {
      return new Done(value0);
    };

    return Done;
  }();

  var MonadRec = function MonadRec(Monad0, tailRecM) {
    this.Monad0 = Monad0;
    this.tailRecM = tailRecM;
  };

  var tailRecM = function tailRecM(dict) {
    return dict.tailRecM;
  };

  var monadRecEffect = new MonadRec(function () {
    return Effect.monadEffect;
  }, function (f) {
    return function (a) {
      var fromDone = function fromDone(v) {
        if (v instanceof Done) {
          return v.value0;
        }

        ;
        throw new Error("Failed pattern match at Control.Monad.Rec.Class (line 113, column 30 - line 113, column 44): " + [v.constructor.name]);
      };

      return function __do() {
        var r = Control_Bind.bindFlipped(Effect.bindEffect)(Effect_Ref["new"])(f(a))();

        (function () {
          while (!function __do() {
            var v = Effect_Ref.read(r)();

            if (v instanceof Loop) {
              var e = f(v.value0)();
              Effect_Ref.write(e)(r)();
              return false;
            }

            ;

            if (v instanceof Done) {
              return true;
            }

            ;
            throw new Error("Failed pattern match at Control.Monad.Rec.Class (line 104, column 22 - line 109, column 28): " + [v.constructor.name]);
          }()) {}

          ;
          return {};
        })();

        return Data_Functor.map(Effect.functorEffect)(fromDone)(Effect_Ref.read(r))();
      };
    };
  });
  exports["Loop"] = Loop;
  exports["Done"] = Done;
  exports["MonadRec"] = MonadRec;
  exports["tailRecM"] = tailRecM;
  exports["monadRecEffect"] = monadRecEffect;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Control.Parallel.Class"] = $PS["Control.Parallel.Class"] || {};
  var exports = $PS["Control.Parallel.Class"];

  var Parallel = function Parallel(Applicative1, Monad0, parallel, sequential) {
    this.Applicative1 = Applicative1;
    this.Monad0 = Monad0;
    this.parallel = parallel;
    this.sequential = sequential;
  };

  var sequential = function sequential(dict) {
    return dict.sequential;
  };

  var parallel = function parallel(dict) {
    return dict.parallel;
  };

  exports["parallel"] = parallel;
  exports["sequential"] = sequential;
  exports["Parallel"] = Parallel;
})(PS);

(function (exports) {
  "use strict"; // jshint maxparams: 3

  exports.traverseArrayImpl = function () {
    function array1(a) {
      return [a];
    }

    function array2(a) {
      return function (b) {
        return [a, b];
      };
    }

    function array3(a) {
      return function (b) {
        return function (c) {
          return [a, b, c];
        };
      };
    }

    function concat2(xs) {
      return function (ys) {
        return xs.concat(ys);
      };
    }

    return function (apply) {
      return function (map) {
        return function (pure) {
          return function (f) {
            return function (array) {
              function go(bot, top) {
                switch (top - bot) {
                  case 0:
                    return pure([]);

                  case 1:
                    return map(array1)(f(array[bot]));

                  case 2:
                    return apply(map(array2)(f(array[bot])))(f(array[bot + 1]));

                  case 3:
                    return apply(apply(map(array3)(f(array[bot])))(f(array[bot + 1])))(f(array[bot + 2]));

                  default:
                    // This slightly tricky pivot selection aims to produce two
                    // even-length partitions where possible.
                    var pivot = bot + Math.floor((top - bot) / 4) * 2;
                    return apply(map(concat2)(go(bot, pivot)))(go(pivot, top));
                }
              }

              return go(0, array.length);
            };
          };
        };
      };
    };
  }();
})(PS["Data.Traversable"] = PS["Data.Traversable"] || {});

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Data.Traversable"] = $PS["Data.Traversable"] || {};
  var exports = $PS["Data.Traversable"];
  var $foreign = $PS["Data.Traversable"];
  var Control_Applicative = $PS["Control.Applicative"];
  var Control_Apply = $PS["Control.Apply"];
  var Control_Category = $PS["Control.Category"];
  var Data_Either = $PS["Data.Either"];
  var Data_Foldable = $PS["Data.Foldable"];
  var Data_Functor = $PS["Data.Functor"];

  var Traversable = function Traversable(Foldable1, Functor0, sequence, traverse) {
    this.Foldable1 = Foldable1;
    this.Functor0 = Functor0;
    this.sequence = sequence;
    this.traverse = traverse;
  };

  var traverse = function traverse(dict) {
    return dict.traverse;
  };

  var traversableEither = new Traversable(function () {
    return Data_Foldable.foldableEither;
  }, function () {
    return Data_Either.functorEither;
  }, function (dictApplicative) {
    return function (v) {
      if (v instanceof Data_Either.Left) {
        return Control_Applicative.pure(dictApplicative)(new Data_Either.Left(v.value0));
      }

      ;

      if (v instanceof Data_Either.Right) {
        return Data_Functor.map(dictApplicative.Apply0().Functor0())(Data_Either.Right.create)(v.value0);
      }

      ;
      throw new Error("Failed pattern match at Data.Traversable (line 149, column 1 - line 153, column 36): " + [v.constructor.name]);
    };
  }, function (dictApplicative) {
    return function (v) {
      return function (v1) {
        if (v1 instanceof Data_Either.Left) {
          return Control_Applicative.pure(dictApplicative)(new Data_Either.Left(v1.value0));
        }

        ;

        if (v1 instanceof Data_Either.Right) {
          return Data_Functor.map(dictApplicative.Apply0().Functor0())(Data_Either.Right.create)(v(v1.value0));
        }

        ;
        throw new Error("Failed pattern match at Data.Traversable (line 149, column 1 - line 153, column 36): " + [v.constructor.name, v1.constructor.name]);
      };
    };
  });

  var sequenceDefault = function sequenceDefault(dictTraversable) {
    return function (dictApplicative) {
      return traverse(dictTraversable)(dictApplicative)(Control_Category.identity(Control_Category.categoryFn));
    };
  };

  var traversableArray = new Traversable(function () {
    return Data_Foldable.foldableArray;
  }, function () {
    return Data_Functor.functorArray;
  }, function (dictApplicative) {
    return sequenceDefault(traversableArray)(dictApplicative);
  }, function (dictApplicative) {
    return $foreign.traverseArrayImpl(Control_Apply.apply(dictApplicative.Apply0()))(Data_Functor.map(dictApplicative.Apply0().Functor0()))(Control_Applicative.pure(dictApplicative));
  });

  var sequence = function sequence(dict) {
    return dict.sequence;
  };

  exports["traverse"] = traverse;
  exports["sequence"] = sequence;
  exports["traversableArray"] = traversableArray;
  exports["traversableEither"] = traversableEither;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Control.Parallel"] = $PS["Control.Parallel"] || {};
  var exports = $PS["Control.Parallel"];
  var Control_Category = $PS["Control.Category"];
  var Control_Parallel_Class = $PS["Control.Parallel.Class"];
  var Data_Foldable = $PS["Data.Foldable"];
  var Data_Traversable = $PS["Data.Traversable"];

  var parTraverse_ = function parTraverse_(dictParallel) {
    return function (dictFoldable) {
      return function (f) {
        var $17 = Control_Parallel_Class.sequential(dictParallel);
        var $18 = Data_Foldable.traverse_(dictParallel.Applicative1())(dictFoldable)(function () {
          var $20 = Control_Parallel_Class.parallel(dictParallel);
          return function ($21) {
            return $20(f($21));
          };
        }());
        return function ($19) {
          return $17($18($19));
        };
      };
    };
  };

  var parTraverse = function parTraverse(dictParallel) {
    return function (dictTraversable) {
      return function (f) {
        var $22 = Control_Parallel_Class.sequential(dictParallel);
        var $23 = Data_Traversable.traverse(dictTraversable)(dictParallel.Applicative1())(function () {
          var $25 = Control_Parallel_Class.parallel(dictParallel);
          return function ($26) {
            return $25(f($26));
          };
        }());
        return function ($24) {
          return $22($23($24));
        };
      };
    };
  };

  var parSequence_ = function parSequence_(dictParallel) {
    return function (dictFoldable) {
      return parTraverse_(dictParallel)(dictFoldable)(Control_Category.identity(Control_Category.categoryFn));
    };
  };

  var parSequence = function parSequence(dictParallel) {
    return function (dictTraversable) {
      return parTraverse(dictParallel)(dictTraversable)(Control_Category.identity(Control_Category.categoryFn));
    };
  };

  exports["parSequence"] = parSequence;
  exports["parSequence_"] = parSequence_;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Effect.Class"] = $PS["Effect.Class"] || {};
  var exports = $PS["Effect.Class"];
  var Control_Category = $PS["Control.Category"];
  var Effect = $PS["Effect"];

  var MonadEffect = function MonadEffect(Monad0, liftEffect) {
    this.Monad0 = Monad0;
    this.liftEffect = liftEffect;
  };

  var monadEffectEffect = new MonadEffect(function () {
    return Effect.monadEffect;
  }, Control_Category.identity(Control_Category.categoryFn));

  var liftEffect = function liftEffect(dict) {
    return dict.liftEffect;
  };

  exports["liftEffect"] = liftEffect;
  exports["MonadEffect"] = MonadEffect;
  exports["monadEffectEffect"] = monadEffectEffect;
})(PS);

(function (exports) {
  "use strict";

  exports.unsafePerformEffect = function (f) {
    return f();
  };
})(PS["Effect.Unsafe"] = PS["Effect.Unsafe"] || {});

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Effect.Unsafe"] = $PS["Effect.Unsafe"] || {};
  var exports = $PS["Effect.Unsafe"];
  var $foreign = $PS["Effect.Unsafe"];
  exports["unsafePerformEffect"] = $foreign.unsafePerformEffect;
})(PS);

(function (exports) {
  "use strict"; // module Partial.Unsafe

  exports._unsafePartial = function (f) {
    return f();
  };
})(PS["Partial.Unsafe"] = PS["Partial.Unsafe"] || {});

(function (exports) {
  "use strict"; // module Partial

  exports._crashWith = function (msg) {
    throw new Error(msg);
  };
})(PS["Partial"] = PS["Partial"] || {});

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Partial"] = $PS["Partial"] || {};
  var exports = $PS["Partial"];
  var $foreign = $PS["Partial"];

  var crashWith = function crashWith(dictPartial) {
    return $foreign["_crashWith"];
  };

  exports["crashWith"] = crashWith;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Partial.Unsafe"] = $PS["Partial.Unsafe"] || {};
  var exports = $PS["Partial.Unsafe"];
  var $foreign = $PS["Partial.Unsafe"];
  var Partial = $PS["Partial"];
  var unsafePartial = $foreign["_unsafePartial"];

  var unsafeCrashWith = function unsafeCrashWith(msg) {
    return unsafePartial(function (dictPartial) {
      return Partial.crashWith()(msg);
    });
  };

  exports["unsafeCrashWith"] = unsafeCrashWith;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Effect.Aff"] = $PS["Effect.Aff"] || {};
  var exports = $PS["Effect.Aff"];
  var $foreign = $PS["Effect.Aff"];
  var Control_Applicative = $PS["Control.Applicative"];
  var Control_Apply = $PS["Control.Apply"];
  var Control_Bind = $PS["Control.Bind"];
  var Control_Monad = $PS["Control.Monad"];
  var Control_Monad_Error_Class = $PS["Control.Monad.Error.Class"];
  var Control_Monad_Rec_Class = $PS["Control.Monad.Rec.Class"];
  var Control_Parallel = $PS["Control.Parallel"];
  var Control_Parallel_Class = $PS["Control.Parallel.Class"];
  var Data_Either = $PS["Data.Either"];
  var Data_Foldable = $PS["Data.Foldable"];
  var Data_Function = $PS["Data.Function"];
  var Data_Functor = $PS["Data.Functor"];
  var Data_Monoid = $PS["Data.Monoid"];
  var Data_Semigroup = $PS["Data.Semigroup"];
  var Data_Unit = $PS["Data.Unit"];
  var Effect = $PS["Effect"];
  var Effect_Class = $PS["Effect.Class"];
  var Effect_Unsafe = $PS["Effect.Unsafe"];
  var Partial_Unsafe = $PS["Partial.Unsafe"];
  var Unsafe_Coerce = $PS["Unsafe.Coerce"];

  var Canceler = function Canceler(x) {
    return x;
  };

  var suspendAff = $foreign["_fork"](false);
  var functorParAff = new Data_Functor.Functor($foreign["_parAffMap"]);
  var functorAff = new Data_Functor.Functor($foreign["_map"]);
  var forkAff = $foreign["_fork"](true);

  var ffiUtil = function () {
    var unsafeFromRight = function unsafeFromRight(v) {
      if (v instanceof Data_Either.Right) {
        return v.value0;
      }

      ;

      if (v instanceof Data_Either.Left) {
        return Partial_Unsafe.unsafeCrashWith("unsafeFromRight: Left");
      }

      ;
      throw new Error("Failed pattern match at Effect.Aff (line 404, column 21 - line 406, column 54): " + [v.constructor.name]);
    };

    var unsafeFromLeft = function unsafeFromLeft(v) {
      if (v instanceof Data_Either.Left) {
        return v.value0;
      }

      ;

      if (v instanceof Data_Either.Right) {
        return Partial_Unsafe.unsafeCrashWith("unsafeFromLeft: Right");
      }

      ;
      throw new Error("Failed pattern match at Effect.Aff (line 399, column 20 - line 401, column 54): " + [v.constructor.name]);
    };

    var isLeft = function isLeft(v) {
      if (v instanceof Data_Either.Left) {
        return true;
      }

      ;

      if (v instanceof Data_Either.Right) {
        return false;
      }

      ;
      throw new Error("Failed pattern match at Effect.Aff (line 394, column 12 - line 396, column 20): " + [v.constructor.name]);
    };

    return {
      isLeft: isLeft,
      fromLeft: unsafeFromLeft,
      fromRight: unsafeFromRight,
      left: Data_Either.Left.create,
      right: Data_Either.Right.create
    };
  }();

  var makeFiber = function makeFiber(aff) {
    return $foreign["_makeFiber"](ffiUtil, aff);
  };

  var launchAff = function launchAff(aff) {
    return function __do() {
      var fiber = makeFiber(aff)();
      fiber.run();
      return fiber;
    };
  };

  var launchAff_ = function () {
    var $40 = Data_Functor["void"](Effect.functorEffect);
    return function ($41) {
      return $40(launchAff($41));
    };
  }();

  var bracket = function bracket(acquire) {
    return function (completed) {
      return $foreign.generalBracket(acquire)({
        killed: Data_Function["const"](completed),
        failed: Data_Function["const"](completed),
        completed: Data_Function["const"](completed)
      });
    };
  };

  var applyParAff = new Control_Apply.Apply(function () {
    return functorParAff;
  }, $foreign["_parAffApply"]);
  var monadAff = new Control_Monad.Monad(function () {
    return applicativeAff;
  }, function () {
    return bindAff;
  });
  var bindAff = new Control_Bind.Bind(function () {
    return applyAff;
  }, $foreign["_bind"]);
  var applyAff = new Control_Apply.Apply(function () {
    return functorAff;
  }, Control_Monad.ap(monadAff));
  var applicativeAff = new Control_Applicative.Applicative(function () {
    return applyAff;
  }, $foreign["_pure"]);

  var $$finally = function $$finally(fin) {
    return function (a) {
      return bracket(Control_Applicative.pure(applicativeAff)(Data_Unit.unit))(Data_Function["const"](fin))(Data_Function["const"](a));
    };
  };

  var monadEffectAff = new Effect_Class.MonadEffect(function () {
    return monadAff;
  }, $foreign["_liftEffect"]);

  var effectCanceler = function () {
    var $42 = Effect_Class.liftEffect(monadEffectAff);
    return function ($43) {
      return Canceler(Data_Function["const"]($42($43)));
    };
  }();

  var joinFiber = function joinFiber(v) {
    return $foreign.makeAff(function (k) {
      return Data_Functor.map(Effect.functorEffect)(effectCanceler)(v.join(k));
    });
  };

  var functorFiber = new Data_Functor.Functor(function (f) {
    return function (t) {
      return Effect_Unsafe.unsafePerformEffect(makeFiber(Data_Functor.map(functorAff)(f)(joinFiber(t))));
    };
  });

  var killFiber = function killFiber(e) {
    return function (v) {
      return Control_Bind.bind(bindAff)(Effect_Class.liftEffect(monadEffectAff)(v.isSuspended))(function (v1) {
        if (v1) {
          return Effect_Class.liftEffect(monadEffectAff)(Data_Functor["void"](Effect.functorEffect)(v.kill(e, Data_Function["const"](Control_Applicative.pure(Effect.applicativeEffect)(Data_Unit.unit)))));
        }

        ;
        return $foreign.makeAff(function (k) {
          return Data_Functor.map(Effect.functorEffect)(effectCanceler)(v.kill(e, k));
        });
      });
    };
  };

  var monadThrowAff = new Control_Monad_Error_Class.MonadThrow(function () {
    return monadAff;
  }, $foreign["_throwError"]);
  var monadErrorAff = new Control_Monad_Error_Class.MonadError(function () {
    return monadThrowAff;
  }, $foreign["_catchError"]);
  var attempt = Control_Monad_Error_Class["try"](monadErrorAff);

  var runAff = function runAff(k) {
    return function (aff) {
      return launchAff(Control_Bind.bindFlipped(bindAff)(function () {
        var $46 = Effect_Class.liftEffect(monadEffectAff);
        return function ($47) {
          return $46(k($47));
        };
      }())(Control_Monad_Error_Class["try"](monadErrorAff)(aff)));
    };
  };

  var runAff_ = function runAff_(k) {
    return function (aff) {
      return Data_Functor["void"](Effect.functorEffect)(runAff(k)(aff));
    };
  };

  var parallelAff = new Control_Parallel_Class.Parallel(function () {
    return applicativeParAff;
  }, function () {
    return monadAff;
  }, Unsafe_Coerce.unsafeCoerce, $foreign["_sequential"]);
  var applicativeParAff = new Control_Applicative.Applicative(function () {
    return applyParAff;
  }, function () {
    var $50 = Control_Parallel_Class.parallel(parallelAff);
    var $51 = Control_Applicative.pure(applicativeAff);
    return function ($52) {
      return $50($51($52));
    };
  }());
  var semigroupCanceler = new Data_Semigroup.Semigroup(function (v) {
    return function (v1) {
      return function (err) {
        return Control_Parallel.parSequence_(parallelAff)(Data_Foldable.foldableArray)([v(err), v1(err)]);
      };
    };
  });
  var monadRecAff = new Control_Monad_Rec_Class.MonadRec(function () {
    return monadAff;
  }, function (k) {
    var go = function go(a) {
      return Control_Bind.bind(bindAff)(k(a))(function (res) {
        if (res instanceof Control_Monad_Rec_Class.Done) {
          return Control_Applicative.pure(applicativeAff)(res.value0);
        }

        ;

        if (res instanceof Control_Monad_Rec_Class.Loop) {
          return go(res.value0);
        }

        ;
        throw new Error("Failed pattern match at Effect.Aff (line 102, column 7 - line 104, column 22): " + [res.constructor.name]);
      });
    };

    return go;
  });
  var nonCanceler = Data_Function["const"](Control_Applicative.pure(applicativeAff)(Data_Unit.unit));
  var monoidCanceler = new Data_Monoid.Monoid(function () {
    return semigroupCanceler;
  }, nonCanceler);
  exports["launchAff_"] = launchAff_;
  exports["runAff_"] = runAff_;
  exports["forkAff"] = forkAff;
  exports["suspendAff"] = suspendAff;
  exports["attempt"] = attempt;
  exports["finally"] = $$finally;
  exports["killFiber"] = killFiber;
  exports["joinFiber"] = joinFiber;
  exports["nonCanceler"] = nonCanceler;
  exports["effectCanceler"] = effectCanceler;
  exports["functorAff"] = functorAff;
  exports["applyAff"] = applyAff;
  exports["applicativeAff"] = applicativeAff;
  exports["bindAff"] = bindAff;
  exports["monadAff"] = monadAff;
  exports["monadRecAff"] = monadRecAff;
  exports["monadThrowAff"] = monadThrowAff;
  exports["monadEffectAff"] = monadEffectAff;
  exports["applicativeParAff"] = applicativeParAff;
  exports["parallelAff"] = parallelAff;
  exports["functorFiber"] = functorFiber;
  exports["monoidCanceler"] = monoidCanceler;
  exports["makeAff"] = $foreign.makeAff;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Control.Monad.Fork.Class"] = $PS["Control.Monad.Fork.Class"] || {};
  var exports = $PS["Control.Monad.Fork.Class"];
  var Effect_Aff = $PS["Effect.Aff"];

  var MonadFork = function MonadFork(Functor1, Monad0, fork, join, suspend) {
    this.Functor1 = Functor1;
    this.Monad0 = Monad0;
    this.fork = fork;
    this.join = join;
    this.suspend = suspend;
  };

  var monadForkAff = new MonadFork(function () {
    return Effect_Aff.functorFiber;
  }, function () {
    return Effect_Aff.monadAff;
  }, Effect_Aff.forkAff, Effect_Aff.joinFiber, Effect_Aff.suspendAff);

  var fork = function fork(dict) {
    return dict.fork;
  };

  exports["fork"] = fork;
  exports["monadForkAff"] = monadForkAff;
})(PS);

(function (exports) {
  "use strict";

  exports.unfoldrArrayImpl = function (isNothing) {
    return function (fromJust) {
      return function (fst) {
        return function (snd) {
          return function (f) {
            return function (b) {
              var result = [];
              var value = b;

              while (true) {
                // eslint-disable-line no-constant-condition
                var maybe = f(value);
                if (isNothing(maybe)) return result;
                var tuple = fromJust(maybe);
                result.push(fst(tuple));
                value = snd(tuple);
              }
            };
          };
        };
      };
    };
  };
})(PS["Data.Unfoldable"] = PS["Data.Unfoldable"] || {});

(function (exports) {
  "use strict";

  exports.unfoldr1ArrayImpl = function (isNothing) {
    return function (fromJust) {
      return function (fst) {
        return function (snd) {
          return function (f) {
            return function (b) {
              var result = [];
              var value = b;

              while (true) {
                // eslint-disable-line no-constant-condition
                var tuple = f(value);
                result.push(fst(tuple));
                var maybe = snd(tuple);
                if (isNothing(maybe)) return result;
                value = fromJust(maybe);
              }
            };
          };
        };
      };
    };
  };
})(PS["Data.Unfoldable1"] = PS["Data.Unfoldable1"] || {});

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Data.Unfoldable1"] = $PS["Data.Unfoldable1"] || {};
  var exports = $PS["Data.Unfoldable1"];
  var $foreign = $PS["Data.Unfoldable1"];
  var Data_Maybe = $PS["Data.Maybe"];
  var Data_Tuple = $PS["Data.Tuple"];

  var Unfoldable1 = function Unfoldable1(unfoldr1) {
    this.unfoldr1 = unfoldr1;
  };

  var unfoldable1Array = new Unfoldable1($foreign.unfoldr1ArrayImpl(Data_Maybe.isNothing)(Data_Maybe.fromJust())(Data_Tuple.fst)(Data_Tuple.snd));
  exports["unfoldable1Array"] = unfoldable1Array;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Data.Unfoldable"] = $PS["Data.Unfoldable"] || {};
  var exports = $PS["Data.Unfoldable"];
  var $foreign = $PS["Data.Unfoldable"];
  var Data_Maybe = $PS["Data.Maybe"];
  var Data_Tuple = $PS["Data.Tuple"];
  var Data_Unfoldable1 = $PS["Data.Unfoldable1"];

  var Unfoldable = function Unfoldable(Unfoldable10, unfoldr) {
    this.Unfoldable10 = Unfoldable10;
    this.unfoldr = unfoldr;
  };

  var unfoldr = function unfoldr(dict) {
    return dict.unfoldr;
  };

  var unfoldableArray = new Unfoldable(function () {
    return Data_Unfoldable1.unfoldable1Array;
  }, $foreign.unfoldrArrayImpl(Data_Maybe.isNothing)(Data_Maybe.fromJust())(Data_Tuple.fst)(Data_Tuple.snd));
  exports["unfoldr"] = unfoldr;
  exports["unfoldableArray"] = unfoldableArray;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Data.List"] = $PS["Data.List"] || {};
  var exports = $PS["Data.List"];
  var Data_Functor = $PS["Data.Functor"];
  var Data_List_Types = $PS["Data.List.Types"];
  var Data_Maybe = $PS["Data.Maybe"];
  var Data_Tuple = $PS["Data.Tuple"];
  var Data_Unfoldable = $PS["Data.Unfoldable"];

  var uncons = function uncons(v) {
    if (v instanceof Data_List_Types.Nil) {
      return Data_Maybe.Nothing.value;
    }

    ;

    if (v instanceof Data_List_Types.Cons) {
      return new Data_Maybe.Just({
        head: v.value0,
        tail: v.value1
      });
    }

    ;
    throw new Error("Failed pattern match at Data.List (line 263, column 1 - line 263, column 66): " + [v.constructor.name]);
  };

  var toUnfoldable = function toUnfoldable(dictUnfoldable) {
    return Data_Unfoldable.unfoldr(dictUnfoldable)(function (xs) {
      return Data_Functor.map(Data_Maybe.functorMaybe)(function (rec) {
        return new Data_Tuple.Tuple(rec.head, rec.tail);
      })(uncons(xs));
    });
  };

  var tail = function tail(v) {
    if (v instanceof Data_List_Types.Nil) {
      return Data_Maybe.Nothing.value;
    }

    ;

    if (v instanceof Data_List_Types.Cons) {
      return new Data_Maybe.Just(v.value1);
    }

    ;
    throw new Error("Failed pattern match at Data.List (line 249, column 1 - line 249, column 43): " + [v.constructor.name]);
  };

  var reverse = function () {
    var go = function go($copy_acc) {
      return function ($copy_v) {
        var $tco_var_acc = $copy_acc;
        var $tco_done = false;
        var $tco_result;

        function $tco_loop(acc, v) {
          if (v instanceof Data_List_Types.Nil) {
            $tco_done = true;
            return acc;
          }

          ;

          if (v instanceof Data_List_Types.Cons) {
            $tco_var_acc = new Data_List_Types.Cons(v.value0, acc);
            $copy_v = v.value1;
            return;
          }

          ;
          throw new Error("Failed pattern match at Data.List (line 372, column 3 - line 372, column 19): " + [acc.constructor.name, v.constructor.name]);
        }

        ;

        while (!$tco_done) {
          $tco_result = $tco_loop($tco_var_acc, $copy_v);
        }

        ;
        return $tco_result;
      };
    };

    return go(Data_List_Types.Nil.value);
  }();

  var $$null = function $$null(v) {
    if (v instanceof Data_List_Types.Nil) {
      return true;
    }

    ;
    return false;
  };

  var head = function head(v) {
    if (v instanceof Data_List_Types.Nil) {
      return Data_Maybe.Nothing.value;
    }

    ;

    if (v instanceof Data_List_Types.Cons) {
      return new Data_Maybe.Just(v.value0);
    }

    ;
    throw new Error("Failed pattern match at Data.List (line 234, column 1 - line 234, column 22): " + [v.constructor.name]);
  };

  exports["toUnfoldable"] = toUnfoldable;
  exports["null"] = $$null;
  exports["reverse"] = reverse;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Data.CatQueue"] = $PS["Data.CatQueue"] || {};
  var exports = $PS["Data.CatQueue"];
  var Data_List = $PS["Data.List"];
  var Data_List_Types = $PS["Data.List.Types"];
  var Data_Maybe = $PS["Data.Maybe"];
  var Data_Tuple = $PS["Data.Tuple"];

  var CatQueue = function () {
    function CatQueue(value0, value1) {
      this.value0 = value0;
      this.value1 = value1;
    }

    ;

    CatQueue.create = function (value0) {
      return function (value1) {
        return new CatQueue(value0, value1);
      };
    };

    return CatQueue;
  }();

  var uncons = function uncons($copy_v) {
    var $tco_done = false;
    var $tco_result;

    function $tco_loop(v) {
      if (v.value0 instanceof Data_List_Types.Nil && v.value1 instanceof Data_List_Types.Nil) {
        $tco_done = true;
        return Data_Maybe.Nothing.value;
      }

      ;

      if (v.value0 instanceof Data_List_Types.Nil) {
        $copy_v = new CatQueue(Data_List.reverse(v.value1), Data_List_Types.Nil.value);
        return;
      }

      ;

      if (v.value0 instanceof Data_List_Types.Cons) {
        $tco_done = true;
        return new Data_Maybe.Just(new Data_Tuple.Tuple(v.value0.value0, new CatQueue(v.value0.value1, v.value1)));
      }

      ;
      throw new Error("Failed pattern match at Data.CatQueue (line 83, column 1 - line 83, column 63): " + [v.constructor.name]);
    }

    ;

    while (!$tco_done) {
      $tco_result = $tco_loop($copy_v);
    }

    ;
    return $tco_result;
  };

  var snoc = function snoc(v) {
    return function (a) {
      return new CatQueue(v.value0, new Data_List_Types.Cons(a, v.value1));
    };
  };

  var $$null = function $$null(v) {
    if (v.value0 instanceof Data_List_Types.Nil && v.value1 instanceof Data_List_Types.Nil) {
      return true;
    }

    ;
    return false;
  };

  var empty = new CatQueue(Data_List_Types.Nil.value, Data_List_Types.Nil.value);
  exports["empty"] = empty;
  exports["null"] = $$null;
  exports["snoc"] = snoc;
  exports["uncons"] = uncons;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Data.CatList"] = $PS["Data.CatList"] || {};
  var exports = $PS["Data.CatList"];
  var Data_CatQueue = $PS["Data.CatQueue"];
  var Data_List_Types = $PS["Data.List.Types"];
  var Data_Maybe = $PS["Data.Maybe"];
  var Data_Semigroup = $PS["Data.Semigroup"];
  var Data_Tuple = $PS["Data.Tuple"];

  var CatNil = function () {
    function CatNil() {}

    ;
    CatNil.value = new CatNil();
    return CatNil;
  }();

  var CatCons = function () {
    function CatCons(value0, value1) {
      this.value0 = value0;
      this.value1 = value1;
    }

    ;

    CatCons.create = function (value0) {
      return function (value1) {
        return new CatCons(value0, value1);
      };
    };

    return CatCons;
  }();

  var link = function link(v) {
    return function (v1) {
      if (v instanceof CatNil) {
        return v1;
      }

      ;

      if (v1 instanceof CatNil) {
        return v;
      }

      ;

      if (v instanceof CatCons) {
        return new CatCons(v.value0, Data_CatQueue.snoc(v.value1)(v1));
      }

      ;
      throw new Error("Failed pattern match at Data.CatList (line 109, column 1 - line 109, column 54): " + [v.constructor.name, v1.constructor.name]);
    };
  };

  var foldr = function foldr(k) {
    return function (b) {
      return function (q) {
        var foldl = function foldl($copy_v) {
          return function ($copy_c) {
            return function ($copy_v1) {
              var $tco_var_v = $copy_v;
              var $tco_var_c = $copy_c;
              var $tco_done = false;
              var $tco_result;

              function $tco_loop(v, c, v1) {
                if (v1 instanceof Data_List_Types.Nil) {
                  $tco_done = true;
                  return c;
                }

                ;

                if (v1 instanceof Data_List_Types.Cons) {
                  $tco_var_v = v;
                  $tco_var_c = v(c)(v1.value0);
                  $copy_v1 = v1.value1;
                  return;
                }

                ;
                throw new Error("Failed pattern match at Data.CatList (line 125, column 3 - line 125, column 59): " + [v.constructor.name, c.constructor.name, v1.constructor.name]);
              }

              ;

              while (!$tco_done) {
                $tco_result = $tco_loop($tco_var_v, $tco_var_c, $copy_v1);
              }

              ;
              return $tco_result;
            };
          };
        };

        var go = function go($copy_xs) {
          return function ($copy_ys) {
            var $tco_var_xs = $copy_xs;
            var $tco_done = false;
            var $tco_result;

            function $tco_loop(xs, ys) {
              var v = Data_CatQueue.uncons(xs);

              if (v instanceof Data_Maybe.Nothing) {
                $tco_done = true;
                return foldl(function (x) {
                  return function (i) {
                    return i(x);
                  };
                })(b)(ys);
              }

              ;

              if (v instanceof Data_Maybe.Just) {
                $tco_var_xs = v.value0.value1;
                $copy_ys = new Data_List_Types.Cons(k(v.value0.value0), ys);
                return;
              }

              ;
              throw new Error("Failed pattern match at Data.CatList (line 121, column 14 - line 123, column 67): " + [v.constructor.name]);
            }

            ;

            while (!$tco_done) {
              $tco_result = $tco_loop($tco_var_xs, $copy_ys);
            }

            ;
            return $tco_result;
          };
        };

        return go(q)(Data_List_Types.Nil.value);
      };
    };
  };

  var uncons = function uncons(v) {
    if (v instanceof CatNil) {
      return Data_Maybe.Nothing.value;
    }

    ;

    if (v instanceof CatCons) {
      return new Data_Maybe.Just(new Data_Tuple.Tuple(v.value0, function () {
        var $44 = Data_CatQueue["null"](v.value1);

        if ($44) {
          return CatNil.value;
        }

        ;
        return foldr(link)(CatNil.value)(v.value1);
      }()));
    }

    ;
    throw new Error("Failed pattern match at Data.CatList (line 100, column 1 - line 100, column 61): " + [v.constructor.name]);
  };

  var empty = CatNil.value;
  var append = link;
  var semigroupCatList = new Data_Semigroup.Semigroup(append);

  var snoc = function snoc(cat) {
    return function (a) {
      return append(cat)(new CatCons(a, Data_CatQueue.empty));
    };
  };

  exports["empty"] = empty;
  exports["snoc"] = snoc;
  exports["uncons"] = uncons;
  exports["semigroupCatList"] = semigroupCatList;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Control.Monad.Free"] = $PS["Control.Monad.Free"] || {};
  var exports = $PS["Control.Monad.Free"];
  var Control_Applicative = $PS["Control.Applicative"];
  var Control_Apply = $PS["Control.Apply"];
  var Control_Bind = $PS["Control.Bind"];
  var Control_Monad = $PS["Control.Monad"];
  var Control_Monad_Rec_Class = $PS["Control.Monad.Rec.Class"];
  var Data_CatList = $PS["Data.CatList"];
  var Data_Functor = $PS["Data.Functor"];
  var Data_Maybe = $PS["Data.Maybe"];
  var Data_Semigroup = $PS["Data.Semigroup"];

  var Free = function () {
    function Free(value0, value1) {
      this.value0 = value0;
      this.value1 = value1;
    }

    ;

    Free.create = function (value0) {
      return function (value1) {
        return new Free(value0, value1);
      };
    };

    return Free;
  }();

  var Return = function () {
    function Return(value0) {
      this.value0 = value0;
    }

    ;

    Return.create = function (value0) {
      return new Return(value0);
    };

    return Return;
  }();

  var Bind = function () {
    function Bind(value0, value1) {
      this.value0 = value0;
      this.value1 = value1;
    }

    ;

    Bind.create = function (value0) {
      return function (value1) {
        return new Bind(value0, value1);
      };
    };

    return Bind;
  }();

  var toView = function toView($copy_v) {
    var $tco_done = false;
    var $tco_result;

    function $tco_loop(v) {
      var runExpF = function runExpF(v2) {
        return v2;
      };

      var concatF = function concatF(v2) {
        return function (r) {
          return new Free(v2.value0, Data_Semigroup.append(Data_CatList.semigroupCatList)(v2.value1)(r));
        };
      };

      if (v.value0 instanceof Return) {
        var v2 = Data_CatList.uncons(v.value1);

        if (v2 instanceof Data_Maybe.Nothing) {
          $tco_done = true;
          return new Return(v.value0.value0);
        }

        ;

        if (v2 instanceof Data_Maybe.Just) {
          $copy_v = concatF(runExpF(v2.value0.value0)(v.value0.value0))(v2.value0.value1);
          return;
        }

        ;
        throw new Error("Failed pattern match at Control.Monad.Free (line 227, column 7 - line 231, column 64): " + [v2.constructor.name]);
      }

      ;

      if (v.value0 instanceof Bind) {
        $tco_done = true;
        return new Bind(v.value0.value0, function (a) {
          return concatF(v.value0.value1(a))(v.value1);
        });
      }

      ;
      throw new Error("Failed pattern match at Control.Monad.Free (line 225, column 3 - line 233, column 56): " + [v.value0.constructor.name]);
    }

    ;

    while (!$tco_done) {
      $tco_result = $tco_loop($copy_v);
    }

    ;
    return $tco_result;
  };

  var fromView = function fromView(f) {
    return new Free(f, Data_CatList.empty);
  };

  var freeMonad = new Control_Monad.Monad(function () {
    return freeApplicative;
  }, function () {
    return freeBind;
  });
  var freeFunctor = new Data_Functor.Functor(function (k) {
    return function (f) {
      return Control_Bind.bindFlipped(freeBind)(function () {
        var $120 = Control_Applicative.pure(freeApplicative);
        return function ($121) {
          return $120(k($121));
        };
      }())(f);
    };
  });
  var freeBind = new Control_Bind.Bind(function () {
    return freeApply;
  }, function (v) {
    return function (k) {
      return new Free(v.value0, Data_CatList.snoc(v.value1)(k));
    };
  });
  var freeApply = new Control_Apply.Apply(function () {
    return freeFunctor;
  }, Control_Monad.ap(freeMonad));
  var freeApplicative = new Control_Applicative.Applicative(function () {
    return freeApply;
  }, function ($122) {
    return fromView(Return.create($122));
  });

  var liftF = function liftF(f) {
    return fromView(new Bind(f, function () {
      var $123 = Control_Applicative.pure(freeApplicative);
      return function ($124) {
        return $123($124);
      };
    }()));
  };

  var substFree = function substFree(k) {
    var go = function go(f) {
      var v = toView(f);

      if (v instanceof Return) {
        return Control_Applicative.pure(freeApplicative)(v.value0);
      }

      ;

      if (v instanceof Bind) {
        return Control_Bind.bind(freeBind)(k(v.value0))(Data_Functor.map(Data_Functor.functorFn)(go)(v.value1));
      }

      ;
      throw new Error("Failed pattern match at Control.Monad.Free (line 168, column 10 - line 170, column 33): " + [v.constructor.name]);
    };

    return go;
  };

  var hoistFree = function hoistFree(k) {
    return substFree(function ($125) {
      return liftF(k($125));
    });
  };

  var foldFree = function foldFree(dictMonadRec) {
    return function (k) {
      var go = function go(f) {
        var v = toView(f);

        if (v instanceof Return) {
          return Data_Functor.map(dictMonadRec.Monad0().Bind1().Apply0().Functor0())(Control_Monad_Rec_Class.Done.create)(Control_Applicative.pure(dictMonadRec.Monad0().Applicative0())(v.value0));
        }

        ;

        if (v instanceof Bind) {
          return Data_Functor.map(dictMonadRec.Monad0().Bind1().Apply0().Functor0())(function ($136) {
            return Control_Monad_Rec_Class.Loop.create(v.value1($136));
          })(k(v.value0));
        }

        ;
        throw new Error("Failed pattern match at Control.Monad.Free (line 158, column 10 - line 160, column 37): " + [v.constructor.name]);
      };

      return Control_Monad_Rec_Class.tailRecM(dictMonadRec)(go);
    };
  };

  exports["liftF"] = liftF;
  exports["hoistFree"] = hoistFree;
  exports["foldFree"] = foldFree;
  exports["freeFunctor"] = freeFunctor;
  exports["freeBind"] = freeBind;
  exports["freeApplicative"] = freeApplicative;
  exports["freeMonad"] = freeMonad;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Control.Monad.Reader.Class"] = $PS["Control.Monad.Reader.Class"] || {};
  var exports = $PS["Control.Monad.Reader.Class"];
  var Data_Functor = $PS["Data.Functor"];

  var MonadAsk = function MonadAsk(Monad0, ask) {
    this.Monad0 = Monad0;
    this.ask = ask;
  };

  var ask = function ask(dict) {
    return dict.ask;
  };

  var asks = function asks(dictMonadAsk) {
    return function (f) {
      return Data_Functor.map(dictMonadAsk.Monad0().Bind1().Apply0().Functor0())(f)(ask(dictMonadAsk));
    };
  };

  exports["ask"] = ask;
  exports["MonadAsk"] = MonadAsk;
  exports["asks"] = asks;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Control.Monad.Trans.Class"] = $PS["Control.Monad.Trans.Class"] || {};
  var exports = $PS["Control.Monad.Trans.Class"];

  var MonadTrans = function MonadTrans(lift) {
    this.lift = lift;
  };

  var lift = function lift(dict) {
    return dict.lift;
  };

  exports["lift"] = lift;
  exports["MonadTrans"] = MonadTrans;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Control.Monad.Reader.Trans"] = $PS["Control.Monad.Reader.Trans"] || {};
  var exports = $PS["Control.Monad.Reader.Trans"];
  var Control_Applicative = $PS["Control.Applicative"];
  var Control_Apply = $PS["Control.Apply"];
  var Control_Bind = $PS["Control.Bind"];
  var Control_Monad = $PS["Control.Monad"];
  var Control_Monad_Reader_Class = $PS["Control.Monad.Reader.Class"];
  var Control_Monad_Trans_Class = $PS["Control.Monad.Trans.Class"];
  var Data_Function = $PS["Data.Function"];
  var Data_Functor = $PS["Data.Functor"];
  var Effect_Class = $PS["Effect.Class"];

  var ReaderT = function ReaderT(x) {
    return x;
  };

  var runReaderT = function runReaderT(v) {
    return v;
  };

  var monadTransReaderT = new Control_Monad_Trans_Class.MonadTrans(function (dictMonad) {
    return function ($64) {
      return ReaderT(Data_Function["const"]($64));
    };
  });

  var mapReaderT = function mapReaderT(f) {
    return function (v) {
      return function ($65) {
        return f(v($65));
      };
    };
  };

  var functorReaderT = function functorReaderT(dictFunctor) {
    return new Data_Functor.Functor(function () {
      var $66 = Data_Functor.map(dictFunctor);
      return function ($67) {
        return mapReaderT($66($67));
      };
    }());
  };

  var applyReaderT = function applyReaderT(dictApply) {
    return new Control_Apply.Apply(function () {
      return functorReaderT(dictApply.Functor0());
    }, function (v) {
      return function (v1) {
        return function (r) {
          return Control_Apply.apply(dictApply)(v(r))(v1(r));
        };
      };
    });
  };

  var bindReaderT = function bindReaderT(dictBind) {
    return new Control_Bind.Bind(function () {
      return applyReaderT(dictBind.Apply0());
    }, function (v) {
      return function (k) {
        return function (r) {
          return Control_Bind.bind(dictBind)(v(r))(function (a) {
            var v1 = k(a);
            return v1(r);
          });
        };
      };
    });
  };

  var applicativeReaderT = function applicativeReaderT(dictApplicative) {
    return new Control_Applicative.Applicative(function () {
      return applyReaderT(dictApplicative.Apply0());
    }, function () {
      var $71 = Control_Applicative.pure(dictApplicative);
      return function ($72) {
        return ReaderT(Data_Function["const"]($71($72)));
      };
    }());
  };

  var monadReaderT = function monadReaderT(dictMonad) {
    return new Control_Monad.Monad(function () {
      return applicativeReaderT(dictMonad.Applicative0());
    }, function () {
      return bindReaderT(dictMonad.Bind1());
    });
  };

  var monadAskReaderT = function monadAskReaderT(dictMonad) {
    return new Control_Monad_Reader_Class.MonadAsk(function () {
      return monadReaderT(dictMonad);
    }, Control_Applicative.pure(dictMonad.Applicative0()));
  };

  var monadEffectReader = function monadEffectReader(dictMonadEffect) {
    return new Effect_Class.MonadEffect(function () {
      return monadReaderT(dictMonadEffect.Monad0());
    }, function () {
      var $74 = Control_Monad_Trans_Class.lift(monadTransReaderT)(dictMonadEffect.Monad0());
      var $75 = Effect_Class.liftEffect(dictMonadEffect);
      return function ($76) {
        return $74($75($76));
      };
    }());
  };

  exports["runReaderT"] = runReaderT;
  exports["functorReaderT"] = functorReaderT;
  exports["applyReaderT"] = applyReaderT;
  exports["applicativeReaderT"] = applicativeReaderT;
  exports["bindReaderT"] = bindReaderT;
  exports["monadReaderT"] = monadReaderT;
  exports["monadTransReaderT"] = monadTransReaderT;
  exports["monadEffectReader"] = monadEffectReader;
  exports["monadAskReaderT"] = monadAskReaderT;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Control.Monad.State.Class"] = $PS["Control.Monad.State.Class"] || {};
  var exports = $PS["Control.Monad.State.Class"];
  var Data_Tuple = $PS["Data.Tuple"];
  var Data_Unit = $PS["Data.Unit"];

  var MonadState = function MonadState(Monad0, state) {
    this.Monad0 = Monad0;
    this.state = state;
  };

  var state = function state(dict) {
    return dict.state;
  };

  var modify_ = function modify_(dictMonadState) {
    return function (f) {
      return state(dictMonadState)(function (s) {
        return new Data_Tuple.Tuple(Data_Unit.unit, f(s));
      });
    };
  };

  var get = function get(dictMonadState) {
    return state(dictMonadState)(function (s) {
      return new Data_Tuple.Tuple(s, s);
    });
  };

  exports["MonadState"] = MonadState;
  exports["get"] = get;
  exports["modify_"] = modify_;
})(PS);

(function (exports) {
  exports.thenImpl = function (promise) {
    return function (errCB) {
      return function (succCB) {
        return function () {
          promise.then(succCB, errCB);
        };
      };
    };
  };
})(PS["Control.Promise"] = PS["Control.Promise"] || {});

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Data.Identity"] = $PS["Data.Identity"] || {};
  var exports = $PS["Data.Identity"];
  var Control_Applicative = $PS["Control.Applicative"];
  var Control_Apply = $PS["Control.Apply"];
  var Control_Bind = $PS["Control.Bind"];
  var Control_Monad = $PS["Control.Monad"];
  var Data_Functor = $PS["Data.Functor"];

  var Identity = function Identity(x) {
    return x;
  };

  var functorIdentity = new Data_Functor.Functor(function (f) {
    return function (m) {
      return f(m);
    };
  });
  var applyIdentity = new Control_Apply.Apply(function () {
    return functorIdentity;
  }, function (v) {
    return function (v1) {
      return v(v1);
    };
  });
  var bindIdentity = new Control_Bind.Bind(function () {
    return applyIdentity;
  }, function (v) {
    return function (f) {
      return f(v);
    };
  });
  var applicativeIdentity = new Control_Applicative.Applicative(function () {
    return applyIdentity;
  }, Identity);
  var monadIdentity = new Control_Monad.Monad(function () {
    return applicativeIdentity;
  }, function () {
    return bindIdentity;
  });
  exports["functorIdentity"] = functorIdentity;
  exports["applicativeIdentity"] = applicativeIdentity;
  exports["monadIdentity"] = monadIdentity;
})(PS);

(function (exports) {
  "use strict";

  exports.showErrorImpl = function (err) {
    return err.stack || err.toString();
  };

  exports.error = function (msg) {
    return new Error(msg);
  };

  exports.throwException = function (e) {
    return function () {
      throw e;
    };
  };
})(PS["Effect.Exception"] = PS["Effect.Exception"] || {});

(function (exports) {
  "use strict";

  exports.showIntImpl = function (n) {
    return n.toString();
  };

  exports.showStringImpl = function (s) {
    var l = s.length;
    return "\"" + s.replace(/[\0-\x1F\x7F"\\]/g, // eslint-disable-line no-control-regex
    function (c, i) {
      switch (c) {
        case "\"":
        case "\\":
          return "\\" + c;

        case "\x07":
          return "\\a";

        case "\b":
          return "\\b";

        case "\f":
          return "\\f";

        case "\n":
          return "\\n";

        case "\r":
          return "\\r";

        case "\t":
          return "\\t";

        case "\v":
          return "\\v";
      }

      var k = i + 1;
      var empty = k < l && s[k] >= "0" && s[k] <= "9" ? "\\&" : "";
      return "\\" + c.charCodeAt(0).toString(10) + empty;
    }) + "\"";
  };
})(PS["Data.Show"] = PS["Data.Show"] || {});

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Data.Show"] = $PS["Data.Show"] || {};
  var exports = $PS["Data.Show"];
  var $foreign = $PS["Data.Show"];

  var Show = function Show(show) {
    this.show = show;
  };

  var showString = new Show($foreign.showStringImpl);
  var showInt = new Show($foreign.showIntImpl);

  var show = function show(dict) {
    return dict.show;
  };

  exports["Show"] = Show;
  exports["show"] = show;
  exports["showInt"] = showInt;
  exports["showString"] = showString;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Effect.Exception"] = $PS["Effect.Exception"] || {};
  var exports = $PS["Effect.Exception"];
  var $foreign = $PS["Effect.Exception"];
  var Data_Show = $PS["Data.Show"];

  var $$throw = function $$throw($2) {
    return $foreign.throwException($foreign.error($2));
  };

  var showError = new Data_Show.Show($foreign.showErrorImpl);
  exports["throw"] = $$throw;
  exports["showError"] = showError;
  exports["error"] = $foreign.error;
  exports["throwException"] = $foreign.throwException;
})(PS);

(function (exports) {
  "use strict";

  exports.typeOf = function (value) {
    return _typeof(value);
  };

  exports.tagOf = function (value) {
    return Object.prototype.toString.call(value).slice(8, -1);
  };
})(PS["Foreign"] = PS["Foreign"] || {});

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Data.Boolean"] = $PS["Data.Boolean"] || {};
  var exports = $PS["Data.Boolean"];
  var otherwise = true;
  exports["otherwise"] = otherwise;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Foreign"] = $PS["Foreign"] || {};
  var exports = $PS["Foreign"];
  var $foreign = $PS["Foreign"];
  var Control_Applicative = $PS["Control.Applicative"];
  var Control_Monad_Error_Class = $PS["Control.Monad.Error.Class"];
  var Control_Monad_Except_Trans = $PS["Control.Monad.Except.Trans"];
  var Data_Boolean = $PS["Data.Boolean"];
  var Data_List_NonEmpty = $PS["Data.List.NonEmpty"];
  var Data_Show = $PS["Data.Show"];
  var Unsafe_Coerce = $PS["Unsafe.Coerce"];

  var ForeignError = function () {
    function ForeignError(value0) {
      this.value0 = value0;
    }

    ;

    ForeignError.create = function (value0) {
      return new ForeignError(value0);
    };

    return ForeignError;
  }();

  var TypeMismatch = function () {
    function TypeMismatch(value0, value1) {
      this.value0 = value0;
      this.value1 = value1;
    }

    ;

    TypeMismatch.create = function (value0) {
      return function (value1) {
        return new TypeMismatch(value0, value1);
      };
    };

    return TypeMismatch;
  }();

  var ErrorAtIndex = function () {
    function ErrorAtIndex(value0, value1) {
      this.value0 = value0;
      this.value1 = value1;
    }

    ;

    ErrorAtIndex.create = function (value0) {
      return function (value1) {
        return new ErrorAtIndex(value0, value1);
      };
    };

    return ErrorAtIndex;
  }();

  var ErrorAtProperty = function () {
    function ErrorAtProperty(value0, value1) {
      this.value0 = value0;
      this.value1 = value1;
    }

    ;

    ErrorAtProperty.create = function (value0) {
      return function (value1) {
        return new ErrorAtProperty(value0, value1);
      };
    };

    return ErrorAtProperty;
  }();

  var unsafeToForeign = Unsafe_Coerce.unsafeCoerce;
  var unsafeFromForeign = Unsafe_Coerce.unsafeCoerce;

  var renderForeignError = function renderForeignError(v) {
    if (v instanceof ForeignError) {
      return v.value0;
    }

    ;

    if (v instanceof ErrorAtIndex) {
      return "Error at array index " + (Data_Show.show(Data_Show.showInt)(v.value0) + (": " + renderForeignError(v.value1)));
    }

    ;

    if (v instanceof ErrorAtProperty) {
      return "Error at property " + (Data_Show.show(Data_Show.showString)(v.value0) + (": " + renderForeignError(v.value1)));
    }

    ;

    if (v instanceof TypeMismatch) {
      return "Type mismatch: expected " + (v.value0 + (", found " + v.value1));
    }

    ;
    throw new Error("Failed pattern match at Foreign (line 73, column 1 - line 73, column 45): " + [v.constructor.name]);
  };

  var fail = function fail(dictMonad) {
    var $118 = Control_Monad_Error_Class.throwError(Control_Monad_Except_Trans.monadThrowExceptT(dictMonad));
    return function ($119) {
      return $118(Data_List_NonEmpty.singleton($119));
    };
  };

  var unsafeReadTagged = function unsafeReadTagged(dictMonad) {
    return function (tag) {
      return function (value) {
        if ($foreign.tagOf(value) === tag) {
          return Control_Applicative.pure(Control_Monad_Except_Trans.applicativeExceptT(dictMonad))(unsafeFromForeign(value));
        }

        ;

        if (Data_Boolean.otherwise) {
          return fail(dictMonad)(new TypeMismatch(tag, $foreign.tagOf(value)));
        }

        ;
        throw new Error("Failed pattern match at Foreign (line 110, column 1 - line 110, column 71): " + [tag.constructor.name, value.constructor.name]);
      };
    };
  };

  var readString = function readString(dictMonad) {
    return unsafeReadTagged(dictMonad)("String");
  };

  exports["ForeignError"] = ForeignError;
  exports["renderForeignError"] = renderForeignError;
  exports["unsafeToForeign"] = unsafeToForeign;
  exports["unsafeReadTagged"] = unsafeReadTagged;
  exports["readString"] = readString;
  exports["fail"] = fail;
  exports["typeOf"] = $foreign.typeOf;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Control.Promise"] = $PS["Control.Promise"] || {};
  var exports = $PS["Control.Promise"];
  var $foreign = $PS["Control.Promise"];
  var Control_Alt = $PS["Control.Alt"];
  var Control_Bind = $PS["Control.Bind"];
  var Control_Category = $PS["Control.Category"];
  var Control_Monad_Except = $PS["Control.Monad.Except"];
  var Control_Monad_Except_Trans = $PS["Control.Monad.Except.Trans"];
  var Data_Either = $PS["Data.Either"];
  var Data_Functor = $PS["Data.Functor"];
  var Data_Identity = $PS["Data.Identity"];
  var Data_List_Types = $PS["Data.List.Types"];
  var Data_Monoid = $PS["Data.Monoid"];
  var Effect = $PS["Effect"];
  var Effect_Aff = $PS["Effect.Aff"];
  var Effect_Class = $PS["Effect.Class"];
  var Effect_Exception = $PS["Effect.Exception"];
  var Foreign = $PS["Foreign"];

  var toAff$prime = function toAff$prime(customCoerce) {
    return function (p) {
      return Effect_Aff.makeAff(function (cb) {
        return Data_Functor.voidRight(Effect.functorEffect)(Data_Monoid.mempty(Effect_Aff.monoidCanceler))($foreign.thenImpl(p)(function ($1) {
          return cb(Data_Either.Left.create(customCoerce($1)))();
        })(function ($2) {
          return cb(Data_Either.Right.create($2))();
        }));
      });
    };
  };

  var coerce = function coerce(fn) {
    return Data_Either.either(function (v) {
      return Effect_Exception.error("Promise failed, couldn't extract JS Error or String");
    })(Control_Category.identity(Control_Category.categoryFn))(Control_Monad_Except.runExcept(Control_Alt.alt(Control_Monad_Except_Trans.altExceptT(Data_List_Types.semigroupNonEmptyList)(Data_Identity.monadIdentity))(Foreign.unsafeReadTagged(Data_Identity.monadIdentity)("Error")(fn))(Data_Functor.map(Control_Monad_Except_Trans.functorExceptT(Data_Identity.functorIdentity))(Effect_Exception.error)(Foreign.readString(Data_Identity.monadIdentity)(fn)))));
  };

  var toAff = toAff$prime(coerce);

  var toAffE = function toAffE(f) {
    return Control_Bind.bind(Effect_Aff.bindAff)(Effect_Class.liftEffect(Effect_Aff.monadEffectAff)(f))(toAff);
  };

  exports["toAffE"] = toAffE;
})(PS);

(function (exports) {
  /* eslint-disable no-eq-null, eqeqeq */
  "use strict";

  function id(x) {
    return x;
  }

  exports.stringify = function (j) {
    return JSON.stringify(j);
  };

  function isArray(a) {
    return Object.prototype.toString.call(a) === "[object Array]";
  }

  exports._caseJson = function (isNull, isBool, isNum, isStr, isArr, isObj, j) {
    if (j == null) return isNull();else if (typeof j === "boolean") return isBool(j);else if (typeof j === "number") return isNum(j);else if (typeof j === "string") return isStr(j);else if (Object.prototype.toString.call(j) === "[object Array]") return isArr(j);else return isObj(j);
  };
})(PS["Data.Argonaut.Core"] = PS["Data.Argonaut.Core"] || {});

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Data.Argonaut.Core"] = $PS["Data.Argonaut.Core"] || {};
  var exports = $PS["Data.Argonaut.Core"];
  var $foreign = $PS["Data.Argonaut.Core"];
  var Data_Function = $PS["Data.Function"];
  var Data_Maybe = $PS["Data.Maybe"];

  var verbJsonType = function verbJsonType(def) {
    return function (f) {
      return function (g) {
        return g(def)(f);
      };
    };
  };

  var toJsonType = verbJsonType(Data_Maybe.Nothing.value)(Data_Maybe.Just.create);
  var isJsonType = verbJsonType(false)(Data_Function["const"](true));

  var caseJsonString = function caseJsonString(d) {
    return function (f) {
      return function (j) {
        return $foreign["_caseJson"](Data_Function["const"](d), Data_Function["const"](d), Data_Function["const"](d), f, Data_Function["const"](d), Data_Function["const"](d), j);
      };
    };
  };

  var caseJsonObject = function caseJsonObject(d) {
    return function (f) {
      return function (j) {
        return $foreign["_caseJson"](Data_Function["const"](d), Data_Function["const"](d), Data_Function["const"](d), Data_Function["const"](d), Data_Function["const"](d), f, j);
      };
    };
  };

  var toObject = toJsonType(caseJsonObject);

  var caseJsonNull = function caseJsonNull(d) {
    return function (f) {
      return function (j) {
        return $foreign["_caseJson"](f, Data_Function["const"](d), Data_Function["const"](d), Data_Function["const"](d), Data_Function["const"](d), Data_Function["const"](d), j);
      };
    };
  };

  var isNull = isJsonType(caseJsonNull);

  var caseJsonArray = function caseJsonArray(d) {
    return function (f) {
      return function (j) {
        return $foreign["_caseJson"](Data_Function["const"](d), Data_Function["const"](d), Data_Function["const"](d), Data_Function["const"](d), f, Data_Function["const"](d), j);
      };
    };
  };

  var toArray = toJsonType(caseJsonArray);
  exports["caseJsonString"] = caseJsonString;
  exports["isNull"] = isNull;
  exports["toArray"] = toArray;
  exports["toObject"] = toObject;
  exports["stringify"] = $foreign.stringify;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Data.Argonaut.Decode.Error"] = $PS["Data.Argonaut.Decode.Error"] || {};
  var exports = $PS["Data.Argonaut.Decode.Error"];
  var Data_Argonaut_Core = $PS["Data.Argonaut.Core"];
  var Data_Show = $PS["Data.Show"];

  var TypeMismatch = function () {
    function TypeMismatch(value0) {
      this.value0 = value0;
    }

    ;

    TypeMismatch.create = function (value0) {
      return new TypeMismatch(value0);
    };

    return TypeMismatch;
  }();

  var UnexpectedValue = function () {
    function UnexpectedValue(value0) {
      this.value0 = value0;
    }

    ;

    UnexpectedValue.create = function (value0) {
      return new UnexpectedValue(value0);
    };

    return UnexpectedValue;
  }();

  var AtIndex = function () {
    function AtIndex(value0, value1) {
      this.value0 = value0;
      this.value1 = value1;
    }

    ;

    AtIndex.create = function (value0) {
      return function (value1) {
        return new AtIndex(value0, value1);
      };
    };

    return AtIndex;
  }();

  var AtKey = function () {
    function AtKey(value0, value1) {
      this.value0 = value0;
      this.value1 = value1;
    }

    ;

    AtKey.create = function (value0) {
      return function (value1) {
        return new AtKey(value0, value1);
      };
    };

    return AtKey;
  }();

  var Named = function () {
    function Named(value0, value1) {
      this.value0 = value0;
      this.value1 = value1;
    }

    ;

    Named.create = function (value0) {
      return function (value1) {
        return new Named(value0, value1);
      };
    };

    return Named;
  }();

  var MissingValue = function () {
    function MissingValue() {}

    ;
    MissingValue.value = new MissingValue();
    return MissingValue;
  }();

  var printJsonDecodeError = function printJsonDecodeError(err) {
    var go = function go(v) {
      if (v instanceof TypeMismatch) {
        return "  Expected value of type '" + (v.value0 + "'.");
      }

      ;

      if (v instanceof UnexpectedValue) {
        return "  Unexpected value " + (Data_Argonaut_Core.stringify(v.value0) + ".");
      }

      ;

      if (v instanceof AtIndex) {
        return "  At array index " + (Data_Show.show(Data_Show.showInt)(v.value0) + (":\x0a" + go(v.value1)));
      }

      ;

      if (v instanceof AtKey) {
        return "  At object key '" + (v.value0 + ("':\x0a" + go(v.value1)));
      }

      ;

      if (v instanceof Named) {
        return "  Under '" + (v.value0 + ("':\x0a" + go(v.value1)));
      }

      ;

      if (v instanceof MissingValue) {
        return "  No value was found.";
      }

      ;
      throw new Error("Failed pattern match at Data.Argonaut.Decode.Error (line 37, column 8 - line 43, column 44): " + [v.constructor.name]);
    };

    return "An error occurred while decoding a JSON value:\x0a" + go(err);
  };

  exports["TypeMismatch"] = TypeMismatch;
  exports["AtIndex"] = AtIndex;
  exports["AtKey"] = AtKey;
  exports["Named"] = Named;
  exports["MissingValue"] = MissingValue;
  exports["printJsonDecodeError"] = printJsonDecodeError;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Data.Bifunctor"] = $PS["Data.Bifunctor"] || {};
  var exports = $PS["Data.Bifunctor"];
  var Control_Category = $PS["Control.Category"];
  var Data_Either = $PS["Data.Either"];
  var Data_Tuple = $PS["Data.Tuple"];

  var Bifunctor = function Bifunctor(bimap) {
    this.bimap = bimap;
  };

  var bimap = function bimap(dict) {
    return dict.bimap;
  };

  var lmap = function lmap(dictBifunctor) {
    return function (f) {
      return bimap(dictBifunctor)(f)(Control_Category.identity(Control_Category.categoryFn));
    };
  };

  var bifunctorTuple = new Bifunctor(function (f) {
    return function (g) {
      return function (v) {
        return new Data_Tuple.Tuple(f(v.value0), g(v.value1));
      };
    };
  });
  var bifunctorEither = new Bifunctor(function (v) {
    return function (v1) {
      return function (v2) {
        if (v2 instanceof Data_Either.Left) {
          return new Data_Either.Left(v(v2.value0));
        }

        ;

        if (v2 instanceof Data_Either.Right) {
          return new Data_Either.Right(v1(v2.value0));
        }

        ;
        throw new Error("Failed pattern match at Data.Bifunctor (line 32, column 1 - line 34, column 36): " + [v.constructor.name, v1.constructor.name, v2.constructor.name]);
      };
    };
  });
  exports["bimap"] = bimap;
  exports["Bifunctor"] = Bifunctor;
  exports["lmap"] = lmap;
  exports["bifunctorEither"] = bifunctorEither;
  exports["bifunctorTuple"] = bifunctorTuple;
})(PS);

(function (exports) {
  "use strict";

  exports.mapWithIndexArray = function (f) {
    return function (xs) {
      var l = xs.length;
      var result = Array(l);

      for (var i = 0; i < l; i++) {
        result[i] = f(i)(xs[i]);
      }

      return result;
    };
  };
})(PS["Data.FunctorWithIndex"] = PS["Data.FunctorWithIndex"] || {});

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Data.FunctorWithIndex"] = $PS["Data.FunctorWithIndex"] || {};
  var exports = $PS["Data.FunctorWithIndex"];
  var $foreign = $PS["Data.FunctorWithIndex"];
  var Data_Functor = $PS["Data.Functor"];

  var FunctorWithIndex = function FunctorWithIndex(Functor0, mapWithIndex) {
    this.Functor0 = Functor0;
    this.mapWithIndex = mapWithIndex;
  };

  var mapWithIndex = function mapWithIndex(dict) {
    return dict.mapWithIndex;
  };

  var functorWithIndexArray = new FunctorWithIndex(function () {
    return Data_Functor.functorArray;
  }, $foreign.mapWithIndexArray);
  exports["mapWithIndex"] = mapWithIndex;
  exports["functorWithIndexArray"] = functorWithIndexArray;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Data.FoldableWithIndex"] = $PS["Data.FoldableWithIndex"] || {};
  var exports = $PS["Data.FoldableWithIndex"];
  var Data_Foldable = $PS["Data.Foldable"];
  var Data_FunctorWithIndex = $PS["Data.FunctorWithIndex"];
  var Data_Monoid = $PS["Data.Monoid"];
  var Data_Semigroup = $PS["Data.Semigroup"];
  var Data_Tuple = $PS["Data.Tuple"];

  var FoldableWithIndex = function FoldableWithIndex(Foldable0, foldMapWithIndex, foldlWithIndex, foldrWithIndex) {
    this.Foldable0 = Foldable0;
    this.foldMapWithIndex = foldMapWithIndex;
    this.foldlWithIndex = foldlWithIndex;
    this.foldrWithIndex = foldrWithIndex;
  };

  var foldrWithIndex = function foldrWithIndex(dict) {
    return dict.foldrWithIndex;
  };

  var foldMapWithIndexDefaultR = function foldMapWithIndexDefaultR(dictFoldableWithIndex) {
    return function (dictMonoid) {
      return function (f) {
        return foldrWithIndex(dictFoldableWithIndex)(function (i) {
          return function (x) {
            return function (acc) {
              return Data_Semigroup.append(dictMonoid.Semigroup0())(f(i)(x))(acc);
            };
          };
        })(Data_Monoid.mempty(dictMonoid));
      };
    };
  };

  var foldableWithIndexArray = new FoldableWithIndex(function () {
    return Data_Foldable.foldableArray;
  }, function (dictMonoid) {
    return foldMapWithIndexDefaultR(foldableWithIndexArray)(dictMonoid);
  }, function (f) {
    return function (z) {
      var $163 = Data_Foldable.foldl(Data_Foldable.foldableArray)(function (y) {
        return function (v) {
          return f(v.value0)(y)(v.value1);
        };
      })(z);
      var $164 = Data_FunctorWithIndex.mapWithIndex(Data_FunctorWithIndex.functorWithIndexArray)(Data_Tuple.Tuple.create);
      return function ($165) {
        return $163($164($165));
      };
    };
  }, function (f) {
    return function (z) {
      var $166 = Data_Foldable.foldr(Data_Foldable.foldableArray)(function (v) {
        return function (y) {
          return f(v.value0)(v.value1)(y);
        };
      })(z);
      var $167 = Data_FunctorWithIndex.mapWithIndex(Data_FunctorWithIndex.functorWithIndexArray)(Data_Tuple.Tuple.create);
      return function ($168) {
        return $166($167($168));
      };
    };
  });
  exports["foldableWithIndexArray"] = foldableWithIndexArray;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Data.TraversableWithIndex"] = $PS["Data.TraversableWithIndex"] || {};
  var exports = $PS["Data.TraversableWithIndex"];
  var Data_FoldableWithIndex = $PS["Data.FoldableWithIndex"];
  var Data_FunctorWithIndex = $PS["Data.FunctorWithIndex"];
  var Data_Traversable = $PS["Data.Traversable"];

  var TraversableWithIndex = function TraversableWithIndex(FoldableWithIndex1, FunctorWithIndex0, Traversable2, traverseWithIndex) {
    this.FoldableWithIndex1 = FoldableWithIndex1;
    this.FunctorWithIndex0 = FunctorWithIndex0;
    this.Traversable2 = Traversable2;
    this.traverseWithIndex = traverseWithIndex;
  };

  var traverseWithIndexDefault = function traverseWithIndexDefault(dictTraversableWithIndex) {
    return function (dictApplicative) {
      return function (f) {
        var $63 = Data_Traversable.sequence(dictTraversableWithIndex.Traversable2())(dictApplicative);
        var $64 = Data_FunctorWithIndex.mapWithIndex(dictTraversableWithIndex.FunctorWithIndex0())(f);
        return function ($65) {
          return $63($64($65));
        };
      };
    };
  };

  var traverseWithIndex = function traverseWithIndex(dict) {
    return dict.traverseWithIndex;
  };

  var traversableWithIndexArray = new TraversableWithIndex(function () {
    return Data_FoldableWithIndex.foldableWithIndexArray;
  }, function () {
    return Data_FunctorWithIndex.functorWithIndexArray;
  }, function () {
    return Data_Traversable.traversableArray;
  }, function (dictApplicative) {
    return traverseWithIndexDefault(traversableWithIndexArray)(dictApplicative);
  });
  exports["traverseWithIndex"] = traverseWithIndex;
  exports["traversableWithIndexArray"] = traversableWithIndexArray;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Data.Argonaut.Decode.Decoders"] = $PS["Data.Argonaut.Decode.Decoders"] || {};
  var exports = $PS["Data.Argonaut.Decode.Decoders"];
  var Control_Applicative = $PS["Control.Applicative"];
  var Control_Bind = $PS["Control.Bind"];
  var Data_Argonaut_Core = $PS["Data.Argonaut.Core"];
  var Data_Argonaut_Decode_Error = $PS["Data.Argonaut.Decode.Error"];
  var Data_Bifunctor = $PS["Data.Bifunctor"];
  var Data_Boolean = $PS["Data.Boolean"];
  var Data_Either = $PS["Data.Either"];
  var Data_Functor = $PS["Data.Functor"];
  var Data_Maybe = $PS["Data.Maybe"];
  var Data_TraversableWithIndex = $PS["Data.TraversableWithIndex"];
  var decodeString = Data_Argonaut_Core.caseJsonString(Data_Either.Left.create(new Data_Argonaut_Decode_Error.TypeMismatch("String")))(Data_Either.Right.create);

  var decodeMaybe = function decodeMaybe(decoder) {
    return function (json) {
      if (Data_Argonaut_Core.isNull(json)) {
        return Control_Applicative.pure(Data_Either.applicativeEither)(Data_Maybe.Nothing.value);
      }

      ;

      if (Data_Boolean.otherwise) {
        return Data_Functor.map(Data_Either.functorEither)(Data_Maybe.Just.create)(decoder(json));
      }

      ;
      throw new Error("Failed pattern match at Data.Argonaut.Decode.Decoders (line 37, column 1 - line 41, column 38): " + [decoder.constructor.name, json.constructor.name]);
    };
  };

  var decodeJArray = function () {
    var $22 = Data_Either.note(new Data_Argonaut_Decode_Error.TypeMismatch("Array"));
    return function ($23) {
      return $22(Data_Argonaut_Core.toArray($23));
    };
  }();

  var decodeArray = function decodeArray(decoder) {
    return Control_Bind.composeKleisliFlipped(Data_Either.bindEither)(function () {
      var $59 = Data_Bifunctor.lmap(Data_Bifunctor.bifunctorEither)(Data_Argonaut_Decode_Error.Named.create("Array"));
      var $60 = Data_TraversableWithIndex.traverseWithIndex(Data_TraversableWithIndex.traversableWithIndexArray)(Data_Either.applicativeEither)(function (i) {
        var $62 = Data_Bifunctor.lmap(Data_Bifunctor.bifunctorEither)(Data_Argonaut_Decode_Error.AtIndex.create(i));
        return function ($63) {
          return $62(decoder($63));
        };
      });
      return function ($61) {
        return $59($60($61));
      };
    }())(decodeJArray);
  };

  exports["decodeMaybe"] = decodeMaybe;
  exports["decodeString"] = decodeString;
  exports["decodeArray"] = decodeArray;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Data.Symbol"] = $PS["Data.Symbol"] || {};
  var exports = $PS["Data.Symbol"];

  var SProxy = function () {
    function SProxy() {}

    ;
    SProxy.value = new SProxy();
    return SProxy;
  }();

  var IsSymbol = function IsSymbol(reflectSymbol) {
    this.reflectSymbol = reflectSymbol;
  };

  var reflectSymbol = function reflectSymbol(dict) {
    return dict.reflectSymbol;
  };

  exports["IsSymbol"] = IsSymbol;
  exports["reflectSymbol"] = reflectSymbol;
  exports["SProxy"] = SProxy;
})(PS);

(function (exports) {
  "use strict";

  exports._lookup = function (no, yes, k, m) {
    return k in m ? yes(m[k]) : no;
  };

  function toArrayWithKey(f) {
    return function (m) {
      var r = [];

      for (var k in m) {
        if (hasOwnProperty.call(m, k)) {
          r.push(f(k)(m[k]));
        }
      }

      return r;
    };
  }
})(PS["Foreign.Object"] = PS["Foreign.Object"] || {});

(function (exports) {
  "use strict";

  exports.runFn3 = function (fn) {
    return function (a) {
      return function (b) {
        return function (c) {
          return fn(a, b, c);
        };
      };
    };
  };

  exports.runFn4 = function (fn) {
    return function (a) {
      return function (b) {
        return function (c) {
          return function (d) {
            return fn(a, b, c, d);
          };
        };
      };
    };
  };
})(PS["Data.Function.Uncurried"] = PS["Data.Function.Uncurried"] || {});

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Data.Function.Uncurried"] = $PS["Data.Function.Uncurried"] || {};
  var exports = $PS["Data.Function.Uncurried"];
  var $foreign = $PS["Data.Function.Uncurried"];
  exports["runFn3"] = $foreign.runFn3;
  exports["runFn4"] = $foreign.runFn4;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Foreign.Object"] = $PS["Foreign.Object"] || {};
  var exports = $PS["Foreign.Object"];
  var $foreign = $PS["Foreign.Object"];
  var Data_Function_Uncurried = $PS["Data.Function.Uncurried"];
  var Data_Maybe = $PS["Data.Maybe"];
  var lookup = Data_Function_Uncurried.runFn4($foreign["_lookup"])(Data_Maybe.Nothing.value)(Data_Maybe.Just.create);
  exports["lookup"] = lookup;
})(PS);

(function (exports) {
  "use strict";

  exports.unsafeGet = function (label) {
    return function (rec) {
      return rec[label];
    };
  };

  exports.unsafeSet = function (label) {
    return function (value) {
      return function (rec) {
        var copy = {};

        for (var key in rec) {
          if ({}.hasOwnProperty.call(rec, key)) {
            copy[key] = rec[key];
          }
        }

        copy[label] = value;
        return copy;
      };
    };
  };
})(PS["Record.Unsafe"] = PS["Record.Unsafe"] || {});

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Record.Unsafe"] = $PS["Record.Unsafe"] || {};
  var exports = $PS["Record.Unsafe"];
  var $foreign = $PS["Record.Unsafe"];
  exports["unsafeGet"] = $foreign.unsafeGet;
  exports["unsafeSet"] = $foreign.unsafeSet;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Record"] = $PS["Record"] || {};
  var exports = $PS["Record"];
  var Data_Symbol = $PS["Data.Symbol"];
  var Record_Unsafe = $PS["Record.Unsafe"];

  var insert = function insert(dictIsSymbol) {
    return function (dictLacks) {
      return function (dictCons) {
        return function (l) {
          return function (a) {
            return function (r) {
              return Record_Unsafe.unsafeSet(Data_Symbol.reflectSymbol(dictIsSymbol)(l))(a)(r);
            };
          };
        };
      };
    };
  };

  var get = function get(dictIsSymbol) {
    return function (dictCons) {
      return function (l) {
        return function (r) {
          return Record_Unsafe.unsafeGet(Data_Symbol.reflectSymbol(dictIsSymbol)(l))(r);
        };
      };
    };
  };

  exports["get"] = get;
  exports["insert"] = insert;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Type.Proxy"] = $PS["Type.Proxy"] || {};
  var exports = $PS["Type.Proxy"];

  var $$Proxy = function () {
    function $$Proxy() {}

    ;
    $$Proxy.value = new $$Proxy();
    return $$Proxy;
  }();

  exports["Proxy"] = $$Proxy;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Data.Argonaut.Decode.Class"] = $PS["Data.Argonaut.Decode.Class"] || {};
  var exports = $PS["Data.Argonaut.Decode.Class"];
  var Control_Bind = $PS["Control.Bind"];
  var Data_Argonaut_Core = $PS["Data.Argonaut.Core"];
  var Data_Argonaut_Decode_Decoders = $PS["Data.Argonaut.Decode.Decoders"];
  var Data_Argonaut_Decode_Error = $PS["Data.Argonaut.Decode.Error"];
  var Data_Bifunctor = $PS["Data.Bifunctor"];
  var Data_Either = $PS["Data.Either"];
  var Data_Functor = $PS["Data.Functor"];
  var Data_Maybe = $PS["Data.Maybe"];
  var Data_Symbol = $PS["Data.Symbol"];
  var Foreign_Object = $PS["Foreign.Object"];
  var Record = $PS["Record"];
  var Type_Proxy = $PS["Type.Proxy"];

  var GDecodeJson = function GDecodeJson(gDecodeJson) {
    this.gDecodeJson = gDecodeJson;
  };

  var DecodeJsonField = function DecodeJsonField(decodeJsonField) {
    this.decodeJsonField = decodeJsonField;
  };

  var DecodeJson = function DecodeJson(decodeJson) {
    this.decodeJson = decodeJson;
  };

  var gDecodeJsonNil = new GDecodeJson(function (v) {
    return function (v1) {
      return new Data_Either.Right({});
    };
  });

  var gDecodeJson = function gDecodeJson(dict) {
    return dict.gDecodeJson;
  };

  var decodeRecord = function decodeRecord(dictGDecodeJson) {
    return function (dictRowToList) {
      return new DecodeJson(function (json) {
        var v = Data_Argonaut_Core.toObject(json);

        if (v instanceof Data_Maybe.Just) {
          return gDecodeJson(dictGDecodeJson)(v.value0)(Type_Proxy["Proxy"].value);
        }

        ;

        if (v instanceof Data_Maybe.Nothing) {
          return Data_Either.Left.create(new Data_Argonaut_Decode_Error.TypeMismatch("Object"));
        }

        ;
        throw new Error("Failed pattern match at Data.Argonaut.Decode.Class (line 103, column 5 - line 105, column 46): " + [v.constructor.name]);
      });
    };
  };

  var decodeJsonString = new DecodeJson(Data_Argonaut_Decode_Decoders.decodeString);

  var decodeJsonField = function decodeJsonField(dict) {
    return dict.decodeJsonField;
  };

  var gDecodeJsonCons = function gDecodeJsonCons(dictDecodeJsonField) {
    return function (dictGDecodeJson) {
      return function (dictIsSymbol) {
        return function (dictCons) {
          return function (dictLacks) {
            return new GDecodeJson(function (object) {
              return function (v) {
                var fieldName = Data_Symbol.reflectSymbol(dictIsSymbol)(Type_Proxy["Proxy"].value);
                var fieldValue = Foreign_Object.lookup(fieldName)(object);
                var v1 = decodeJsonField(dictDecodeJsonField)(fieldValue);

                if (v1 instanceof Data_Maybe.Just) {
                  return Control_Bind.bind(Data_Either.bindEither)(Data_Bifunctor.lmap(Data_Bifunctor.bifunctorEither)(Data_Argonaut_Decode_Error.AtKey.create(fieldName))(v1.value0))(function (val) {
                    return Control_Bind.bind(Data_Either.bindEither)(gDecodeJson(dictGDecodeJson)(object)(Type_Proxy["Proxy"].value))(function (rest) {
                      return Data_Either.Right.create(Record.insert(dictIsSymbol)()()(Type_Proxy["Proxy"].value)(val)(rest));
                    });
                  });
                }

                ;

                if (v1 instanceof Data_Maybe.Nothing) {
                  return Data_Either.Left.create(new Data_Argonaut_Decode_Error.AtKey(fieldName, Data_Argonaut_Decode_Error.MissingValue.value));
                }

                ;
                throw new Error("Failed pattern match at Data.Argonaut.Decode.Class (line 127, column 5 - line 134, column 44): " + [v1.constructor.name]);
              };
            });
          };
        };
      };
    };
  };

  var decodeJson = function decodeJson(dict) {
    return dict.decodeJson;
  };

  var decodeJsonMaybe = function decodeJsonMaybe(dictDecodeJson) {
    return new DecodeJson(Data_Argonaut_Decode_Decoders.decodeMaybe(decodeJson(dictDecodeJson)));
  };

  var decodeFieldMaybe = function decodeFieldMaybe(dictDecodeJson) {
    return new DecodeJsonField(function (v) {
      if (v instanceof Data_Maybe.Nothing) {
        return Data_Maybe.Just.create(new Data_Either.Right(Data_Maybe.Nothing.value));
      }

      ;

      if (v instanceof Data_Maybe.Just) {
        return Data_Maybe.Just.create(decodeJson(decodeJsonMaybe(dictDecodeJson))(v.value0));
      }

      ;
      throw new Error("Failed pattern match at Data.Argonaut.Decode.Class (line 139, column 1 - line 143, column 49): " + [v.constructor.name]);
    });
  };

  var decodeFieldId = function decodeFieldId(dictDecodeJson) {
    return new DecodeJsonField(function (j) {
      return Data_Functor.map(Data_Maybe.functorMaybe)(decodeJson(dictDecodeJson))(j);
    });
  };

  var decodeArray = function decodeArray(dictDecodeJson) {
    return new DecodeJson(Data_Argonaut_Decode_Decoders.decodeArray(decodeJson(dictDecodeJson)));
  };

  exports["decodeJson"] = decodeJson;
  exports["decodeJsonString"] = decodeJsonString;
  exports["decodeArray"] = decodeArray;
  exports["decodeRecord"] = decodeRecord;
  exports["gDecodeJsonNil"] = gDecodeJsonNil;
  exports["gDecodeJsonCons"] = gDecodeJsonCons;
  exports["decodeFieldMaybe"] = decodeFieldMaybe;
  exports["decodeFieldId"] = decodeFieldId;
})(PS);

(function (exports) {
  "use strict"; //------------------------------------------------------------------------------
  // Array creation --------------------------------------------------------------
  //------------------------------------------------------------------------------

  exports.range = function (start) {
    return function (end) {
      var step = start > end ? -1 : 1;
      var result = new Array(step * (end - start) + 1);
      var i = start,
          n = 0;

      while (i !== end) {
        result[n++] = i;
        i += step;
      }

      result[n] = i;
      return result;
    };
  };

  exports.fromFoldableImpl = function () {
    function Cons(head, tail) {
      this.head = head;
      this.tail = tail;
    }

    var emptyList = {};

    function curryCons(head) {
      return function (tail) {
        return new Cons(head, tail);
      };
    }

    function listToArray(list) {
      var result = [];
      var count = 0;
      var xs = list;

      while (xs !== emptyList) {
        result[count++] = xs.head;
        xs = xs.tail;
      }

      return result;
    }

    return function (foldr) {
      return function (xs) {
        return listToArray(foldr(curryCons)(emptyList)(xs));
      };
    };
  }(); //------------------------------------------------------------------------------
  // Array size ------------------------------------------------------------------
  //------------------------------------------------------------------------------


  exports.length = function (xs) {
    return xs.length;
  }; //------------------------------------------------------------------------------
  // Non-indexed reads -----------------------------------------------------------
  //------------------------------------------------------------------------------


  exports.unconsImpl = function (empty) {
    return function (next) {
      return function (xs) {
        return xs.length === 0 ? empty({}) : next(xs[0])(xs.slice(1));
      };
    };
  }; //------------------------------------------------------------------------------
  // Indexed operations ----------------------------------------------------------
  //------------------------------------------------------------------------------


  exports.indexImpl = function (just) {
    return function (nothing) {
      return function (xs) {
        return function (i) {
          return i < 0 || i >= xs.length ? nothing : just(xs[i]);
        };
      };
    };
  };

  exports.findIndexImpl = function (just) {
    return function (nothing) {
      return function (f) {
        return function (xs) {
          for (var i = 0, l = xs.length; i < l; i++) {
            if (f(xs[i])) return just(i);
          }

          return nothing;
        };
      };
    };
  };

  exports._deleteAt = function (just) {
    return function (nothing) {
      return function (i) {
        return function (l) {
          if (i < 0 || i >= l.length) return nothing;
          var l1 = l.slice();
          l1.splice(i, 1);
          return just(l1);
        };
      };
    };
  }; //------------------------------------------------------------------------------
  // Transformations -------------------------------------------------------------
  //------------------------------------------------------------------------------


  exports.reverse = function (l) {
    return l.slice().reverse();
  };

  exports.filter = function (f) {
    return function (xs) {
      return xs.filter(f);
    };
  }; //------------------------------------------------------------------------------
  // Subarrays -------------------------------------------------------------------
  //------------------------------------------------------------------------------


  exports.slice = function (s) {
    return function (e) {
      return function (l) {
        return l.slice(s, e);
      };
    };
  }; //------------------------------------------------------------------------------
  // Zipping ---------------------------------------------------------------------
  //------------------------------------------------------------------------------


  exports.zipWith = function (f) {
    return function (xs) {
      return function (ys) {
        var l = xs.length < ys.length ? xs.length : ys.length;
        var result = new Array(l);

        for (var i = 0; i < l; i++) {
          result[i] = f(xs[i])(ys[i]);
        }

        return result;
      };
    };
  }; //------------------------------------------------------------------------------
  // Partial ---------------------------------------------------------------------
  //------------------------------------------------------------------------------


  exports.unsafeIndexImpl = function (xs) {
    return function (n) {
      return xs[n];
    };
  };
})(PS["Data.Array"] = PS["Data.Array"] || {});

(function (exports) {
  "use strict";

  exports.pushAll = function (as) {
    return function (xs) {
      return function () {
        return xs.push.apply(xs, as);
      };
    };
  };

  exports.unsafeFreeze = function (xs) {
    return function () {
      return xs;
    };
  };

  function copyImpl(xs) {
    return function () {
      return xs.slice();
    };
  }

  exports.thaw = copyImpl;
})(PS["Data.Array.ST"] = PS["Data.Array.ST"] || {});

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Data.Array.ST"] = $PS["Data.Array.ST"] || {};
  var exports = $PS["Data.Array.ST"];
  var $foreign = $PS["Data.Array.ST"];

  var withArray = function withArray(f) {
    return function (xs) {
      return function __do() {
        var result = $foreign.thaw(xs)();
        f(result)();
        return $foreign.unsafeFreeze(result)();
      };
    };
  };

  var push = function push(a) {
    return $foreign.pushAll([a]);
  };

  exports["withArray"] = withArray;
  exports["push"] = push;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Data.Array"] = $PS["Data.Array"] || {};
  var exports = $PS["Data.Array"];
  var $foreign = $PS["Data.Array"];
  var Control_Bind = $PS["Control.Bind"];
  var Control_Category = $PS["Control.Category"];
  var Data_Array_ST = $PS["Data.Array.ST"];
  var Data_Boolean = $PS["Data.Boolean"];
  var Data_Foldable = $PS["Data.Foldable"];
  var Data_Function = $PS["Data.Function"];
  var Data_Functor = $PS["Data.Functor"];
  var Data_Maybe = $PS["Data.Maybe"];
  var Data_Semigroup = $PS["Data.Semigroup"];
  var Data_Tuple = $PS["Data.Tuple"];
  var zip = $foreign.zipWith(Data_Tuple.Tuple.create);

  var unsafeIndex = function unsafeIndex(dictPartial) {
    return $foreign.unsafeIndexImpl;
  };

  var uncons = $foreign.unconsImpl(Data_Function["const"](Data_Maybe.Nothing.value))(function (x) {
    return function (xs) {
      return new Data_Maybe.Just({
        head: x,
        tail: xs
      });
    };
  });
  var tail = $foreign.unconsImpl(Data_Function["const"](Data_Maybe.Nothing.value))(function (v) {
    return function (xs) {
      return new Data_Maybe.Just(xs);
    };
  });

  var snoc = function snoc(xs) {
    return function (x) {
      return Data_Array_ST.withArray(Data_Array_ST.push(x))(xs)();
    };
  };

  var singleton = function singleton(a) {
    return [a];
  };

  var $$null = function $$null(xs) {
    return $foreign.length(xs) === 0;
  };

  var init = function init(xs) {
    if ($$null(xs)) {
      return Data_Maybe.Nothing.value;
    }

    ;

    if (Data_Boolean.otherwise) {
      return new Data_Maybe.Just($foreign.slice(0)($foreign.length(xs) - 1 | 0)(xs));
    }

    ;
    throw new Error("Failed pattern match at Data.Array (line 340, column 1 - line 340, column 45): " + [xs.constructor.name]);
  };

  var index = $foreign.indexImpl(Data_Maybe.Just.create)(Data_Maybe.Nothing.value);

  var last = function last(xs) {
    return index(xs)($foreign.length(xs) - 1 | 0);
  };

  var head = function head(xs) {
    return index(xs)(0);
  };

  var fromFoldable = function fromFoldable(dictFoldable) {
    return $foreign.fromFoldableImpl(Data_Foldable.foldr(dictFoldable));
  };

  var foldr = Data_Foldable.foldr(Data_Foldable.foldableArray);
  var findIndex = $foreign.findIndexImpl(Data_Maybe.Just.create)(Data_Maybe.Nothing.value);

  var find = function find(f) {
    return function (xs) {
      return Data_Functor.map(Data_Maybe.functorMaybe)(unsafeIndex()(xs))(findIndex(f)(xs));
    };
  };

  var drop = function drop(n) {
    return function (xs) {
      var $89 = n < 1;

      if ($89) {
        return xs;
      }

      ;
      return $foreign.slice(n)($foreign.length(xs))(xs);
    };
  };

  var deleteAt = $foreign["_deleteAt"](Data_Maybe.Just.create)(Data_Maybe.Nothing.value);

  var deleteBy = function deleteBy(v) {
    return function (v1) {
      return function (v2) {
        if (v2.length === 0) {
          return [];
        }

        ;
        return Data_Maybe.maybe(v2)(function (i) {
          return Data_Maybe.fromJust()(deleteAt(i)(v2));
        })(findIndex(v(v1))(v2));
      };
    };
  };

  var cons = function cons(x) {
    return function (xs) {
      return Data_Semigroup.append(Data_Semigroup.semigroupArray)([x])(xs);
    };
  };

  var concatMap = Data_Function.flip(Control_Bind.bind(Control_Bind.bindArray));

  var mapMaybe = function mapMaybe(f) {
    return concatMap(function () {
      var $109 = Data_Maybe.maybe([])(singleton);
      return function ($110) {
        return $109(f($110));
      };
    }());
  };

  var catMaybes = mapMaybe(Control_Category.identity(Control_Category.categoryFn));
  exports["fromFoldable"] = fromFoldable;
  exports["singleton"] = singleton;
  exports["cons"] = cons;
  exports["snoc"] = snoc;
  exports["head"] = head;
  exports["last"] = last;
  exports["tail"] = tail;
  exports["init"] = init;
  exports["uncons"] = uncons;
  exports["index"] = index;
  exports["find"] = find;
  exports["catMaybes"] = catMaybes;
  exports["drop"] = drop;
  exports["deleteBy"] = deleteBy;
  exports["zip"] = zip;
  exports["range"] = $foreign.range;
  exports["length"] = $foreign.length;
  exports["reverse"] = $foreign.reverse;
  exports["filter"] = $foreign.filter;
  exports["zipWith"] = $foreign.zipWith;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Data.Array.NonEmpty.Internal"] = $PS["Data.Array.NonEmpty.Internal"] || {};
  var exports = $PS["Data.Array.NonEmpty.Internal"];
  var Data_Foldable = $PS["Data.Foldable"];
  var Data_Functor = $PS["Data.Functor"];
  var Data_Semigroup = $PS["Data.Semigroup"];

  var NonEmptyArray = function NonEmptyArray(x) {
    return x;
  };

  var semigroupNonEmptyArray = Data_Semigroup.semigroupArray;
  var functorNonEmptyArray = Data_Functor.functorArray;
  var foldableNonEmptyArray = Data_Foldable.foldableArray;
  exports["NonEmptyArray"] = NonEmptyArray;
  exports["semigroupNonEmptyArray"] = semigroupNonEmptyArray;
  exports["functorNonEmptyArray"] = functorNonEmptyArray;
  exports["foldableNonEmptyArray"] = foldableNonEmptyArray;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Data.Array.NonEmpty"] = $PS["Data.Array.NonEmpty"] || {};
  var exports = $PS["Data.Array.NonEmpty"];
  var Data_Array = $PS["Data.Array"];
  var Data_Array_NonEmpty_Internal = $PS["Data.Array.NonEmpty.Internal"];
  var Data_Boolean = $PS["Data.Boolean"];
  var Data_Maybe = $PS["Data.Maybe"];
  var unsafeFromArray = Data_Array_NonEmpty_Internal.NonEmptyArray;

  var toArray = function toArray(v) {
    return v;
  };

  var snoc$prime = function snoc$prime(xs) {
    return function (x) {
      return unsafeFromArray(Data_Array.snoc(xs)(x));
    };
  };

  var snoc = function snoc(xs) {
    return function (x) {
      return unsafeFromArray(Data_Array.snoc(toArray(xs))(x));
    };
  };

  var singleton = function singleton($60) {
    return unsafeFromArray(Data_Array.singleton($60));
  };

  var fromArray = function fromArray(xs) {
    if (Data_Array.length(xs) > 0) {
      return new Data_Maybe.Just(unsafeFromArray(xs));
    }

    ;

    if (Data_Boolean.otherwise) {
      return Data_Maybe.Nothing.value;
    }

    ;
    throw new Error("Failed pattern match at Data.Array.NonEmpty (line 159, column 1 - line 159, column 58): " + [xs.constructor.name]);
  };

  var cons$prime = function cons$prime(x) {
    return function (xs) {
      return unsafeFromArray(Data_Array.cons(x)(xs));
    };
  };

  var adaptMaybe = function adaptMaybe(f) {
    var $75 = Data_Maybe.fromJust();
    return function ($76) {
      return $75(f(toArray($76)));
    };
  };

  var head = adaptMaybe(Data_Array.head);
  var init = adaptMaybe(Data_Array.init);
  var last = adaptMaybe(Data_Array.last);
  var tail = adaptMaybe(Data_Array.tail);

  var adaptAny = function adaptAny(f) {
    return function ($78) {
      return f(toArray($78));
    };
  };

  var index = adaptAny(Data_Array.index);
  var length = adaptAny(Data_Array.length);

  var unsafeAdapt = function unsafeAdapt(f) {
    var $79 = adaptAny(f);
    return function ($80) {
      return unsafeFromArray($79($80));
    };
  };

  var cons = function cons(x) {
    return unsafeAdapt(Data_Array.cons(x));
  };

  exports["fromArray"] = fromArray;
  exports["singleton"] = singleton;
  exports["cons"] = cons;
  exports["cons'"] = cons$prime;
  exports["snoc"] = snoc;
  exports["snoc'"] = snoc$prime;
  exports["head"] = head;
  exports["last"] = last;
  exports["tail"] = tail;
  exports["init"] = init;
  exports["index"] = index;
})(PS);

(function (exports) {
  "use strict";

  exports.intSub = function (x) {
    return function (y) {
      /* jshint bitwise: false */
      return x - y | 0;
    };
  };
})(PS["Data.Ring"] = PS["Data.Ring"] || {});

(function (exports) {
  "use strict";

  exports.intAdd = function (x) {
    return function (y) {
      /* jshint bitwise: false */
      return x + y | 0;
    };
  };

  exports.intMul = function (x) {
    return function (y) {
      /* jshint bitwise: false */
      return x * y | 0;
    };
  };
})(PS["Data.Semiring"] = PS["Data.Semiring"] || {});

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Data.Semiring"] = $PS["Data.Semiring"] || {};
  var exports = $PS["Data.Semiring"];
  var $foreign = $PS["Data.Semiring"];

  var Semiring = function Semiring(add, mul, one, zero) {
    this.add = add;
    this.mul = mul;
    this.one = one;
    this.zero = zero;
  };

  var semiringInt = new Semiring($foreign.intAdd, $foreign.intMul, 1, 0);

  var add = function add(dict) {
    return dict.add;
  };

  exports["add"] = add;
  exports["semiringInt"] = semiringInt;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Data.Ring"] = $PS["Data.Ring"] || {};
  var exports = $PS["Data.Ring"];
  var $foreign = $PS["Data.Ring"];
  var Data_Semiring = $PS["Data.Semiring"];

  var Ring = function Ring(Semiring0, sub) {
    this.Semiring0 = Semiring0;
    this.sub = sub;
  };

  var ringInt = new Ring(function () {
    return Data_Semiring.semiringInt;
  }, $foreign.intSub);
  exports["ringInt"] = ringInt;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Data.CommutativeRing"] = $PS["Data.CommutativeRing"] || {};
  var exports = $PS["Data.CommutativeRing"];
  var Data_Ring = $PS["Data.Ring"];

  var CommutativeRing = function CommutativeRing(Ring0) {
    this.Ring0 = Ring0;
  };

  var commutativeRingInt = new CommutativeRing(function () {
    return Data_Ring.ringInt;
  });
  exports["commutativeRingInt"] = commutativeRingInt;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Data.Exists"] = $PS["Data.Exists"] || {};
  var exports = $PS["Data.Exists"];
  var Unsafe_Coerce = $PS["Unsafe.Coerce"];
  var runExists = Unsafe_Coerce.unsafeCoerce;
  var mkExists = Unsafe_Coerce.unsafeCoerce;
  exports["mkExists"] = mkExists;
  exports["runExists"] = runExists;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Data.Coyoneda"] = $PS["Data.Coyoneda"] || {};
  var exports = $PS["Data.Coyoneda"];
  var Control_Category = $PS["Control.Category"];
  var Data_Exists = $PS["Data.Exists"];
  var Data_Functor = $PS["Data.Functor"];

  var CoyonedaF = function () {
    function CoyonedaF(value0, value1) {
      this.value0 = value0;
      this.value1 = value1;
    }

    ;

    CoyonedaF.create = function (value0) {
      return function (value1) {
        return new CoyonedaF(value0, value1);
      };
    };

    return CoyonedaF;
  }();

  var Coyoneda = function Coyoneda(x) {
    return x;
  };

  var unCoyoneda = function unCoyoneda(f) {
    return function (v) {
      return Data_Exists.runExists(function (v1) {
        return f(v1.value0)(v1.value1);
      })(v);
    };
  };

  var coyoneda = function coyoneda(k) {
    return function (fi) {
      return Coyoneda(Data_Exists.mkExists(new CoyonedaF(k, fi)));
    };
  };

  var functorCoyoneda = new Data_Functor.Functor(function (f) {
    return function (v) {
      return Data_Exists.runExists(function (v1) {
        return coyoneda(function ($84) {
          return f(v1.value0($84));
        })(v1.value1);
      })(v);
    };
  });
  var liftCoyoneda = coyoneda(Control_Category.identity(Control_Category.categoryFn));
  exports["unCoyoneda"] = unCoyoneda;
  exports["liftCoyoneda"] = liftCoyoneda;
  exports["functorCoyoneda"] = functorCoyoneda;
})(PS);

(function (exports) {
  "use strict";

  exports.intDegree = function (x) {
    return Math.min(Math.abs(x), 2147483647);
  }; // See the Euclidean definition in
  // https://en.m.wikipedia.org/wiki/Modulo_operation.


  exports.intDiv = function (x) {
    return function (y) {
      if (y === 0) return 0;
      return y > 0 ? Math.floor(x / y) : -Math.floor(x / -y);
    };
  };

  exports.intMod = function (x) {
    return function (y) {
      if (y === 0) return 0;
      var yy = Math.abs(y);
      return (x % yy + yy) % yy;
    };
  };
})(PS["Data.EuclideanRing"] = PS["Data.EuclideanRing"] || {});

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Data.EuclideanRing"] = $PS["Data.EuclideanRing"] || {};
  var exports = $PS["Data.EuclideanRing"];
  var $foreign = $PS["Data.EuclideanRing"];
  var Data_CommutativeRing = $PS["Data.CommutativeRing"];

  var EuclideanRing = function EuclideanRing(CommutativeRing0, degree, div, mod) {
    this.CommutativeRing0 = CommutativeRing0;
    this.degree = degree;
    this.div = div;
    this.mod = mod;
  };

  var mod = function mod(dict) {
    return dict.mod;
  };

  var euclideanRingInt = new EuclideanRing(function () {
    return Data_CommutativeRing.commutativeRingInt;
  }, $foreign.intDegree, $foreign.intDiv, $foreign.intMod);
  exports["mod"] = mod;
  exports["euclideanRingInt"] = euclideanRingInt;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Data.Generic.Rep"] = $PS["Data.Generic.Rep"] || {};
  var exports = $PS["Data.Generic.Rep"];

  var Inl = function () {
    function Inl(value0) {
      this.value0 = value0;
    }

    ;

    Inl.create = function (value0) {
      return new Inl(value0);
    };

    return Inl;
  }();

  var Inr = function () {
    function Inr(value0) {
      this.value0 = value0;
    }

    ;

    Inr.create = function (value0) {
      return new Inr(value0);
    };

    return Inr;
  }();

  var NoArguments = function () {
    function NoArguments() {}

    ;
    NoArguments.value = new NoArguments();
    return NoArguments;
  }();

  var Generic = function Generic(from, to) {
    this.from = from;
    this.to = to;
  };

  var Constructor = function Constructor(x) {
    return x;
  };

  var Argument = function Argument(x) {
    return x;
  };

  var to = function to(dict) {
    return dict.to;
  };

  var from = function from(dict) {
    return dict.from;
  };

  exports["Generic"] = Generic;
  exports["to"] = to;
  exports["from"] = from;
  exports["NoArguments"] = NoArguments;
  exports["Inl"] = Inl;
  exports["Inr"] = Inr;
  exports["Constructor"] = Constructor;
  exports["Argument"] = Argument;
})(PS);

(function (exports) {
  "use strict";

  var unsafeCompareImpl = function unsafeCompareImpl(lt) {
    return function (eq) {
      return function (gt) {
        return function (x) {
          return function (y) {
            return x < y ? lt : x === y ? eq : gt;
          };
        };
      };
    };
  };

  exports.ordIntImpl = unsafeCompareImpl;
  exports.ordStringImpl = unsafeCompareImpl;
})(PS["Data.Ord"] = PS["Data.Ord"] || {});

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Data.Ordering"] = $PS["Data.Ordering"] || {};
  var exports = $PS["Data.Ordering"];

  var LT = function () {
    function LT() {}

    ;
    LT.value = new LT();
    return LT;
  }();

  var GT = function () {
    function GT() {}

    ;
    GT.value = new GT();
    return GT;
  }();

  var EQ = function () {
    function EQ() {}

    ;
    EQ.value = new EQ();
    return EQ;
  }();

  exports["LT"] = LT;
  exports["GT"] = GT;
  exports["EQ"] = EQ;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Data.Ord"] = $PS["Data.Ord"] || {};
  var exports = $PS["Data.Ord"];
  var $foreign = $PS["Data.Ord"];
  var Data_Eq = $PS["Data.Eq"];
  var Data_Ordering = $PS["Data.Ordering"];

  var Ord = function Ord(Eq0, compare) {
    this.Eq0 = Eq0;
    this.compare = compare;
  };

  var ordString = new Ord(function () {
    return Data_Eq.eqString;
  }, $foreign.ordStringImpl(Data_Ordering.LT.value)(Data_Ordering.EQ.value)(Data_Ordering.GT.value));
  var ordInt = new Ord(function () {
    return Data_Eq.eqInt;
  }, $foreign.ordIntImpl(Data_Ordering.LT.value)(Data_Ordering.EQ.value)(Data_Ordering.GT.value));

  var compare = function compare(dict) {
    return dict.compare;
  };

  exports["compare"] = compare;
  exports["ordInt"] = ordInt;
  exports["ordString"] = ordString;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Data.Map.Internal"] = $PS["Data.Map.Internal"] || {};
  var exports = $PS["Data.Map.Internal"];
  var Control_Applicative = $PS["Control.Applicative"];
  var Data_Foldable = $PS["Data.Foldable"];
  var Data_List_Types = $PS["Data.List.Types"];
  var Data_Maybe = $PS["Data.Maybe"];
  var Data_Ord = $PS["Data.Ord"];
  var Data_Ordering = $PS["Data.Ordering"];
  var Data_Semigroup = $PS["Data.Semigroup"];
  var Data_Tuple = $PS["Data.Tuple"];

  var Leaf = function () {
    function Leaf() {}

    ;
    Leaf.value = new Leaf();
    return Leaf;
  }();

  var Two = function () {
    function Two(value0, value1, value2, value3) {
      this.value0 = value0;
      this.value1 = value1;
      this.value2 = value2;
      this.value3 = value3;
    }

    ;

    Two.create = function (value0) {
      return function (value1) {
        return function (value2) {
          return function (value3) {
            return new Two(value0, value1, value2, value3);
          };
        };
      };
    };

    return Two;
  }();

  var Three = function () {
    function Three(value0, value1, value2, value3, value4, value5, value6) {
      this.value0 = value0;
      this.value1 = value1;
      this.value2 = value2;
      this.value3 = value3;
      this.value4 = value4;
      this.value5 = value5;
      this.value6 = value6;
    }

    ;

    Three.create = function (value0) {
      return function (value1) {
        return function (value2) {
          return function (value3) {
            return function (value4) {
              return function (value5) {
                return function (value6) {
                  return new Three(value0, value1, value2, value3, value4, value5, value6);
                };
              };
            };
          };
        };
      };
    };

    return Three;
  }();

  var TwoLeft = function () {
    function TwoLeft(value0, value1, value2) {
      this.value0 = value0;
      this.value1 = value1;
      this.value2 = value2;
    }

    ;

    TwoLeft.create = function (value0) {
      return function (value1) {
        return function (value2) {
          return new TwoLeft(value0, value1, value2);
        };
      };
    };

    return TwoLeft;
  }();

  var TwoRight = function () {
    function TwoRight(value0, value1, value2) {
      this.value0 = value0;
      this.value1 = value1;
      this.value2 = value2;
    }

    ;

    TwoRight.create = function (value0) {
      return function (value1) {
        return function (value2) {
          return new TwoRight(value0, value1, value2);
        };
      };
    };

    return TwoRight;
  }();

  var ThreeLeft = function () {
    function ThreeLeft(value0, value1, value2, value3, value4, value5) {
      this.value0 = value0;
      this.value1 = value1;
      this.value2 = value2;
      this.value3 = value3;
      this.value4 = value4;
      this.value5 = value5;
    }

    ;

    ThreeLeft.create = function (value0) {
      return function (value1) {
        return function (value2) {
          return function (value3) {
            return function (value4) {
              return function (value5) {
                return new ThreeLeft(value0, value1, value2, value3, value4, value5);
              };
            };
          };
        };
      };
    };

    return ThreeLeft;
  }();

  var ThreeMiddle = function () {
    function ThreeMiddle(value0, value1, value2, value3, value4, value5) {
      this.value0 = value0;
      this.value1 = value1;
      this.value2 = value2;
      this.value3 = value3;
      this.value4 = value4;
      this.value5 = value5;
    }

    ;

    ThreeMiddle.create = function (value0) {
      return function (value1) {
        return function (value2) {
          return function (value3) {
            return function (value4) {
              return function (value5) {
                return new ThreeMiddle(value0, value1, value2, value3, value4, value5);
              };
            };
          };
        };
      };
    };

    return ThreeMiddle;
  }();

  var ThreeRight = function () {
    function ThreeRight(value0, value1, value2, value3, value4, value5) {
      this.value0 = value0;
      this.value1 = value1;
      this.value2 = value2;
      this.value3 = value3;
      this.value4 = value4;
      this.value5 = value5;
    }

    ;

    ThreeRight.create = function (value0) {
      return function (value1) {
        return function (value2) {
          return function (value3) {
            return function (value4) {
              return function (value5) {
                return new ThreeRight(value0, value1, value2, value3, value4, value5);
              };
            };
          };
        };
      };
    };

    return ThreeRight;
  }();

  var KickUp = function () {
    function KickUp(value0, value1, value2, value3) {
      this.value0 = value0;
      this.value1 = value1;
      this.value2 = value2;
      this.value3 = value3;
    }

    ;

    KickUp.create = function (value0) {
      return function (value1) {
        return function (value2) {
          return function (value3) {
            return new KickUp(value0, value1, value2, value3);
          };
        };
      };
    };

    return KickUp;
  }();

  var values = function values(v) {
    if (v instanceof Leaf) {
      return Data_List_Types.Nil.value;
    }

    ;

    if (v instanceof Two) {
      return Data_Semigroup.append(Data_List_Types.semigroupList)(values(v.value0))(Data_Semigroup.append(Data_List_Types.semigroupList)(Control_Applicative.pure(Data_List_Types.applicativeList)(v.value2))(values(v.value3)));
    }

    ;

    if (v instanceof Three) {
      return Data_Semigroup.append(Data_List_Types.semigroupList)(values(v.value0))(Data_Semigroup.append(Data_List_Types.semigroupList)(Control_Applicative.pure(Data_List_Types.applicativeList)(v.value2))(Data_Semigroup.append(Data_List_Types.semigroupList)(values(v.value3))(Data_Semigroup.append(Data_List_Types.semigroupList)(Control_Applicative.pure(Data_List_Types.applicativeList)(v.value5))(values(v.value6)))));
    }

    ;
    throw new Error("Failed pattern match at Data.Map.Internal (line 626, column 1 - line 626, column 40): " + [v.constructor.name]);
  };

  var lookup = function lookup(dictOrd) {
    return function (k) {
      var comp = Data_Ord.compare(dictOrd);

      var go = function go($copy_v) {
        var $tco_done = false;
        var $tco_result;

        function $tco_loop(v) {
          if (v instanceof Leaf) {
            $tco_done = true;
            return Data_Maybe.Nothing.value;
          }

          ;

          if (v instanceof Two) {
            var v2 = comp(k)(v.value1);

            if (v2 instanceof Data_Ordering.EQ) {
              $tco_done = true;
              return new Data_Maybe.Just(v.value2);
            }

            ;

            if (v2 instanceof Data_Ordering.LT) {
              $copy_v = v.value0;
              return;
            }

            ;
            $copy_v = v.value3;
            return;
          }

          ;

          if (v instanceof Three) {
            var v3 = comp(k)(v.value1);

            if (v3 instanceof Data_Ordering.EQ) {
              $tco_done = true;
              return new Data_Maybe.Just(v.value2);
            }

            ;
            var v4 = comp(k)(v.value4);

            if (v4 instanceof Data_Ordering.EQ) {
              $tco_done = true;
              return new Data_Maybe.Just(v.value5);
            }

            ;

            if (v3 instanceof Data_Ordering.LT) {
              $copy_v = v.value0;
              return;
            }

            ;

            if (v4 instanceof Data_Ordering.GT) {
              $copy_v = v.value6;
              return;
            }

            ;
            $copy_v = v.value3;
            return;
          }

          ;
          throw new Error("Failed pattern match at Data.Map.Internal (line 211, column 5 - line 211, column 22): " + [v.constructor.name]);
        }

        ;

        while (!$tco_done) {
          $tco_result = $tco_loop($copy_v);
        }

        ;
        return $tco_result;
      };

      return go;
    };
  };

  var fromZipper = function fromZipper($copy_dictOrd) {
    return function ($copy_v) {
      return function ($copy_tree) {
        var $tco_var_dictOrd = $copy_dictOrd;
        var $tco_var_v = $copy_v;
        var $tco_done = false;
        var $tco_result;

        function $tco_loop(dictOrd, v, tree) {
          if (v instanceof Data_List_Types.Nil) {
            $tco_done = true;
            return tree;
          }

          ;

          if (v instanceof Data_List_Types.Cons) {
            if (v.value0 instanceof TwoLeft) {
              $tco_var_dictOrd = dictOrd;
              $tco_var_v = v.value1;
              $copy_tree = new Two(tree, v.value0.value0, v.value0.value1, v.value0.value2);
              return;
            }

            ;

            if (v.value0 instanceof TwoRight) {
              $tco_var_dictOrd = dictOrd;
              $tco_var_v = v.value1;
              $copy_tree = new Two(v.value0.value0, v.value0.value1, v.value0.value2, tree);
              return;
            }

            ;

            if (v.value0 instanceof ThreeLeft) {
              $tco_var_dictOrd = dictOrd;
              $tco_var_v = v.value1;
              $copy_tree = new Three(tree, v.value0.value0, v.value0.value1, v.value0.value2, v.value0.value3, v.value0.value4, v.value0.value5);
              return;
            }

            ;

            if (v.value0 instanceof ThreeMiddle) {
              $tco_var_dictOrd = dictOrd;
              $tco_var_v = v.value1;
              $copy_tree = new Three(v.value0.value0, v.value0.value1, v.value0.value2, tree, v.value0.value3, v.value0.value4, v.value0.value5);
              return;
            }

            ;

            if (v.value0 instanceof ThreeRight) {
              $tco_var_dictOrd = dictOrd;
              $tco_var_v = v.value1;
              $copy_tree = new Three(v.value0.value0, v.value0.value1, v.value0.value2, v.value0.value3, v.value0.value4, v.value0.value5, tree);
              return;
            }

            ;
            throw new Error("Failed pattern match at Data.Map.Internal (line 432, column 3 - line 437, column 88): " + [v.value0.constructor.name]);
          }

          ;
          throw new Error("Failed pattern match at Data.Map.Internal (line 429, column 1 - line 429, column 80): " + [v.constructor.name, tree.constructor.name]);
        }

        ;

        while (!$tco_done) {
          $tco_result = $tco_loop($tco_var_dictOrd, $tco_var_v, $copy_tree);
        }

        ;
        return $tco_result;
      };
    };
  };

  var insert = function insert(dictOrd) {
    return function (k) {
      return function (v) {
        var up = function up($copy_v1) {
          return function ($copy_v2) {
            var $tco_var_v1 = $copy_v1;
            var $tco_done = false;
            var $tco_result;

            function $tco_loop(v1, v2) {
              if (v1 instanceof Data_List_Types.Nil) {
                $tco_done = true;
                return new Two(v2.value0, v2.value1, v2.value2, v2.value3);
              }

              ;

              if (v1 instanceof Data_List_Types.Cons) {
                if (v1.value0 instanceof TwoLeft) {
                  $tco_done = true;
                  return fromZipper(dictOrd)(v1.value1)(new Three(v2.value0, v2.value1, v2.value2, v2.value3, v1.value0.value0, v1.value0.value1, v1.value0.value2));
                }

                ;

                if (v1.value0 instanceof TwoRight) {
                  $tco_done = true;
                  return fromZipper(dictOrd)(v1.value1)(new Three(v1.value0.value0, v1.value0.value1, v1.value0.value2, v2.value0, v2.value1, v2.value2, v2.value3));
                }

                ;

                if (v1.value0 instanceof ThreeLeft) {
                  $tco_var_v1 = v1.value1;
                  $copy_v2 = new KickUp(new Two(v2.value0, v2.value1, v2.value2, v2.value3), v1.value0.value0, v1.value0.value1, new Two(v1.value0.value2, v1.value0.value3, v1.value0.value4, v1.value0.value5));
                  return;
                }

                ;

                if (v1.value0 instanceof ThreeMiddle) {
                  $tco_var_v1 = v1.value1;
                  $copy_v2 = new KickUp(new Two(v1.value0.value0, v1.value0.value1, v1.value0.value2, v2.value0), v2.value1, v2.value2, new Two(v2.value3, v1.value0.value3, v1.value0.value4, v1.value0.value5));
                  return;
                }

                ;

                if (v1.value0 instanceof ThreeRight) {
                  $tco_var_v1 = v1.value1;
                  $copy_v2 = new KickUp(new Two(v1.value0.value0, v1.value0.value1, v1.value0.value2, v1.value0.value3), v1.value0.value4, v1.value0.value5, new Two(v2.value0, v2.value1, v2.value2, v2.value3));
                  return;
                }

                ;
                throw new Error("Failed pattern match at Data.Map.Internal (line 468, column 5 - line 473, column 108): " + [v1.value0.constructor.name, v2.constructor.name]);
              }

              ;
              throw new Error("Failed pattern match at Data.Map.Internal (line 465, column 3 - line 465, column 56): " + [v1.constructor.name, v2.constructor.name]);
            }

            ;

            while (!$tco_done) {
              $tco_result = $tco_loop($tco_var_v1, $copy_v2);
            }

            ;
            return $tco_result;
          };
        };

        var comp = Data_Ord.compare(dictOrd);

        var down = function down($copy_ctx) {
          return function ($copy_v1) {
            var $tco_var_ctx = $copy_ctx;
            var $tco_done = false;
            var $tco_result;

            function $tco_loop(ctx, v1) {
              if (v1 instanceof Leaf) {
                $tco_done = true;
                return up(ctx)(new KickUp(Leaf.value, k, v, Leaf.value));
              }

              ;

              if (v1 instanceof Two) {
                var v2 = comp(k)(v1.value1);

                if (v2 instanceof Data_Ordering.EQ) {
                  $tco_done = true;
                  return fromZipper(dictOrd)(ctx)(new Two(v1.value0, k, v, v1.value3));
                }

                ;

                if (v2 instanceof Data_Ordering.LT) {
                  $tco_var_ctx = new Data_List_Types.Cons(new TwoLeft(v1.value1, v1.value2, v1.value3), ctx);
                  $copy_v1 = v1.value0;
                  return;
                }

                ;
                $tco_var_ctx = new Data_List_Types.Cons(new TwoRight(v1.value0, v1.value1, v1.value2), ctx);
                $copy_v1 = v1.value3;
                return;
              }

              ;

              if (v1 instanceof Three) {
                var v3 = comp(k)(v1.value1);

                if (v3 instanceof Data_Ordering.EQ) {
                  $tco_done = true;
                  return fromZipper(dictOrd)(ctx)(new Three(v1.value0, k, v, v1.value3, v1.value4, v1.value5, v1.value6));
                }

                ;
                var v4 = comp(k)(v1.value4);

                if (v4 instanceof Data_Ordering.EQ) {
                  $tco_done = true;
                  return fromZipper(dictOrd)(ctx)(new Three(v1.value0, v1.value1, v1.value2, v1.value3, k, v, v1.value6));
                }

                ;

                if (v3 instanceof Data_Ordering.LT) {
                  $tco_var_ctx = new Data_List_Types.Cons(new ThreeLeft(v1.value1, v1.value2, v1.value3, v1.value4, v1.value5, v1.value6), ctx);
                  $copy_v1 = v1.value0;
                  return;
                }

                ;

                if (v3 instanceof Data_Ordering.GT && v4 instanceof Data_Ordering.LT) {
                  $tco_var_ctx = new Data_List_Types.Cons(new ThreeMiddle(v1.value0, v1.value1, v1.value2, v1.value4, v1.value5, v1.value6), ctx);
                  $copy_v1 = v1.value3;
                  return;
                }

                ;
                $tco_var_ctx = new Data_List_Types.Cons(new ThreeRight(v1.value0, v1.value1, v1.value2, v1.value3, v1.value4, v1.value5), ctx);
                $copy_v1 = v1.value6;
                return;
              }

              ;
              throw new Error("Failed pattern match at Data.Map.Internal (line 448, column 3 - line 448, column 55): " + [ctx.constructor.name, v1.constructor.name]);
            }

            ;

            while (!$tco_done) {
              $tco_result = $tco_loop($tco_var_ctx, $copy_v1);
            }

            ;
            return $tco_result;
          };
        };

        return down(Data_List_Types.Nil.value);
      };
    };
  };

  var pop = function pop(dictOrd) {
    return function (k) {
      var up = function up($copy_ctxs) {
        return function ($copy_tree) {
          var $tco_var_ctxs = $copy_ctxs;
          var $tco_done = false;
          var $tco_result;

          function $tco_loop(ctxs, tree) {
            if (ctxs instanceof Data_List_Types.Nil) {
              $tco_done = true;
              return tree;
            }

            ;

            if (ctxs instanceof Data_List_Types.Cons) {
              if (ctxs.value0 instanceof TwoLeft && ctxs.value0.value2 instanceof Leaf && tree instanceof Leaf) {
                $tco_done = true;
                return fromZipper(dictOrd)(ctxs.value1)(new Two(Leaf.value, ctxs.value0.value0, ctxs.value0.value1, Leaf.value));
              }

              ;

              if (ctxs.value0 instanceof TwoRight && ctxs.value0.value0 instanceof Leaf && tree instanceof Leaf) {
                $tco_done = true;
                return fromZipper(dictOrd)(ctxs.value1)(new Two(Leaf.value, ctxs.value0.value1, ctxs.value0.value2, Leaf.value));
              }

              ;

              if (ctxs.value0 instanceof TwoLeft && ctxs.value0.value2 instanceof Two) {
                $tco_var_ctxs = ctxs.value1;
                $copy_tree = new Three(tree, ctxs.value0.value0, ctxs.value0.value1, ctxs.value0.value2.value0, ctxs.value0.value2.value1, ctxs.value0.value2.value2, ctxs.value0.value2.value3);
                return;
              }

              ;

              if (ctxs.value0 instanceof TwoRight && ctxs.value0.value0 instanceof Two) {
                $tco_var_ctxs = ctxs.value1;
                $copy_tree = new Three(ctxs.value0.value0.value0, ctxs.value0.value0.value1, ctxs.value0.value0.value2, ctxs.value0.value0.value3, ctxs.value0.value1, ctxs.value0.value2, tree);
                return;
              }

              ;

              if (ctxs.value0 instanceof TwoLeft && ctxs.value0.value2 instanceof Three) {
                $tco_done = true;
                return fromZipper(dictOrd)(ctxs.value1)(new Two(new Two(tree, ctxs.value0.value0, ctxs.value0.value1, ctxs.value0.value2.value0), ctxs.value0.value2.value1, ctxs.value0.value2.value2, new Two(ctxs.value0.value2.value3, ctxs.value0.value2.value4, ctxs.value0.value2.value5, ctxs.value0.value2.value6)));
              }

              ;

              if (ctxs.value0 instanceof TwoRight && ctxs.value0.value0 instanceof Three) {
                $tco_done = true;
                return fromZipper(dictOrd)(ctxs.value1)(new Two(new Two(ctxs.value0.value0.value0, ctxs.value0.value0.value1, ctxs.value0.value0.value2, ctxs.value0.value0.value3), ctxs.value0.value0.value4, ctxs.value0.value0.value5, new Two(ctxs.value0.value0.value6, ctxs.value0.value1, ctxs.value0.value2, tree)));
              }

              ;

              if (ctxs.value0 instanceof ThreeLeft && ctxs.value0.value2 instanceof Leaf && ctxs.value0.value5 instanceof Leaf && tree instanceof Leaf) {
                $tco_done = true;
                return fromZipper(dictOrd)(ctxs.value1)(new Three(Leaf.value, ctxs.value0.value0, ctxs.value0.value1, Leaf.value, ctxs.value0.value3, ctxs.value0.value4, Leaf.value));
              }

              ;

              if (ctxs.value0 instanceof ThreeMiddle && ctxs.value0.value0 instanceof Leaf && ctxs.value0.value5 instanceof Leaf && tree instanceof Leaf) {
                $tco_done = true;
                return fromZipper(dictOrd)(ctxs.value1)(new Three(Leaf.value, ctxs.value0.value1, ctxs.value0.value2, Leaf.value, ctxs.value0.value3, ctxs.value0.value4, Leaf.value));
              }

              ;

              if (ctxs.value0 instanceof ThreeRight && ctxs.value0.value0 instanceof Leaf && ctxs.value0.value3 instanceof Leaf && tree instanceof Leaf) {
                $tco_done = true;
                return fromZipper(dictOrd)(ctxs.value1)(new Three(Leaf.value, ctxs.value0.value1, ctxs.value0.value2, Leaf.value, ctxs.value0.value4, ctxs.value0.value5, Leaf.value));
              }

              ;

              if (ctxs.value0 instanceof ThreeLeft && ctxs.value0.value2 instanceof Two) {
                $tco_done = true;
                return fromZipper(dictOrd)(ctxs.value1)(new Two(new Three(tree, ctxs.value0.value0, ctxs.value0.value1, ctxs.value0.value2.value0, ctxs.value0.value2.value1, ctxs.value0.value2.value2, ctxs.value0.value2.value3), ctxs.value0.value3, ctxs.value0.value4, ctxs.value0.value5));
              }

              ;

              if (ctxs.value0 instanceof ThreeMiddle && ctxs.value0.value0 instanceof Two) {
                $tco_done = true;
                return fromZipper(dictOrd)(ctxs.value1)(new Two(new Three(ctxs.value0.value0.value0, ctxs.value0.value0.value1, ctxs.value0.value0.value2, ctxs.value0.value0.value3, ctxs.value0.value1, ctxs.value0.value2, tree), ctxs.value0.value3, ctxs.value0.value4, ctxs.value0.value5));
              }

              ;

              if (ctxs.value0 instanceof ThreeMiddle && ctxs.value0.value5 instanceof Two) {
                $tco_done = true;
                return fromZipper(dictOrd)(ctxs.value1)(new Two(ctxs.value0.value0, ctxs.value0.value1, ctxs.value0.value2, new Three(tree, ctxs.value0.value3, ctxs.value0.value4, ctxs.value0.value5.value0, ctxs.value0.value5.value1, ctxs.value0.value5.value2, ctxs.value0.value5.value3)));
              }

              ;

              if (ctxs.value0 instanceof ThreeRight && ctxs.value0.value3 instanceof Two) {
                $tco_done = true;
                return fromZipper(dictOrd)(ctxs.value1)(new Two(ctxs.value0.value0, ctxs.value0.value1, ctxs.value0.value2, new Three(ctxs.value0.value3.value0, ctxs.value0.value3.value1, ctxs.value0.value3.value2, ctxs.value0.value3.value3, ctxs.value0.value4, ctxs.value0.value5, tree)));
              }

              ;

              if (ctxs.value0 instanceof ThreeLeft && ctxs.value0.value2 instanceof Three) {
                $tco_done = true;
                return fromZipper(dictOrd)(ctxs.value1)(new Three(new Two(tree, ctxs.value0.value0, ctxs.value0.value1, ctxs.value0.value2.value0), ctxs.value0.value2.value1, ctxs.value0.value2.value2, new Two(ctxs.value0.value2.value3, ctxs.value0.value2.value4, ctxs.value0.value2.value5, ctxs.value0.value2.value6), ctxs.value0.value3, ctxs.value0.value4, ctxs.value0.value5));
              }

              ;

              if (ctxs.value0 instanceof ThreeMiddle && ctxs.value0.value0 instanceof Three) {
                $tco_done = true;
                return fromZipper(dictOrd)(ctxs.value1)(new Three(new Two(ctxs.value0.value0.value0, ctxs.value0.value0.value1, ctxs.value0.value0.value2, ctxs.value0.value0.value3), ctxs.value0.value0.value4, ctxs.value0.value0.value5, new Two(ctxs.value0.value0.value6, ctxs.value0.value1, ctxs.value0.value2, tree), ctxs.value0.value3, ctxs.value0.value4, ctxs.value0.value5));
              }

              ;

              if (ctxs.value0 instanceof ThreeMiddle && ctxs.value0.value5 instanceof Three) {
                $tco_done = true;
                return fromZipper(dictOrd)(ctxs.value1)(new Three(ctxs.value0.value0, ctxs.value0.value1, ctxs.value0.value2, new Two(tree, ctxs.value0.value3, ctxs.value0.value4, ctxs.value0.value5.value0), ctxs.value0.value5.value1, ctxs.value0.value5.value2, new Two(ctxs.value0.value5.value3, ctxs.value0.value5.value4, ctxs.value0.value5.value5, ctxs.value0.value5.value6)));
              }

              ;

              if (ctxs.value0 instanceof ThreeRight && ctxs.value0.value3 instanceof Three) {
                $tco_done = true;
                return fromZipper(dictOrd)(ctxs.value1)(new Three(ctxs.value0.value0, ctxs.value0.value1, ctxs.value0.value2, new Two(ctxs.value0.value3.value0, ctxs.value0.value3.value1, ctxs.value0.value3.value2, ctxs.value0.value3.value3), ctxs.value0.value3.value4, ctxs.value0.value3.value5, new Two(ctxs.value0.value3.value6, ctxs.value0.value4, ctxs.value0.value5, tree)));
              }

              ;
              throw new Error("Failed pattern match at Data.Map.Internal (line 525, column 9 - line 542, column 136): " + [ctxs.value0.constructor.name, tree.constructor.name]);
            }

            ;
            throw new Error("Failed pattern match at Data.Map.Internal (line 522, column 5 - line 542, column 136): " + [ctxs.constructor.name]);
          }

          ;

          while (!$tco_done) {
            $tco_result = $tco_loop($tco_var_ctxs, $copy_tree);
          }

          ;
          return $tco_result;
        };
      };

      var removeMaxNode = function removeMaxNode($copy_ctx) {
        return function ($copy_m) {
          var $tco_var_ctx = $copy_ctx;
          var $tco_done = false;
          var $tco_result;

          function $tco_loop(ctx, m) {
            if (m instanceof Two && m.value0 instanceof Leaf && m.value3 instanceof Leaf) {
              $tco_done = true;
              return up(ctx)(Leaf.value);
            }

            ;

            if (m instanceof Two) {
              $tco_var_ctx = new Data_List_Types.Cons(new TwoRight(m.value0, m.value1, m.value2), ctx);
              $copy_m = m.value3;
              return;
            }

            ;

            if (m instanceof Three && m.value0 instanceof Leaf && m.value3 instanceof Leaf && m.value6 instanceof Leaf) {
              $tco_done = true;
              return up(new Data_List_Types.Cons(new TwoRight(Leaf.value, m.value1, m.value2), ctx))(Leaf.value);
            }

            ;

            if (m instanceof Three) {
              $tco_var_ctx = new Data_List_Types.Cons(new ThreeRight(m.value0, m.value1, m.value2, m.value3, m.value4, m.value5), ctx);
              $copy_m = m.value6;
              return;
            }

            ;
            throw new Error("Failed pattern match at Data.Map.Internal (line 554, column 5 - line 558, column 107): " + [m.constructor.name]);
          }

          ;

          while (!$tco_done) {
            $tco_result = $tco_loop($tco_var_ctx, $copy_m);
          }

          ;
          return $tco_result;
        };
      };

      var maxNode = function maxNode($copy_m) {
        var $tco_done = false;
        var $tco_result;

        function $tco_loop(m) {
          if (m instanceof Two && m.value3 instanceof Leaf) {
            $tco_done = true;
            return {
              key: m.value1,
              value: m.value2
            };
          }

          ;

          if (m instanceof Two) {
            $copy_m = m.value3;
            return;
          }

          ;

          if (m instanceof Three && m.value6 instanceof Leaf) {
            $tco_done = true;
            return {
              key: m.value4,
              value: m.value5
            };
          }

          ;

          if (m instanceof Three) {
            $copy_m = m.value6;
            return;
          }

          ;
          throw new Error("Failed pattern match at Data.Map.Internal (line 545, column 33 - line 549, column 45): " + [m.constructor.name]);
        }

        ;

        while (!$tco_done) {
          $tco_result = $tco_loop($copy_m);
        }

        ;
        return $tco_result;
      };

      var comp = Data_Ord.compare(dictOrd);

      var down = function down($copy_ctx) {
        return function ($copy_m) {
          var $tco_var_ctx = $copy_ctx;
          var $tco_done = false;
          var $tco_result;

          function $tco_loop(ctx, m) {
            if (m instanceof Leaf) {
              $tco_done = true;
              return Data_Maybe.Nothing.value;
            }

            ;

            if (m instanceof Two) {
              var v = comp(k)(m.value1);

              if (m.value3 instanceof Leaf && v instanceof Data_Ordering.EQ) {
                $tco_done = true;
                return new Data_Maybe.Just(new Data_Tuple.Tuple(m.value2, up(ctx)(Leaf.value)));
              }

              ;

              if (v instanceof Data_Ordering.EQ) {
                var max = maxNode(m.value0);
                $tco_done = true;
                return new Data_Maybe.Just(new Data_Tuple.Tuple(m.value2, removeMaxNode(new Data_List_Types.Cons(new TwoLeft(max.key, max.value, m.value3), ctx))(m.value0)));
              }

              ;

              if (v instanceof Data_Ordering.LT) {
                $tco_var_ctx = new Data_List_Types.Cons(new TwoLeft(m.value1, m.value2, m.value3), ctx);
                $copy_m = m.value0;
                return;
              }

              ;
              $tco_var_ctx = new Data_List_Types.Cons(new TwoRight(m.value0, m.value1, m.value2), ctx);
              $copy_m = m.value3;
              return;
            }

            ;

            if (m instanceof Three) {
              var leaves = function () {
                if (m.value0 instanceof Leaf && m.value3 instanceof Leaf && m.value6 instanceof Leaf) {
                  return true;
                }

                ;
                return false;
              }();

              var v = comp(k)(m.value4);
              var v3 = comp(k)(m.value1);

              if (leaves && v3 instanceof Data_Ordering.EQ) {
                $tco_done = true;
                return new Data_Maybe.Just(new Data_Tuple.Tuple(m.value2, fromZipper(dictOrd)(ctx)(new Two(Leaf.value, m.value4, m.value5, Leaf.value))));
              }

              ;

              if (leaves && v instanceof Data_Ordering.EQ) {
                $tco_done = true;
                return new Data_Maybe.Just(new Data_Tuple.Tuple(m.value5, fromZipper(dictOrd)(ctx)(new Two(Leaf.value, m.value1, m.value2, Leaf.value))));
              }

              ;

              if (v3 instanceof Data_Ordering.EQ) {
                var max = maxNode(m.value0);
                $tco_done = true;
                return new Data_Maybe.Just(new Data_Tuple.Tuple(m.value2, removeMaxNode(new Data_List_Types.Cons(new ThreeLeft(max.key, max.value, m.value3, m.value4, m.value5, m.value6), ctx))(m.value0)));
              }

              ;

              if (v instanceof Data_Ordering.EQ) {
                var max = maxNode(m.value3);
                $tco_done = true;
                return new Data_Maybe.Just(new Data_Tuple.Tuple(m.value5, removeMaxNode(new Data_List_Types.Cons(new ThreeMiddle(m.value0, m.value1, m.value2, max.key, max.value, m.value6), ctx))(m.value3)));
              }

              ;

              if (v3 instanceof Data_Ordering.LT) {
                $tco_var_ctx = new Data_List_Types.Cons(new ThreeLeft(m.value1, m.value2, m.value3, m.value4, m.value5, m.value6), ctx);
                $copy_m = m.value0;
                return;
              }

              ;

              if (v3 instanceof Data_Ordering.GT && v instanceof Data_Ordering.LT) {
                $tco_var_ctx = new Data_List_Types.Cons(new ThreeMiddle(m.value0, m.value1, m.value2, m.value4, m.value5, m.value6), ctx);
                $copy_m = m.value3;
                return;
              }

              ;
              $tco_var_ctx = new Data_List_Types.Cons(new ThreeRight(m.value0, m.value1, m.value2, m.value3, m.value4, m.value5), ctx);
              $copy_m = m.value6;
              return;
            }

            ;
            throw new Error("Failed pattern match at Data.Map.Internal (line 495, column 34 - line 518, column 80): " + [m.constructor.name]);
          }

          ;

          while (!$tco_done) {
            $tco_result = $tco_loop($tco_var_ctx, $copy_m);
          }

          ;
          return $tco_result;
        };
      };

      return down(Data_List_Types.Nil.value);
    };
  };

  var foldableMap = new Data_Foldable.Foldable(function (dictMonoid) {
    return function (f) {
      return function (m) {
        return Data_Foldable.foldMap(Data_List_Types.foldableList)(dictMonoid)(f)(values(m));
      };
    };
  }, function (f) {
    return function (z) {
      return function (m) {
        return Data_Foldable.foldl(Data_List_Types.foldableList)(f)(z)(values(m));
      };
    };
  }, function (f) {
    return function (z) {
      return function (m) {
        return Data_Foldable.foldr(Data_List_Types.foldableList)(f)(z)(values(m));
      };
    };
  });
  var empty = Leaf.value;

  var fromFoldable = function fromFoldable(dictOrd) {
    return function (dictFoldable) {
      return Data_Foldable.foldl(dictFoldable)(function (m) {
        return function (v) {
          return insert(dictOrd)(v.value0)(v.value1)(m);
        };
      })(empty);
    };
  };

  var $$delete = function $$delete(dictOrd) {
    return function (k) {
      return function (m) {
        return Data_Maybe.maybe(m)(Data_Tuple.snd)(pop(dictOrd)(k)(m));
      };
    };
  };

  var alter = function alter(dictOrd) {
    return function (f) {
      return function (k) {
        return function (m) {
          var v = f(lookup(dictOrd)(k)(m));

          if (v instanceof Data_Maybe.Nothing) {
            return $$delete(dictOrd)(k)(m);
          }

          ;

          if (v instanceof Data_Maybe.Just) {
            return insert(dictOrd)(k)(v.value0)(m);
          }

          ;
          throw new Error("Failed pattern match at Data.Map.Internal (line 563, column 15 - line 565, column 25): " + [v.constructor.name]);
        };
      };
    };
  };

  exports["empty"] = empty;
  exports["insert"] = insert;
  exports["lookup"] = lookup;
  exports["fromFoldable"] = fromFoldable;
  exports["delete"] = $$delete;
  exports["alter"] = alter;
  exports["values"] = values;
  exports["foldableMap"] = foldableMap;
})(PS);

(function (exports) {
  /* eslint-disable no-eq-null, eqeqeq */
  "use strict";

  exports["null"] = null;

  exports.nullable = function (a, r, f) {
    return a == null ? r : f(a);
  };

  exports.notNull = function (x) {
    return x;
  };
})(PS["Data.Nullable"] = PS["Data.Nullable"] || {});

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Data.Nullable"] = $PS["Data.Nullable"] || {};
  var exports = $PS["Data.Nullable"];
  var $foreign = $PS["Data.Nullable"];
  var Data_Maybe = $PS["Data.Maybe"];
  var toNullable = Data_Maybe.maybe($foreign["null"])($foreign.notNull);

  var toMaybe = function toMaybe(n) {
    return $foreign.nullable(n, Data_Maybe.Nothing.value, Data_Maybe.Just.create);
  };

  exports["toMaybe"] = toMaybe;
  exports["toNullable"] = toNullable;
  exports["null"] = $foreign["null"];
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Data.Profunctor"] = $PS["Data.Profunctor"] || {};
  var exports = $PS["Data.Profunctor"];

  var Profunctor = function Profunctor(dimap) {
    this.dimap = dimap;
  };

  var dimap = function dimap(dict) {
    return dict.dimap;
  };

  exports["dimap"] = dimap;
  exports["Profunctor"] = Profunctor;
})(PS);

(function (exports) {
  "use strict";

  exports.length = function (s) {
    return s.length;
  };

  exports._indexOf = function (just) {
    return function (nothing) {
      return function (x) {
        return function (s) {
          var i = s.indexOf(x);
          return i === -1 ? nothing : just(i);
        };
      };
    };
  };

  exports.take = function (n) {
    return function (s) {
      return s.substr(0, n);
    };
  };

  exports.drop = function (n) {
    return function (s) {
      return s.substring(n);
    };
  };
})(PS["Data.String.CodeUnits"] = PS["Data.String.CodeUnits"] || {});

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Data.String.CodeUnits"] = $PS["Data.String.CodeUnits"] || {};
  var exports = $PS["Data.String.CodeUnits"];
  var $foreign = $PS["Data.String.CodeUnits"];
  var Data_Maybe = $PS["Data.Maybe"];
  var indexOf = $foreign["_indexOf"](Data_Maybe.Just.create)(Data_Maybe.Nothing.value);
  exports["indexOf"] = indexOf;
  exports["length"] = $foreign.length;
  exports["take"] = $foreign.take;
  exports["drop"] = $foreign.drop;
})(PS);

(function (exports) {
  "use strict";

  exports.replace = function (s1) {
    return function (s2) {
      return function (s3) {
        return s3.replace(s1, s2);
      };
    };
  };

  exports.split = function (sep) {
    return function (s) {
      return s.split(sep);
    };
  };

  exports.joinWith = function (s) {
    return function (xs) {
      return xs.join(s);
    };
  };
})(PS["Data.String.Common"] = PS["Data.String.Common"] || {});

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Data.String.Common"] = $PS["Data.String.Common"] || {};
  var exports = $PS["Data.String.Common"];
  var $foreign = $PS["Data.String.Common"];
  exports["replace"] = $foreign.replace;
  exports["split"] = $foreign.split;
  exports["joinWith"] = $foreign.joinWith;
})(PS);

(function (exports) {
  "use strict";

  exports.regexImpl = function (left) {
    return function (right) {
      return function (s1) {
        return function (s2) {
          try {
            return right(new RegExp(s1, s2));
          } catch (e) {
            return left(e.message);
          }
        };
      };
    };
  };

  exports._match = function (just) {
    return function (nothing) {
      return function (r) {
        return function (s) {
          var m = s.match(r);

          if (m == null || m.length === 0) {
            return nothing;
          } else {
            for (var i = 0; i < m.length; i++) {
              m[i] = m[i] == null ? nothing : just(m[i]);
            }

            return just(m);
          }
        };
      };
    };
  };

  exports._replaceBy = function (just) {
    return function (nothing) {
      return function (r) {
        return function (f) {
          return function (s) {
            return s.replace(r, function (match) {
              var groups = [];
              var group,
                  i = 1;

              while (typeof (group = arguments[i++]) !== "number") {
                groups.push(group == null ? nothing : just(group));
              }

              return f(match)(groups);
            });
          };
        };
      };
    };
  };
})(PS["Data.String.Regex"] = PS["Data.String.Regex"] || {});

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Data.String.Regex"] = $PS["Data.String.Regex"] || {};
  var exports = $PS["Data.String.Regex"];
  var $foreign = $PS["Data.String.Regex"];
  var Data_Either = $PS["Data.Either"];
  var Data_Maybe = $PS["Data.Maybe"];
  var replace$prime = $foreign["_replaceBy"](Data_Maybe.Just.create)(Data_Maybe.Nothing.value);

  var renderFlags = function renderFlags(v) {
    return function () {
      if (v.value0.global) {
        return "g";
      }

      ;
      return "";
    }() + (function () {
      if (v.value0.ignoreCase) {
        return "i";
      }

      ;
      return "";
    }() + (function () {
      if (v.value0.multiline) {
        return "m";
      }

      ;
      return "";
    }() + (function () {
      if (v.value0.dotAll) {
        return "s";
      }

      ;
      return "";
    }() + (function () {
      if (v.value0.sticky) {
        return "y";
      }

      ;
      return "";
    }() + function () {
      if (v.value0.unicode) {
        return "u";
      }

      ;
      return "";
    }()))));
  };

  var regex = function regex(s) {
    return function (f) {
      return $foreign.regexImpl(Data_Either.Left.create)(Data_Either.Right.create)(s)(renderFlags(f));
    };
  };

  var match = $foreign["_match"](Data_Maybe.Just.create)(Data_Maybe.Nothing.value);
  exports["regex"] = regex;
  exports["match"] = match;
  exports["replace'"] = replace$prime;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Data.String.Regex.Flags"] = $PS["Data.String.Regex.Flags"] || {};
  var exports = $PS["Data.String.Regex.Flags"];
  var Data_Semigroup = $PS["Data.Semigroup"];

  var RegexFlags = function () {
    function RegexFlags(value0) {
      this.value0 = value0;
    }

    ;

    RegexFlags.create = function (value0) {
      return new RegexFlags(value0);
    };

    return RegexFlags;
  }();

  var unicode = new RegexFlags({
    global: false,
    ignoreCase: false,
    multiline: false,
    dotAll: false,
    sticky: false,
    unicode: true
  });
  var sticky = new RegexFlags({
    global: false,
    ignoreCase: false,
    multiline: false,
    dotAll: false,
    sticky: true,
    unicode: false
  });
  var semigroupRegexFlags = new Data_Semigroup.Semigroup(function (v) {
    return function (v1) {
      return new RegexFlags({
        global: v.value0.global || v1.value0.global,
        ignoreCase: v.value0.ignoreCase || v1.value0.ignoreCase,
        multiline: v.value0.multiline || v1.value0.multiline,
        dotAll: v.value0.dotAll || v1.value0.dotAll,
        sticky: v.value0.sticky || v1.value0.sticky,
        unicode: v.value0.unicode || v1.value0.unicode
      });
    };
  });
  var noFlags = new RegexFlags({
    global: false,
    ignoreCase: false,
    multiline: false,
    dotAll: false,
    sticky: false,
    unicode: false
  });
  var multiline = new RegexFlags({
    global: false,
    ignoreCase: false,
    multiline: true,
    dotAll: false,
    sticky: false,
    unicode: false
  });
  var ignoreCase = new RegexFlags({
    global: false,
    ignoreCase: true,
    multiline: false,
    dotAll: false,
    sticky: false,
    unicode: false
  });
  var global = new RegexFlags({
    global: true,
    ignoreCase: false,
    multiline: false,
    dotAll: false,
    sticky: false,
    unicode: false
  });
  var dotAll = new RegexFlags({
    global: false,
    ignoreCase: false,
    multiline: false,
    dotAll: true,
    sticky: false,
    unicode: false
  });
  exports["noFlags"] = noFlags;
  exports["global"] = global;
  exports["multiline"] = multiline;
  exports["semigroupRegexFlags"] = semigroupRegexFlags;
})(PS);

(function (exports) {
  "use strict";

  var yaml = require("js-yaml");

  exports.parseYAMLImpl = function (left, right, str) {
    try {
      return right(yaml.load(str));
    } catch (e) {
      return left(e.toString());
    }
  };
})(PS["Data.YAML.Foreign.Decode"] = PS["Data.YAML.Foreign.Decode"] || {});

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Data.YAML.Foreign.Decode"] = $PS["Data.YAML.Foreign.Decode"] || {};
  var exports = $PS["Data.YAML.Foreign.Decode"];
  var $foreign = $PS["Data.YAML.Foreign.Decode"];
  var Control_Applicative = $PS["Control.Applicative"];
  var Control_Bind = $PS["Control.Bind"];
  var Control_Monad_Except_Trans = $PS["Control.Monad.Except.Trans"];
  var Data_Identity = $PS["Data.Identity"];
  var Foreign = $PS["Foreign"];

  var parseYAML = function parseYAML(yaml) {
    return $foreign.parseYAMLImpl(function () {
      var $0 = Foreign.fail(Data_Identity.monadIdentity);
      return function ($1) {
        return $0(Foreign.ForeignError.create($1));
      };
    }(), Control_Applicative.pure(Control_Monad_Except_Trans.applicativeExceptT(Data_Identity.monadIdentity)), yaml);
  };

  var parseYAMLToJson = function parseYAMLToJson(yaml) {
    return Control_Bind.bind(Control_Monad_Except_Trans.bindExceptT(Data_Identity.monadIdentity))(parseYAML(yaml))(function () {
      var $2 = Control_Applicative.pure(Control_Monad_Except_Trans.applicativeExceptT(Data_Identity.monadIdentity));
      return function ($3) {
        return $2($3);
      };
    }());
  };

  exports["parseYAMLToJson"] = parseYAMLToJson;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Effect.Aff.Class"] = $PS["Effect.Aff.Class"] || {};
  var exports = $PS["Effect.Aff.Class"];
  var Control_Category = $PS["Control.Category"];
  var Control_Monad_Reader_Trans = $PS["Control.Monad.Reader.Trans"];
  var Control_Monad_Trans_Class = $PS["Control.Monad.Trans.Class"];
  var Effect_Aff = $PS["Effect.Aff"];

  var MonadAff = function MonadAff(MonadEffect0, liftAff) {
    this.MonadEffect0 = MonadEffect0;
    this.liftAff = liftAff;
  };

  var monadAffAff = new MonadAff(function () {
    return Effect_Aff.monadEffectAff;
  }, Control_Category.identity(Control_Category.categoryFn));

  var liftAff = function liftAff(dict) {
    return dict.liftAff;
  };

  var monadAffReader = function monadAffReader(dictMonadAff) {
    return new MonadAff(function () {
      return Control_Monad_Reader_Trans.monadEffectReader(dictMonadAff.MonadEffect0());
    }, function () {
      var $25 = Control_Monad_Trans_Class.lift(Control_Monad_Reader_Trans.monadTransReaderT)(dictMonadAff.MonadEffect0().Monad0());
      var $26 = liftAff(dictMonadAff);
      return function ($27) {
        return $25($26($27));
      };
    }());
  };

  exports["liftAff"] = liftAff;
  exports["MonadAff"] = MonadAff;
  exports["monadAffAff"] = monadAffAff;
  exports["monadAffReader"] = monadAffReader;
})(PS);

(function (exports) {
  "use strict";

  exports.log = function (s) {
    return function () {
      console.log(s);
    };
  };

  exports.warn = function (s) {
    return function () {
      console.warn(s);
    };
  };
})(PS["Effect.Console"] = PS["Effect.Console"] || {});

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Effect.Console"] = $PS["Effect.Console"] || {};
  var exports = $PS["Effect.Console"];
  var $foreign = $PS["Effect.Console"];
  exports["log"] = $foreign.log;
  exports["warn"] = $foreign.warn;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Effect.Class.Console"] = $PS["Effect.Class.Console"] || {};
  var exports = $PS["Effect.Class.Console"];
  var Effect_Class = $PS["Effect.Class"];
  var Effect_Console = $PS["Effect.Console"];

  var log = function log(dictMonadEffect) {
    var $30 = Effect_Class.liftEffect(dictMonadEffect);
    return function ($31) {
      return $30(Effect_Console.log($31));
    };
  };

  exports["log"] = log;
})(PS);

(function (exports) {
  "use strict";

  exports["new"] = function () {
    return {};
  };
})(PS["Foreign.Object.ST"] = PS["Foreign.Object.ST"] || {});

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Foreign.Object.ST"] = $PS["Foreign.Object.ST"] || {};
  var exports = $PS["Foreign.Object.ST"];
  var $foreign = $PS["Foreign.Object.ST"];
  exports["new"] = $foreign["new"];
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Halogen.Data.Slot"] = $PS["Halogen.Data.Slot"] || {};
  var exports = $PS["Halogen.Data.Slot"];
  var Data_Foldable = $PS["Data.Foldable"];
  var Data_Map_Internal = $PS["Data.Map.Internal"];

  var foreachSlot = function foreachSlot(dictApplicative) {
    return function (v) {
      return function (k) {
        return Data_Foldable.traverse_(dictApplicative)(Data_Map_Internal.foldableMap)(function ($37) {
          return k($37);
        })(v);
      };
    };
  };

  var empty = Data_Map_Internal.empty;
  exports["empty"] = empty;
  exports["foreachSlot"] = foreachSlot;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Halogen.Aff.Driver.State"] = $PS["Halogen.Aff.Driver.State"] || {};
  var exports = $PS["Halogen.Aff.Driver.State"];
  var Data_Foldable = $PS["Data.Foldable"];
  var Data_List_Types = $PS["Data.List.Types"];
  var Data_Map_Internal = $PS["Data.Map.Internal"];
  var Data_Maybe = $PS["Data.Maybe"];
  var Effect_Ref = $PS["Effect.Ref"];
  var Halogen_Data_Slot = $PS["Halogen.Data.Slot"];
  var Unsafe_Coerce = $PS["Unsafe.Coerce"];
  var unRenderStateX = Unsafe_Coerce.unsafeCoerce;
  var unDriverStateX = Unsafe_Coerce.unsafeCoerce;

  var renderStateX_ = function renderStateX_(dictApplicative) {
    return function (f) {
      return unDriverStateX(function (st) {
        return Data_Foldable.traverse_(dictApplicative)(Data_Foldable.foldableMaybe)(f)(st.rendering);
      });
    };
  };

  var mkRenderStateX = Unsafe_Coerce.unsafeCoerce;

  var renderStateX = function renderStateX(dictFunctor) {
    return function (f) {
      return unDriverStateX(function (st) {
        return mkRenderStateX(f(st.rendering));
      });
    };
  };

  var mkDriverStateXRef = Unsafe_Coerce.unsafeCoerce;

  var mapDriverState = function mapDriverState(f) {
    return function (v) {
      return f(v);
    };
  };

  var initDriverState = function initDriverState(component) {
    return function (input) {
      return function (handler) {
        return function (lchs) {
          return function __do() {
            var selfRef = Effect_Ref["new"]({})();
            var childrenIn = Effect_Ref["new"](Halogen_Data_Slot.empty)();
            var childrenOut = Effect_Ref["new"](Halogen_Data_Slot.empty)();
            var handlerRef = Effect_Ref["new"](handler)();
            var pendingQueries = Effect_Ref["new"](new Data_Maybe.Just(Data_List_Types.Nil.value))();
            var pendingOuts = Effect_Ref["new"](new Data_Maybe.Just(Data_List_Types.Nil.value))();
            var pendingHandlers = Effect_Ref["new"](Data_Maybe.Nothing.value)();
            var fresh = Effect_Ref["new"](1)();
            var subscriptions = Effect_Ref["new"](new Data_Maybe.Just(Data_Map_Internal.empty))();
            var forks = Effect_Ref["new"](Data_Map_Internal.empty)();
            var ds = {
              component: component,
              state: component.initialState(input),
              refs: Data_Map_Internal.empty,
              children: Halogen_Data_Slot.empty,
              childrenIn: childrenIn,
              childrenOut: childrenOut,
              selfRef: selfRef,
              handlerRef: handlerRef,
              pendingQueries: pendingQueries,
              pendingOuts: pendingOuts,
              pendingHandlers: pendingHandlers,
              rendering: Data_Maybe.Nothing.value,
              fresh: fresh,
              subscriptions: subscriptions,
              forks: forks,
              lifecycleHandlers: lchs
            };
            Effect_Ref.write(ds)(selfRef)();
            return mkDriverStateXRef(selfRef);
          };
        };
      };
    };
  };

  exports["mapDriverState"] = mapDriverState;
  exports["unDriverStateX"] = unDriverStateX;
  exports["renderStateX"] = renderStateX;
  exports["renderStateX_"] = renderStateX_;
  exports["unRenderStateX"] = unRenderStateX;
  exports["initDriverState"] = initDriverState;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Halogen.Query.ChildQuery"] = $PS["Halogen.Query.ChildQuery"] || {};
  var exports = $PS["Halogen.Query.ChildQuery"];
  var Unsafe_Coerce = $PS["Unsafe.Coerce"];
  var unChildQueryBox = Unsafe_Coerce.unsafeCoerce;
  exports["unChildQueryBox"] = unChildQueryBox;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Halogen.Query.HalogenM"] = $PS["Halogen.Query.HalogenM"] || {};
  var exports = $PS["Halogen.Query.HalogenM"];
  var Control_Applicative_Free = $PS["Control.Applicative.Free"];
  var Control_Monad_Free = $PS["Control.Monad.Free"];
  var Control_Monad_Reader_Class = $PS["Control.Monad.Reader.Class"];
  var Control_Monad_State_Class = $PS["Control.Monad.State.Class"];
  var Control_Monad_Trans_Class = $PS["Control.Monad.Trans.Class"];
  var Control_Parallel_Class = $PS["Control.Parallel.Class"];
  var Data_Newtype = $PS["Data.Newtype"];
  var Data_Ord = $PS["Data.Ord"];
  var Effect_Aff_Class = $PS["Effect.Aff.Class"];
  var Effect_Class = $PS["Effect.Class"];

  var SubscriptionId = function SubscriptionId(x) {
    return x;
  };

  var ForkId = function ForkId(x) {
    return x;
  };

  var State = function () {
    function State(value0) {
      this.value0 = value0;
    }

    ;

    State.create = function (value0) {
      return new State(value0);
    };

    return State;
  }();

  var Subscribe = function () {
    function Subscribe(value0, value1) {
      this.value0 = value0;
      this.value1 = value1;
    }

    ;

    Subscribe.create = function (value0) {
      return function (value1) {
        return new Subscribe(value0, value1);
      };
    };

    return Subscribe;
  }();

  var Unsubscribe = function () {
    function Unsubscribe(value0, value1) {
      this.value0 = value0;
      this.value1 = value1;
    }

    ;

    Unsubscribe.create = function (value0) {
      return function (value1) {
        return new Unsubscribe(value0, value1);
      };
    };

    return Unsubscribe;
  }();

  var Lift = function () {
    function Lift(value0) {
      this.value0 = value0;
    }

    ;

    Lift.create = function (value0) {
      return new Lift(value0);
    };

    return Lift;
  }();

  var ChildQuery = function () {
    function ChildQuery(value0) {
      this.value0 = value0;
    }

    ;

    ChildQuery.create = function (value0) {
      return new ChildQuery(value0);
    };

    return ChildQuery;
  }();

  var Raise = function () {
    function Raise(value0, value1) {
      this.value0 = value0;
      this.value1 = value1;
    }

    ;

    Raise.create = function (value0) {
      return function (value1) {
        return new Raise(value0, value1);
      };
    };

    return Raise;
  }();

  var Par = function () {
    function Par(value0) {
      this.value0 = value0;
    }

    ;

    Par.create = function (value0) {
      return new Par(value0);
    };

    return Par;
  }();

  var Fork = function () {
    function Fork(value0, value1) {
      this.value0 = value0;
      this.value1 = value1;
    }

    ;

    Fork.create = function (value0) {
      return function (value1) {
        return new Fork(value0, value1);
      };
    };

    return Fork;
  }();

  var Kill = function () {
    function Kill(value0, value1) {
      this.value0 = value0;
      this.value1 = value1;
    }

    ;

    Kill.create = function (value0) {
      return function (value1) {
        return new Kill(value0, value1);
      };
    };

    return Kill;
  }();

  var GetRef = function () {
    function GetRef(value0, value1) {
      this.value0 = value0;
      this.value1 = value1;
    }

    ;

    GetRef.create = function (value0) {
      return function (value1) {
        return new GetRef(value0, value1);
      };
    };

    return GetRef;
  }();

  var HalogenAp = function HalogenAp(x) {
    return x;
  };

  var HalogenM = function HalogenM(x) {
    return x;
  };

  var ordSubscriptionId = Data_Ord.ordInt;
  var ordForkId = Data_Ord.ordInt;
  var monadTransHalogenM = new Control_Monad_Trans_Class.MonadTrans(function (dictMonad) {
    return function ($135) {
      return HalogenM(Control_Monad_Free.liftF(Lift.create($135)));
    };
  });
  var monadHalogenM = Control_Monad_Free.freeMonad;
  var monadStateHalogenM = new Control_Monad_State_Class.MonadState(function () {
    return monadHalogenM;
  }, function ($136) {
    return HalogenM(Control_Monad_Free.liftF(State.create($136)));
  });

  var monadEffectHalogenM = function monadEffectHalogenM(dictMonadEffect) {
    return new Effect_Class.MonadEffect(function () {
      return monadHalogenM;
    }, function () {
      var $141 = Effect_Class.liftEffect(dictMonadEffect);
      return function ($142) {
        return HalogenM(Control_Monad_Free.liftF(Lift.create($141($142))));
      };
    }());
  };

  var monadAskHalogenM = function monadAskHalogenM(dictMonadAsk) {
    return new Control_Monad_Reader_Class.MonadAsk(function () {
      return monadHalogenM;
    }, HalogenM(Control_Monad_Free.liftF(new Lift(Control_Monad_Reader_Class.ask(dictMonadAsk)))));
  };

  var monadAffHalogenM = function monadAffHalogenM(dictMonadAff) {
    return new Effect_Aff_Class.MonadAff(function () {
      return monadEffectHalogenM(dictMonadAff.MonadEffect0());
    }, function () {
      var $143 = Effect_Aff_Class.liftAff(dictMonadAff);
      return function ($144) {
        return HalogenM(Control_Monad_Free.liftF(Lift.create($143($144))));
      };
    }());
  };

  var hoist = function hoist(dictFunctor) {
    return function (nat) {
      return function (v) {
        var go = function go(v1) {
          if (v1 instanceof State) {
            return new State(v1.value0);
          }

          ;

          if (v1 instanceof Subscribe) {
            return new Subscribe(v1.value0, v1.value1);
          }

          ;

          if (v1 instanceof Unsubscribe) {
            return new Unsubscribe(v1.value0, v1.value1);
          }

          ;

          if (v1 instanceof Lift) {
            return new Lift(nat(v1.value0));
          }

          ;

          if (v1 instanceof ChildQuery) {
            return new ChildQuery(v1.value0);
          }

          ;

          if (v1 instanceof Raise) {
            return new Raise(v1.value0, v1.value1);
          }

          ;

          if (v1 instanceof Par) {
            return new Par(Data_Newtype.over()()(HalogenAp)(Control_Applicative_Free.hoistFreeAp(hoist(dictFunctor)(nat)))(v1.value0));
          }

          ;

          if (v1 instanceof Fork) {
            return new Fork(hoist(dictFunctor)(nat)(v1.value0), v1.value1);
          }

          ;

          if (v1 instanceof Kill) {
            return new Kill(v1.value0, v1.value1);
          }

          ;

          if (v1 instanceof GetRef) {
            return new GetRef(v1.value0, v1.value1);
          }

          ;
          throw new Error("Failed pattern match at Halogen.Query.HalogenM (line 300, column 8 - line 310, column 29): " + [v1.constructor.name]);
        };

        return Control_Monad_Free.hoistFree(go)(v);
      };
    };
  };

  var functorHalogenM = Control_Monad_Free.freeFunctor;
  var bindHalogenM = Control_Monad_Free.freeBind;
  var applicativeHalogenM = Control_Monad_Free.freeApplicative;
  var applicativeHalogenAp = Control_Applicative_Free.applicativeFreeAp;
  var parallelHalogenM = new Control_Parallel_Class.Parallel(function () {
    return applicativeHalogenAp;
  }, function () {
    return monadHalogenM;
  }, function ($154) {
    return HalogenAp(Control_Applicative_Free.liftFreeAp($154));
  }, function ($155) {
    return HalogenM(Control_Monad_Free.liftF(Par.create($155)));
  });
  exports["State"] = State;
  exports["Subscribe"] = Subscribe;
  exports["Unsubscribe"] = Unsubscribe;
  exports["Lift"] = Lift;
  exports["ChildQuery"] = ChildQuery;
  exports["Raise"] = Raise;
  exports["Par"] = Par;
  exports["Fork"] = Fork;
  exports["Kill"] = Kill;
  exports["GetRef"] = GetRef;
  exports["SubscriptionId"] = SubscriptionId;
  exports["ForkId"] = ForkId;
  exports["hoist"] = hoist;
  exports["functorHalogenM"] = functorHalogenM;
  exports["applicativeHalogenM"] = applicativeHalogenM;
  exports["bindHalogenM"] = bindHalogenM;
  exports["monadHalogenM"] = monadHalogenM;
  exports["monadEffectHalogenM"] = monadEffectHalogenM;
  exports["monadAffHalogenM"] = monadAffHalogenM;
  exports["parallelHalogenM"] = parallelHalogenM;
  exports["monadTransHalogenM"] = monadTransHalogenM;
  exports["monadStateHalogenM"] = monadStateHalogenM;
  exports["monadAskHalogenM"] = monadAskHalogenM;
  exports["ordSubscriptionId"] = ordSubscriptionId;
  exports["ordForkId"] = ordForkId;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Halogen.Query.HalogenQ"] = $PS["Halogen.Query.HalogenQ"] || {};
  var exports = $PS["Halogen.Query.HalogenQ"];

  var Initialize = function () {
    function Initialize(value0) {
      this.value0 = value0;
    }

    ;

    Initialize.create = function (value0) {
      return new Initialize(value0);
    };

    return Initialize;
  }();

  var Finalize = function () {
    function Finalize(value0) {
      this.value0 = value0;
    }

    ;

    Finalize.create = function (value0) {
      return new Finalize(value0);
    };

    return Finalize;
  }();

  var Receive = function () {
    function Receive(value0, value1) {
      this.value0 = value0;
      this.value1 = value1;
    }

    ;

    Receive.create = function (value0) {
      return function (value1) {
        return new Receive(value0, value1);
      };
    };

    return Receive;
  }();

  var Action = function () {
    function Action(value0, value1) {
      this.value0 = value0;
      this.value1 = value1;
    }

    ;

    Action.create = function (value0) {
      return function (value1) {
        return new Action(value0, value1);
      };
    };

    return Action;
  }();

  var Query = function () {
    function Query(value0, value1) {
      this.value0 = value0;
      this.value1 = value1;
    }

    ;

    Query.create = function (value0) {
      return function (value1) {
        return new Query(value0, value1);
      };
    };

    return Query;
  }();

  exports["Initialize"] = Initialize;
  exports["Finalize"] = Finalize;
  exports["Receive"] = Receive;
  exports["Action"] = Action;
  exports["Query"] = Query;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Halogen.Query.Input"] = $PS["Halogen.Query.Input"] || {};
  var exports = $PS["Halogen.Query.Input"];
  var Data_Functor = $PS["Data.Functor"];

  var RefUpdate = function () {
    function RefUpdate(value0, value1) {
      this.value0 = value0;
      this.value1 = value1;
    }

    ;

    RefUpdate.create = function (value0) {
      return function (value1) {
        return new RefUpdate(value0, value1);
      };
    };

    return RefUpdate;
  }();

  var Action = function () {
    function Action(value0) {
      this.value0 = value0;
    }

    ;

    Action.create = function (value0) {
      return new Action(value0);
    };

    return Action;
  }();

  var functorInput = new Data_Functor.Functor(function (f) {
    return function (m) {
      if (m instanceof RefUpdate) {
        return new RefUpdate(m.value0, m.value1);
      }

      ;

      if (m instanceof Action) {
        return new Action(f(m.value0));
      }

      ;
      throw new Error("Failed pattern match at Halogen.Query.Input (line 19, column 1 - line 19, column 46): " + [m.constructor.name]);
    };
  });
  exports["RefUpdate"] = RefUpdate;
  exports["Action"] = Action;
  exports["functorInput"] = functorInput;
})(PS);

(function (exports) {
  "use strict";

  exports.reallyUnsafeRefEq = function (a) {
    return function (b) {
      return a === b;
    };
  };
})(PS["Unsafe.Reference"] = PS["Unsafe.Reference"] || {});

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Unsafe.Reference"] = $PS["Unsafe.Reference"] || {};
  var exports = $PS["Unsafe.Reference"];
  var $foreign = $PS["Unsafe.Reference"];
  var unsafeRefEq = $foreign.reallyUnsafeRefEq;
  exports["unsafeRefEq"] = unsafeRefEq;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Halogen.Subscription"] = $PS["Halogen.Subscription"] || {};
  var exports = $PS["Halogen.Subscription"];
  var Control_Bind = $PS["Control.Bind"];
  var Data_Array = $PS["Data.Array"];
  var Data_Foldable = $PS["Data.Foldable"];
  var Data_Functor = $PS["Data.Functor"];
  var Data_Semigroup = $PS["Data.Semigroup"];
  var Effect = $PS["Effect"];
  var Effect_Ref = $PS["Effect.Ref"];
  var Unsafe_Reference = $PS["Unsafe.Reference"];

  var unsubscribe = function unsubscribe(v) {
    return v;
  };

  var subscribe = function subscribe(v) {
    return function (k) {
      return v(function () {
        var $55 = Data_Functor["void"](Effect.functorEffect);
        return function ($56) {
          return $55(k($56));
        };
      }());
    };
  };

  var notify = function notify(v) {
    return function (a) {
      return v(a);
    };
  };

  var create = function __do() {
    var subscribers = Effect_Ref["new"]([])();
    return {
      emitter: function emitter(k) {
        return function __do() {
          Effect_Ref.modify_(function (v) {
            return Data_Semigroup.append(Data_Semigroup.semigroupArray)(v)([k]);
          })(subscribers)();
          return Effect_Ref.modify_(Data_Array.deleteBy(Unsafe_Reference.unsafeRefEq)(k))(subscribers);
        };
      },
      listener: function listener(a) {
        return Control_Bind.bind(Effect.bindEffect)(Effect_Ref.read(subscribers))(Data_Foldable.traverse_(Effect.applicativeEffect)(Data_Foldable.foldableArray)(function (k) {
          return k(a);
        }));
      }
    };
  };

  exports["create"] = create;
  exports["notify"] = notify;
  exports["subscribe"] = subscribe;
  exports["unsubscribe"] = unsubscribe;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Halogen.Aff.Driver.Eval"] = $PS["Halogen.Aff.Driver.Eval"] || {};
  var exports = $PS["Halogen.Aff.Driver.Eval"];
  var Control_Applicative = $PS["Control.Applicative"];
  var Control_Applicative_Free = $PS["Control.Applicative.Free"];
  var Control_Bind = $PS["Control.Bind"];
  var Control_Monad = $PS["Control.Monad"];
  var Control_Monad_Fork_Class = $PS["Control.Monad.Fork.Class"];
  var Control_Monad_Free = $PS["Control.Monad.Free"];
  var Control_Parallel = $PS["Control.Parallel"];
  var Control_Parallel_Class = $PS["Control.Parallel.Class"];
  var Data_Boolean = $PS["Data.Boolean"];
  var Data_Coyoneda = $PS["Data.Coyoneda"];
  var Data_Either = $PS["Data.Either"];
  var Data_Foldable = $PS["Data.Foldable"];
  var Data_Function = $PS["Data.Function"];
  var Data_Functor = $PS["Data.Functor"];
  var Data_List_Types = $PS["Data.List.Types"];
  var Data_Map_Internal = $PS["Data.Map.Internal"];
  var Data_Maybe = $PS["Data.Maybe"];
  var Data_Ord = $PS["Data.Ord"];
  var Data_Unit = $PS["Data.Unit"];
  var Effect = $PS["Effect"];
  var Effect_Aff = $PS["Effect.Aff"];
  var Effect_Class = $PS["Effect.Class"];
  var Effect_Exception = $PS["Effect.Exception"];
  var Effect_Ref = $PS["Effect.Ref"];
  var Halogen_Aff_Driver_State = $PS["Halogen.Aff.Driver.State"];
  var Halogen_Query_ChildQuery = $PS["Halogen.Query.ChildQuery"];
  var Halogen_Query_HalogenM = $PS["Halogen.Query.HalogenM"];
  var Halogen_Query_HalogenQ = $PS["Halogen.Query.HalogenQ"];
  var Halogen_Query_Input = $PS["Halogen.Query.Input"];
  var Halogen_Subscription = $PS["Halogen.Subscription"];
  var Unsafe_Reference = $PS["Unsafe.Reference"];

  var unsubscribe = function unsubscribe(sid) {
    return function (ref) {
      return function __do() {
        var v = Effect_Ref.read(ref)();
        var subs = Effect_Ref.read(v.subscriptions)();
        return Data_Foldable.traverse_(Effect.applicativeEffect)(Data_Foldable.foldableMaybe)(Halogen_Subscription.unsubscribe)(Control_Bind.bindFlipped(Data_Maybe.bindMaybe)(Data_Map_Internal.lookup(Halogen_Query_HalogenM.ordSubscriptionId)(sid))(subs))();
      };
    };
  };

  var queueOrRun = function queueOrRun(ref) {
    return function (au) {
      return Control_Bind.bind(Effect_Aff.bindAff)(Effect_Class.liftEffect(Effect_Aff.monadEffectAff)(Effect_Ref.read(ref)))(function (v) {
        if (v instanceof Data_Maybe.Nothing) {
          return au;
        }

        ;

        if (v instanceof Data_Maybe.Just) {
          return Effect_Class.liftEffect(Effect_Aff.monadEffectAff)(Effect_Ref.write(new Data_Maybe.Just(new Data_List_Types.Cons(au, v.value0)))(ref));
        }

        ;
        throw new Error("Failed pattern match at Halogen.Aff.Driver.Eval (line 182, column 33 - line 184, column 57): " + [v.constructor.name]);
      });
    };
  };

  var handleLifecycle = function handleLifecycle(lchs) {
    return function (f) {
      return Control_Bind.discard(Control_Bind.discardUnit)(Effect_Aff.bindAff)(Effect_Class.liftEffect(Effect_Aff.monadEffectAff)(Effect_Ref.write({
        initializers: Data_List_Types.Nil.value,
        finalizers: Data_List_Types.Nil.value
      })(lchs)))(function () {
        return Control_Bind.bind(Effect_Aff.bindAff)(Effect_Class.liftEffect(Effect_Aff.monadEffectAff)(f))(function (result) {
          return Control_Bind.bind(Effect_Aff.bindAff)(Effect_Class.liftEffect(Effect_Aff.monadEffectAff)(Effect_Ref.read(lchs)))(function (v) {
            return Control_Bind.discard(Control_Bind.discardUnit)(Effect_Aff.bindAff)(Data_Foldable.traverse_(Effect_Aff.applicativeAff)(Data_List_Types.foldableList)(Control_Monad_Fork_Class.fork(Control_Monad_Fork_Class.monadForkAff))(v.finalizers))(function () {
              return Control_Bind.discard(Control_Bind.discardUnit)(Effect_Aff.bindAff)(Control_Parallel.parSequence_(Effect_Aff.parallelAff)(Data_List_Types.foldableList)(v.initializers))(function () {
                return Control_Applicative.pure(Effect_Aff.applicativeAff)(result);
              });
            });
          });
        });
      });
    };
  };

  var handleAff = Effect_Aff.runAff_(Data_Either.either(Effect_Exception.throwException)(Data_Function["const"](Control_Applicative.pure(Effect.applicativeEffect)(Data_Unit.unit))));

  var fresh = function fresh(f) {
    return function (ref) {
      return Control_Bind.bind(Effect_Aff.bindAff)(Effect_Class.liftEffect(Effect_Aff.monadEffectAff)(Effect_Ref.read(ref)))(function (v) {
        return Effect_Class.liftEffect(Effect_Aff.monadEffectAff)(Effect_Ref["modify'"](function (i) {
          return {
            state: i + 1 | 0,
            value: f(i)
          };
        })(v.fresh));
      });
    };
  };

  var evalQ = function evalQ(render) {
    return function (ref) {
      return function (q) {
        return Control_Bind.bind(Effect_Aff.bindAff)(Effect_Class.liftEffect(Effect_Aff.monadEffectAff)(Effect_Ref.read(ref)))(function (v) {
          return evalM(render)(ref)(v["component"]["eval"](new Halogen_Query_HalogenQ.Query(Data_Functor.map(Data_Coyoneda.functorCoyoneda)(Data_Maybe.Just.create)(Data_Coyoneda.liftCoyoneda(q)), Data_Function["const"](Data_Maybe.Nothing.value))));
        });
      };
    };
  };

  var evalM = function evalM(render) {
    return function (initRef) {
      return function (v) {
        var evalChildQuery = function evalChildQuery(ref) {
          return function (cqb) {
            return Control_Bind.bind(Effect_Aff.bindAff)(Effect_Class.liftEffect(Effect_Aff.monadEffectAff)(Effect_Ref.read(ref)))(function (v1) {
              return Halogen_Query_ChildQuery.unChildQueryBox(function (v2) {
                var evalChild = function evalChild(v3) {
                  return Control_Parallel_Class.parallel(Effect_Aff.parallelAff)(Control_Bind.bind(Effect_Aff.bindAff)(Effect_Class.liftEffect(Effect_Aff.monadEffectAff)(Effect_Ref.read(v3)))(function (dsx) {
                    return Halogen_Aff_Driver_State.unDriverStateX(function (ds) {
                      return evalQ(render)(ds.selfRef)(v2.value1);
                    })(dsx);
                  }));
                };

                return Data_Functor.map(Effect_Aff.functorAff)(v2.value2)(Control_Parallel_Class.sequential(Effect_Aff.parallelAff)(v2.value0(Effect_Aff.applicativeParAff)(evalChild)(v1.children)));
              })(cqb);
            });
          };
        };

        var go = function go(ref) {
          return function (v1) {
            if (v1 instanceof Halogen_Query_HalogenM.State) {
              return Control_Bind.bind(Effect_Aff.bindAff)(Effect_Class.liftEffect(Effect_Aff.monadEffectAff)(Effect_Ref.read(ref)))(function (v2) {
                var v3 = v1.value0(v2.state);

                if (Unsafe_Reference.unsafeRefEq(v2.state)(v3.value1)) {
                  return Control_Applicative.pure(Effect_Aff.applicativeAff)(v3.value0);
                }

                ;

                if (Data_Boolean.otherwise) {
                  return Control_Bind.discard(Control_Bind.discardUnit)(Effect_Aff.bindAff)(Effect_Class.liftEffect(Effect_Aff.monadEffectAff)(Effect_Ref.write({
                    component: v2.component,
                    state: v3.value1,
                    refs: v2.refs,
                    children: v2.children,
                    childrenIn: v2.childrenIn,
                    childrenOut: v2.childrenOut,
                    selfRef: v2.selfRef,
                    handlerRef: v2.handlerRef,
                    pendingQueries: v2.pendingQueries,
                    pendingOuts: v2.pendingOuts,
                    pendingHandlers: v2.pendingHandlers,
                    rendering: v2.rendering,
                    fresh: v2.fresh,
                    subscriptions: v2.subscriptions,
                    forks: v2.forks,
                    lifecycleHandlers: v2.lifecycleHandlers
                  })(ref)))(function () {
                    return Control_Bind.discard(Control_Bind.discardUnit)(Effect_Aff.bindAff)(handleLifecycle(v2.lifecycleHandlers)(render(v2.lifecycleHandlers)(ref)))(function () {
                      return Control_Applicative.pure(Effect_Aff.applicativeAff)(v3.value0);
                    });
                  });
                }

                ;
                throw new Error("Failed pattern match at Halogen.Aff.Driver.Eval (line 86, column 7 - line 92, column 21): " + [v3.constructor.name]);
              });
            }

            ;

            if (v1 instanceof Halogen_Query_HalogenM.Subscribe) {
              return Control_Bind.bind(Effect_Aff.bindAff)(fresh(Halogen_Query_HalogenM.SubscriptionId)(ref))(function (sid) {
                return Control_Bind.bind(Effect_Aff.bindAff)(Effect_Class.liftEffect(Effect_Aff.monadEffectAff)(Halogen_Subscription.subscribe(v1.value0(sid))(function (act) {
                  return handleAff(evalF(render)(ref)(new Halogen_Query_Input.Action(act)));
                })))(function (finalize) {
                  return Control_Bind.bind(Effect_Aff.bindAff)(Effect_Class.liftEffect(Effect_Aff.monadEffectAff)(Effect_Ref.read(ref)))(function (v2) {
                    return Control_Bind.discard(Control_Bind.discardUnit)(Effect_Aff.bindAff)(Effect_Class.liftEffect(Effect_Aff.monadEffectAff)(Effect_Ref.modify_(Data_Functor.map(Data_Maybe.functorMaybe)(Data_Map_Internal.insert(Halogen_Query_HalogenM.ordSubscriptionId)(sid)(finalize)))(v2.subscriptions)))(function () {
                      return Control_Applicative.pure(Effect_Aff.applicativeAff)(v1.value1(sid));
                    });
                  });
                });
              });
            }

            ;

            if (v1 instanceof Halogen_Query_HalogenM.Unsubscribe) {
              return Control_Bind.discard(Control_Bind.discardUnit)(Effect_Aff.bindAff)(Effect_Class.liftEffect(Effect_Aff.monadEffectAff)(unsubscribe(v1.value0)(ref)))(function () {
                return Control_Applicative.pure(Effect_Aff.applicativeAff)(v1.value1);
              });
            }

            ;

            if (v1 instanceof Halogen_Query_HalogenM.Lift) {
              return v1.value0;
            }

            ;

            if (v1 instanceof Halogen_Query_HalogenM.ChildQuery) {
              return evalChildQuery(ref)(v1.value0);
            }

            ;

            if (v1 instanceof Halogen_Query_HalogenM.Raise) {
              return Control_Bind.bind(Effect_Aff.bindAff)(Effect_Class.liftEffect(Effect_Aff.monadEffectAff)(Effect_Ref.read(ref)))(function (v2) {
                return Control_Bind.bind(Effect_Aff.bindAff)(Effect_Class.liftEffect(Effect_Aff.monadEffectAff)(Effect_Ref.read(v2.handlerRef)))(function (handler) {
                  return Control_Bind.discard(Control_Bind.discardUnit)(Effect_Aff.bindAff)(queueOrRun(v2.pendingOuts)(handler(v1.value0)))(function () {
                    return Control_Applicative.pure(Effect_Aff.applicativeAff)(v1.value1);
                  });
                });
              });
            }

            ;

            if (v1 instanceof Halogen_Query_HalogenM.Par) {
              return Control_Parallel_Class.sequential(Effect_Aff.parallelAff)(Control_Applicative_Free.retractFreeAp(Effect_Aff.applicativeParAff)(Control_Applicative_Free.hoistFreeAp(function () {
                var $79 = Control_Parallel_Class.parallel(Effect_Aff.parallelAff);
                var $80 = evalM(render)(ref);
                return function ($81) {
                  return $79($80($81));
                };
              }())(v1.value0)));
            }

            ;

            if (v1 instanceof Halogen_Query_HalogenM.Fork) {
              return Control_Bind.bind(Effect_Aff.bindAff)(fresh(Halogen_Query_HalogenM.ForkId)(ref))(function (fid) {
                return Control_Bind.bind(Effect_Aff.bindAff)(Effect_Class.liftEffect(Effect_Aff.monadEffectAff)(Effect_Ref.read(ref)))(function (v2) {
                  return Control_Bind.bind(Effect_Aff.bindAff)(Effect_Class.liftEffect(Effect_Aff.monadEffectAff)(Effect_Ref["new"](false)))(function (doneRef) {
                    return Control_Bind.bind(Effect_Aff.bindAff)(Control_Monad_Fork_Class.fork(Control_Monad_Fork_Class.monadForkAff)(Effect_Aff["finally"](Effect_Class.liftEffect(Effect_Aff.monadEffectAff)(function __do() {
                      Effect_Ref.modify_(Data_Map_Internal["delete"](Halogen_Query_HalogenM.ordForkId)(fid))(v2.forks)();
                      return Effect_Ref.write(true)(doneRef)();
                    }))(evalM(render)(ref)(v1.value0))))(function (fiber) {
                      return Control_Bind.discard(Control_Bind.discardUnit)(Effect_Aff.bindAff)(Effect_Class.liftEffect(Effect_Aff.monadEffectAff)(Control_Monad.unlessM(Effect.monadEffect)(Effect_Ref.read(doneRef))(Effect_Ref.modify_(Data_Map_Internal.insert(Halogen_Query_HalogenM.ordForkId)(fid)(fiber))(v2.forks))))(function () {
                        return Control_Applicative.pure(Effect_Aff.applicativeAff)(v1.value1(fid));
                      });
                    });
                  });
                });
              });
            }

            ;

            if (v1 instanceof Halogen_Query_HalogenM.Kill) {
              return Control_Bind.bind(Effect_Aff.bindAff)(Effect_Class.liftEffect(Effect_Aff.monadEffectAff)(Effect_Ref.read(ref)))(function (v2) {
                return Control_Bind.bind(Effect_Aff.bindAff)(Effect_Class.liftEffect(Effect_Aff.monadEffectAff)(Effect_Ref.read(v2.forks)))(function (forkMap) {
                  return Control_Bind.discard(Control_Bind.discardUnit)(Effect_Aff.bindAff)(Data_Foldable.traverse_(Effect_Aff.applicativeAff)(Data_Foldable.foldableMaybe)(Effect_Aff.killFiber(Effect_Exception.error("Cancelled")))(Data_Map_Internal.lookup(Halogen_Query_HalogenM.ordForkId)(v1.value0)(forkMap)))(function () {
                    return Control_Applicative.pure(Effect_Aff.applicativeAff)(v1.value1);
                  });
                });
              });
            }

            ;

            if (v1 instanceof Halogen_Query_HalogenM.GetRef) {
              return Control_Bind.bind(Effect_Aff.bindAff)(Effect_Class.liftEffect(Effect_Aff.monadEffectAff)(Effect_Ref.read(ref)))(function (v2) {
                return Control_Applicative.pure(Effect_Aff.applicativeAff)(v1.value1(Data_Map_Internal.lookup(Data_Ord.ordString)(v1.value0)(v2.refs)));
              });
            }

            ;
            throw new Error("Failed pattern match at Halogen.Aff.Driver.Eval (line 83, column 12 - line 133, column 33): " + [v1.constructor.name]);
          };
        };

        return Control_Monad_Free.foldFree(Effect_Aff.monadRecAff)(go(initRef))(v);
      };
    };
  };

  var evalF = function evalF(render) {
    return function (ref) {
      return function (v) {
        if (v instanceof Halogen_Query_Input.RefUpdate) {
          return Effect_Class.liftEffect(Effect_Aff.monadEffectAff)(Data_Function.flip(Effect_Ref.modify_)(ref)(Halogen_Aff_Driver_State.mapDriverState(function (st) {
            return {
              component: st.component,
              state: st.state,
              refs: Data_Map_Internal.alter(Data_Ord.ordString)(Data_Function["const"](v.value1))(v.value0)(st.refs),
              children: st.children,
              childrenIn: st.childrenIn,
              childrenOut: st.childrenOut,
              selfRef: st.selfRef,
              handlerRef: st.handlerRef,
              pendingQueries: st.pendingQueries,
              pendingOuts: st.pendingOuts,
              pendingHandlers: st.pendingHandlers,
              rendering: st.rendering,
              fresh: st.fresh,
              subscriptions: st.subscriptions,
              forks: st.forks,
              lifecycleHandlers: st.lifecycleHandlers
            };
          })));
        }

        ;

        if (v instanceof Halogen_Query_Input.Action) {
          return Control_Bind.bind(Effect_Aff.bindAff)(Effect_Class.liftEffect(Effect_Aff.monadEffectAff)(Effect_Ref.read(ref)))(function (v1) {
            return evalM(render)(ref)(v1["component"]["eval"](new Halogen_Query_HalogenQ.Action(v.value0, Data_Unit.unit)));
          });
        }

        ;
        throw new Error("Failed pattern match at Halogen.Aff.Driver.Eval (line 52, column 20 - line 58, column 62): " + [v.constructor.name]);
      };
    };
  };

  exports["evalF"] = evalF;
  exports["evalQ"] = evalQ;
  exports["evalM"] = evalM;
  exports["handleLifecycle"] = handleLifecycle;
  exports["queueOrRun"] = queueOrRun;
  exports["handleAff"] = handleAff;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Halogen.VDom.Machine"] = $PS["Halogen.VDom.Machine"] || {};
  var exports = $PS["Halogen.VDom.Machine"];
  var Unsafe_Coerce = $PS["Unsafe.Coerce"];

  var Step = function () {
    function Step(value0, value1, value2, value3) {
      this.value0 = value0;
      this.value1 = value1;
      this.value2 = value2;
      this.value3 = value3;
    }

    ;

    Step.create = function (value0) {
      return function (value1) {
        return function (value2) {
          return function (value3) {
            return new Step(value0, value1, value2, value3);
          };
        };
      };
    };

    return Step;
  }();

  var unStep = Unsafe_Coerce.unsafeCoerce;

  var step = function step(v, a) {
    return v.value2(v.value1, a);
  };

  var mkStep = Unsafe_Coerce.unsafeCoerce;

  var halt = function halt(v) {
    return v.value3(v.value1);
  };

  var extract = unStep(function (v) {
    return v.value0;
  });
  exports["Step"] = Step;
  exports["mkStep"] = mkStep;
  exports["unStep"] = unStep;
  exports["extract"] = extract;
  exports["step"] = step;
  exports["halt"] = halt;
})(PS);

(function (exports) {
  "use strict";

  exports.unsafeGetAny = function (key, obj) {
    return obj[key];
  };

  exports.unsafeHasAny = function (key, obj) {
    return obj.hasOwnProperty(key);
  };

  exports.unsafeSetAny = function (key, val, obj) {
    obj[key] = val;
  };

  exports.forE = function (a, f) {
    var b = [];

    for (var i = 0; i < a.length; i++) {
      b.push(f(i, a[i]));
    }

    return b;
  };

  exports.forEachE = function (a, f) {
    for (var i = 0; i < a.length; i++) {
      f(a[i]);
    }
  };

  exports.forInE = function (o, f) {
    var ks = Object.keys(o);

    for (var i = 0; i < ks.length; i++) {
      var k = ks[i];
      f(k, o[k]);
    }
  };

  exports.diffWithIxE = function (a1, a2, f1, f2, f3) {
    var a3 = [];
    var l1 = a1.length;
    var l2 = a2.length;
    var i = 0;

    while (1) {
      if (i < l1) {
        if (i < l2) {
          a3.push(f1(i, a1[i], a2[i]));
        } else {
          f2(i, a1[i]);
        }
      } else if (i < l2) {
        a3.push(f3(i, a2[i]));
      } else {
        break;
      }

      i++;
    }

    return a3;
  };

  exports.strMapWithIxE = function (as, fk, f) {
    var o = {};

    for (var i = 0; i < as.length; i++) {
      var a = as[i];
      var k = fk(a);
      o[k] = f(k, i, a);
    }

    return o;
  };

  exports.diffWithKeyAndIxE = function (o1, as, fk, f1, f2, f3) {
    var o2 = {};

    for (var i = 0; i < as.length; i++) {
      var a = as[i];
      var k = fk(a);

      if (o1.hasOwnProperty(k)) {
        o2[k] = f1(k, i, o1[k], a);
      } else {
        o2[k] = f3(k, i, a);
      }
    }

    for (var k in o1) {
      if (k in o2) {
        continue;
      }

      f2(k, o1[k]);
    }

    return o2;
  };

  exports.refEq = function (a, b) {
    return a === b;
  };

  exports.createTextNode = function (s, doc) {
    return doc.createTextNode(s);
  };

  exports.setTextContent = function (s, n) {
    n.textContent = s;
  };

  exports.createElement = function (ns, name, doc) {
    if (ns != null) {
      return doc.createElementNS(ns, name);
    } else {
      return doc.createElement(name);
    }
  };

  exports.insertChildIx = function (i, a, b) {
    var n = b.childNodes.item(i) || null;

    if (n !== a) {
      b.insertBefore(a, n);
    }
  };

  exports.removeChild = function (a, b) {
    if (b && a.parentNode === b) {
      b.removeChild(a);
    }
  };

  exports.parentNode = function (a) {
    return a.parentNode;
  };

  exports.setAttribute = function (ns, attr, val, el) {
    if (ns != null) {
      el.setAttributeNS(ns, attr, val);
    } else {
      el.setAttribute(attr, val);
    }
  };

  exports.removeAttribute = function (ns, attr, el) {
    if (ns != null) {
      el.removeAttributeNS(ns, attr);
    } else {
      el.removeAttribute(attr);
    }
  };

  exports.hasAttribute = function (ns, attr, el) {
    if (ns != null) {
      return el.hasAttributeNS(ns, attr);
    } else {
      return el.hasAttribute(attr);
    }
  };

  exports.addEventListener = function (ev, listener, el) {
    el.addEventListener(ev, listener, false);
  };

  exports.removeEventListener = function (ev, listener, el) {
    el.removeEventListener(ev, listener, false);
  };

  exports.jsUndefined = void 0;
})(PS["Halogen.VDom.Util"] = PS["Halogen.VDom.Util"] || {});

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Halogen.VDom.Util"] = $PS["Halogen.VDom.Util"] || {};
  var exports = $PS["Halogen.VDom.Util"];
  var $foreign = $PS["Halogen.VDom.Util"];
  var Foreign_Object_ST = $PS["Foreign.Object.ST"];
  var Unsafe_Coerce = $PS["Unsafe.Coerce"];
  var unsafeLookup = $foreign.unsafeGetAny;
  var unsafeFreeze = Unsafe_Coerce.unsafeCoerce;
  var pokeMutMap = $foreign.unsafeSetAny;
  var newMutMap = Foreign_Object_ST["new"];
  exports["newMutMap"] = newMutMap;
  exports["pokeMutMap"] = pokeMutMap;
  exports["unsafeFreeze"] = unsafeFreeze;
  exports["unsafeLookup"] = unsafeLookup;
  exports["unsafeGetAny"] = $foreign.unsafeGetAny;
  exports["unsafeHasAny"] = $foreign.unsafeHasAny;
  exports["unsafeSetAny"] = $foreign.unsafeSetAny;
  exports["forE"] = $foreign.forE;
  exports["forEachE"] = $foreign.forEachE;
  exports["forInE"] = $foreign.forInE;
  exports["diffWithIxE"] = $foreign.diffWithIxE;
  exports["diffWithKeyAndIxE"] = $foreign.diffWithKeyAndIxE;
  exports["strMapWithIxE"] = $foreign.strMapWithIxE;
  exports["refEq"] = $foreign.refEq;
  exports["createTextNode"] = $foreign.createTextNode;
  exports["setTextContent"] = $foreign.setTextContent;
  exports["createElement"] = $foreign.createElement;
  exports["insertChildIx"] = $foreign.insertChildIx;
  exports["removeChild"] = $foreign.removeChild;
  exports["parentNode"] = $foreign.parentNode;
  exports["setAttribute"] = $foreign.setAttribute;
  exports["removeAttribute"] = $foreign.removeAttribute;
  exports["hasAttribute"] = $foreign.hasAttribute;
  exports["addEventListener"] = $foreign.addEventListener;
  exports["removeEventListener"] = $foreign.removeEventListener;
  exports["jsUndefined"] = $foreign.jsUndefined;
})(PS);

(function (exports) {
  "use strict";

  exports.eventListener = function (fn) {
    return function () {
      return function (event) {
        return fn(event)();
      };
    };
  };

  exports.addEventListener = function (type) {
    return function (listener) {
      return function (useCapture) {
        return function (target) {
          return function () {
            return target.addEventListener(type, listener, useCapture);
          };
        };
      };
    };
  };

  exports.removeEventListener = function (type) {
    return function (listener) {
      return function (useCapture) {
        return function (target) {
          return function () {
            return target.removeEventListener(type, listener, useCapture);
          };
        };
      };
    };
  };
})(PS["Web.Event.EventTarget"] = PS["Web.Event.EventTarget"] || {});

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Web.Event.EventTarget"] = $PS["Web.Event.EventTarget"] || {};
  var exports = $PS["Web.Event.EventTarget"];
  var $foreign = $PS["Web.Event.EventTarget"];
  exports["eventListener"] = $foreign.eventListener;
  exports["addEventListener"] = $foreign.addEventListener;
  exports["removeEventListener"] = $foreign.removeEventListener;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Halogen.VDom.DOM.Prop"] = $PS["Halogen.VDom.DOM.Prop"] || {};
  var exports = $PS["Halogen.VDom.DOM.Prop"];
  var Data_Functor = $PS["Data.Functor"];
  var Data_Maybe = $PS["Data.Maybe"];
  var Data_Nullable = $PS["Data.Nullable"];
  var Data_Tuple = $PS["Data.Tuple"];
  var Data_Unit = $PS["Data.Unit"];
  var Effect_Ref = $PS["Effect.Ref"];
  var Foreign = $PS["Foreign"];
  var Foreign_Object = $PS["Foreign.Object"];
  var Halogen_VDom_Machine = $PS["Halogen.VDom.Machine"];
  var Halogen_VDom_Util = $PS["Halogen.VDom.Util"];
  var Unsafe_Coerce = $PS["Unsafe.Coerce"];
  var Web_Event_EventTarget = $PS["Web.Event.EventTarget"];

  var Created = function () {
    function Created(value0) {
      this.value0 = value0;
    }

    ;

    Created.create = function (value0) {
      return new Created(value0);
    };

    return Created;
  }();

  var Removed = function () {
    function Removed(value0) {
      this.value0 = value0;
    }

    ;

    Removed.create = function (value0) {
      return new Removed(value0);
    };

    return Removed;
  }();

  var Attribute = function () {
    function Attribute(value0, value1, value2) {
      this.value0 = value0;
      this.value1 = value1;
      this.value2 = value2;
    }

    ;

    Attribute.create = function (value0) {
      return function (value1) {
        return function (value2) {
          return new Attribute(value0, value1, value2);
        };
      };
    };

    return Attribute;
  }();

  var Property = function () {
    function Property(value0, value1) {
      this.value0 = value0;
      this.value1 = value1;
    }

    ;

    Property.create = function (value0) {
      return function (value1) {
        return new Property(value0, value1);
      };
    };

    return Property;
  }();

  var Handler = function () {
    function Handler(value0, value1) {
      this.value0 = value0;
      this.value1 = value1;
    }

    ;

    Handler.create = function (value0) {
      return function (value1) {
        return new Handler(value0, value1);
      };
    };

    return Handler;
  }();

  var Ref = function () {
    function Ref(value0) {
      this.value0 = value0;
    }

    ;

    Ref.create = function (value0) {
      return new Ref(value0);
    };

    return Ref;
  }();

  var unsafeGetProperty = Halogen_VDom_Util.unsafeGetAny;
  var setProperty = Halogen_VDom_Util.unsafeSetAny;

  var removeProperty = function removeProperty(key, el) {
    var v = Halogen_VDom_Util.hasAttribute(Data_Nullable["null"], key, el);

    if (v) {
      return Halogen_VDom_Util.removeAttribute(Data_Nullable["null"], key, el);
    }

    ;
    var v1 = Foreign.typeOf(Halogen_VDom_Util.unsafeGetAny(key, el));

    if (v1 === "string") {
      return Halogen_VDom_Util.unsafeSetAny(key, "", el);
    }

    ;

    if (key === "rowSpan") {
      return Halogen_VDom_Util.unsafeSetAny(key, 1, el);
    }

    ;

    if (key === "colSpan") {
      return Halogen_VDom_Util.unsafeSetAny(key, 1, el);
    }

    ;
    return Halogen_VDom_Util.unsafeSetAny(key, Halogen_VDom_Util.jsUndefined, el);
  };

  var propToStrKey = function propToStrKey(v) {
    if (v instanceof Attribute && v.value0 instanceof Data_Maybe.Just) {
      return "attr/" + (v.value0.value0 + (":" + v.value1));
    }

    ;

    if (v instanceof Attribute) {
      return "attr/:" + v.value1;
    }

    ;

    if (v instanceof Property) {
      return "prop/" + v.value0;
    }

    ;

    if (v instanceof Handler) {
      return "handler/" + v.value0;
    }

    ;

    if (v instanceof Ref) {
      return "ref";
    }

    ;
    throw new Error("Failed pattern match at Halogen.VDom.DOM.Prop (line 182, column 16 - line 187, column 16): " + [v.constructor.name]);
  };

  var propFromString = Unsafe_Coerce.unsafeCoerce;
  var functorProp = new Data_Functor.Functor(function (f) {
    return function (v) {
      if (v instanceof Handler) {
        return new Handler(v.value0, Data_Functor.map(Data_Functor.functorFn)(Data_Functor.map(Data_Maybe.functorMaybe)(f))(v.value1));
      }

      ;

      if (v instanceof Ref) {
        return new Ref(Data_Functor.map(Data_Functor.functorFn)(Data_Functor.map(Data_Maybe.functorMaybe)(f))(v.value0));
      }

      ;
      return v;
    };
  });

  var buildProp = function buildProp(emit) {
    return function (el) {
      var removeProp = function removeProp(prevEvents) {
        return function (v, v1) {
          if (v1 instanceof Attribute) {
            return Halogen_VDom_Util.removeAttribute(Data_Nullable.toNullable(v1.value0), v1.value1, el);
          }

          ;

          if (v1 instanceof Property) {
            return removeProperty(v1.value0, el);
          }

          ;

          if (v1 instanceof Handler) {
            var handler = Halogen_VDom_Util.unsafeLookup(v1.value0, prevEvents);
            return Halogen_VDom_Util.removeEventListener(v1.value0, Data_Tuple.fst(handler), el);
          }

          ;

          if (v1 instanceof Ref) {
            return Data_Unit.unit;
          }

          ;
          throw new Error("Failed pattern match at Halogen.VDom.DOM.Prop (line 169, column 5 - line 179, column 18): " + [v1.constructor.name]);
        };
      };

      var mbEmit = function mbEmit(v) {
        if (v instanceof Data_Maybe.Just) {
          return emit(v.value0)();
        }

        ;
        return Data_Unit.unit;
      };

      var haltProp = function haltProp(state) {
        var v = Foreign_Object.lookup("ref")(state.props);

        if (v instanceof Data_Maybe.Just && v.value0 instanceof Ref) {
          return mbEmit(v.value0.value0(new Removed(el)));
        }

        ;
        return Data_Unit.unit;
      };

      var diffProp = function diffProp(prevEvents, events) {
        return function (v, v1, v11, v2) {
          if (v11 instanceof Attribute && v2 instanceof Attribute) {
            var $56 = v11.value2 === v2.value2;

            if ($56) {
              return v2;
            }

            ;
            Halogen_VDom_Util.setAttribute(Data_Nullable.toNullable(v2.value0), v2.value1, v2.value2, el);
            return v2;
          }

          ;

          if (v11 instanceof Property && v2 instanceof Property) {
            var v4 = Halogen_VDom_Util.refEq(v11.value1, v2.value1);

            if (v4) {
              return v2;
            }

            ;

            if (v2.value0 === "value") {
              var elVal = unsafeGetProperty("value", el);
              var $65 = Halogen_VDom_Util.refEq(elVal, v2.value1);

              if ($65) {
                return v2;
              }

              ;
              setProperty(v2.value0, v2.value1, el);
              return v2;
            }

            ;
            setProperty(v2.value0, v2.value1, el);
            return v2;
          }

          ;

          if (v11 instanceof Handler && v2 instanceof Handler) {
            var handler = Halogen_VDom_Util.unsafeLookup(v2.value0, prevEvents);
            Effect_Ref.write(v2.value1)(Data_Tuple.snd(handler))();
            Halogen_VDom_Util.pokeMutMap(v2.value0, handler, events);
            return v2;
          }

          ;
          return v2;
        };
      };

      var applyProp = function applyProp(events) {
        return function (v, v1, v2) {
          if (v2 instanceof Attribute) {
            Halogen_VDom_Util.setAttribute(Data_Nullable.toNullable(v2.value0), v2.value1, v2.value2, el);
            return v2;
          }

          ;

          if (v2 instanceof Property) {
            setProperty(v2.value0, v2.value1, el);
            return v2;
          }

          ;

          if (v2 instanceof Handler) {
            var v3 = Halogen_VDom_Util.unsafeGetAny(v2.value0, events);

            if (Halogen_VDom_Util.unsafeHasAny(v2.value0, events)) {
              Effect_Ref.write(v2.value1)(Data_Tuple.snd(v3))();
              return v2;
            }

            ;
            var ref = Effect_Ref["new"](v2.value1)();
            var listener = Web_Event_EventTarget.eventListener(function (ev) {
              return function __do() {
                var f$prime = Effect_Ref.read(ref)();
                return mbEmit(f$prime(ev));
              };
            })();
            Halogen_VDom_Util.pokeMutMap(v2.value0, new Data_Tuple.Tuple(listener, ref), events);
            Halogen_VDom_Util.addEventListener(v2.value0, listener, el);
            return v2;
          }

          ;

          if (v2 instanceof Ref) {
            mbEmit(v2.value0(new Created(el)));
            return v2;
          }

          ;
          throw new Error("Failed pattern match at Halogen.VDom.DOM.Prop (line 113, column 5 - line 135, column 15): " + [v2.constructor.name]);
        };
      };

      var patchProp = function patchProp(state, ps2) {
        var events = Halogen_VDom_Util.newMutMap();
        var onThis = removeProp(state.events);
        var onThese = diffProp(state.events, events);
        var onThat = applyProp(events);
        var props = Halogen_VDom_Util.diffWithKeyAndIxE(state.props, ps2, propToStrKey, onThese, onThis, onThat);
        var nextState = {
          events: Halogen_VDom_Util.unsafeFreeze(events),
          props: props
        };
        return Halogen_VDom_Machine.mkStep(new Halogen_VDom_Machine.Step(Data_Unit.unit, nextState, patchProp, haltProp));
      };

      var renderProp = function renderProp(ps1) {
        var events = Halogen_VDom_Util.newMutMap();
        var ps1$prime = Halogen_VDom_Util.strMapWithIxE(ps1, propToStrKey, applyProp(events));
        var state = {
          events: Halogen_VDom_Util.unsafeFreeze(events),
          props: ps1$prime
        };
        return Halogen_VDom_Machine.mkStep(new Halogen_VDom_Machine.Step(Data_Unit.unit, state, patchProp, haltProp));
      };

      return renderProp;
    };
  };

  exports["Attribute"] = Attribute;
  exports["Property"] = Property;
  exports["Handler"] = Handler;
  exports["propFromString"] = propFromString;
  exports["buildProp"] = buildProp;
  exports["functorProp"] = functorProp;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Halogen.VDom.Types"] = $PS["Halogen.VDom.Types"] || {};
  var exports = $PS["Halogen.VDom.Types"];
  var Data_Bifunctor = $PS["Data.Bifunctor"];
  var Data_Functor = $PS["Data.Functor"];
  var Data_Tuple = $PS["Data.Tuple"];
  var Unsafe_Coerce = $PS["Unsafe.Coerce"];

  var Text = function () {
    function Text(value0) {
      this.value0 = value0;
    }

    ;

    Text.create = function (value0) {
      return new Text(value0);
    };

    return Text;
  }();

  var Elem = function () {
    function Elem(value0, value1, value2, value3) {
      this.value0 = value0;
      this.value1 = value1;
      this.value2 = value2;
      this.value3 = value3;
    }

    ;

    Elem.create = function (value0) {
      return function (value1) {
        return function (value2) {
          return function (value3) {
            return new Elem(value0, value1, value2, value3);
          };
        };
      };
    };

    return Elem;
  }();

  var Keyed = function () {
    function Keyed(value0, value1, value2, value3) {
      this.value0 = value0;
      this.value1 = value1;
      this.value2 = value2;
      this.value3 = value3;
    }

    ;

    Keyed.create = function (value0) {
      return function (value1) {
        return function (value2) {
          return function (value3) {
            return new Keyed(value0, value1, value2, value3);
          };
        };
      };
    };

    return Keyed;
  }();

  var Widget = function () {
    function Widget(value0) {
      this.value0 = value0;
    }

    ;

    Widget.create = function (value0) {
      return new Widget(value0);
    };

    return Widget;
  }();

  var Grafted = function () {
    function Grafted(value0) {
      this.value0 = value0;
    }

    ;

    Grafted.create = function (value0) {
      return new Grafted(value0);
    };

    return Grafted;
  }();

  var Graft = function () {
    function Graft(value0, value1, value2) {
      this.value0 = value0;
      this.value1 = value1;
      this.value2 = value2;
    }

    ;

    Graft.create = function (value0) {
      return function (value1) {
        return function (value2) {
          return new Graft(value0, value1, value2);
        };
      };
    };

    return Graft;
  }();

  var unGraft = function unGraft(f) {
    return function ($52) {
      return f($52);
    };
  };

  var graft = Unsafe_Coerce.unsafeCoerce;
  var bifunctorGraft = new Data_Bifunctor.Bifunctor(function (f) {
    return function (g) {
      return unGraft(function (v) {
        return graft(new Graft(function ($54) {
          return f(v.value0($54));
        }, function ($55) {
          return g(v.value1($55));
        }, v.value2));
      });
    };
  });
  var bifunctorVDom = new Data_Bifunctor.Bifunctor(function (f) {
    return function (g) {
      return function (v) {
        if (v instanceof Text) {
          return new Text(v.value0);
        }

        ;

        if (v instanceof Grafted) {
          return new Grafted(Data_Bifunctor.bimap(bifunctorGraft)(f)(g)(v.value0));
        }

        ;
        return new Grafted(graft(new Graft(f, g, v)));
      };
    };
  });
  var runGraft = unGraft(function (v) {
    var go = function go(v2) {
      if (v2 instanceof Text) {
        return new Text(v2.value0);
      }

      ;

      if (v2 instanceof Elem) {
        return new Elem(v2.value0, v2.value1, v.value0(v2.value2), Data_Functor.map(Data_Functor.functorArray)(go)(v2.value3));
      }

      ;

      if (v2 instanceof Keyed) {
        return new Keyed(v2.value0, v2.value1, v.value0(v2.value2), Data_Functor.map(Data_Functor.functorArray)(Data_Functor.map(Data_Tuple.functorTuple)(go))(v2.value3));
      }

      ;

      if (v2 instanceof Widget) {
        return new Widget(v.value1(v2.value0));
      }

      ;

      if (v2 instanceof Grafted) {
        return new Grafted(Data_Bifunctor.bimap(bifunctorGraft)(v.value0)(v.value1)(v2.value0));
      }

      ;
      throw new Error("Failed pattern match at Halogen.VDom.Types (line 86, column 7 - line 86, column 27): " + [v2.constructor.name]);
    };

    return go(v.value2);
  });
  exports["Text"] = Text;
  exports["Elem"] = Elem;
  exports["Keyed"] = Keyed;
  exports["Widget"] = Widget;
  exports["Grafted"] = Grafted;
  exports["runGraft"] = runGraft;
  exports["bifunctorVDom"] = bifunctorVDom;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Halogen.HTML.Core"] = $PS["Halogen.HTML.Core"] || {};
  var exports = $PS["Halogen.HTML.Core"];
  var Data_Bifunctor = $PS["Data.Bifunctor"];
  var Data_Functor = $PS["Data.Functor"];
  var Halogen_Query_Input = $PS["Halogen.Query.Input"];
  var Halogen_VDom_DOM_Prop = $PS["Halogen.VDom.DOM.Prop"];
  var Halogen_VDom_Types = $PS["Halogen.VDom.Types"];

  var IsProp = function IsProp(toPropValue) {
    this.toPropValue = toPropValue;
  };

  var HTML = function HTML(x) {
    return x;
  };

  var toPropValue = function toPropValue(dict) {
    return dict.toPropValue;
  };

  var text = function text($19) {
    return HTML(Halogen_VDom_Types.Text.create($19));
  };

  var prop = function prop(dictIsProp) {
    return function (v) {
      var $21 = Halogen_VDom_DOM_Prop.Property.create(v);
      var $22 = toPropValue(dictIsProp);
      return function ($23) {
        return $21($22($23));
      };
    };
  };

  var isPropString = new IsProp(Halogen_VDom_DOM_Prop.propFromString);
  var handler = Halogen_VDom_DOM_Prop.Handler.create;

  var element = function element(ns) {
    return function (name) {
      return function (props) {
        return function (children) {
          return new Halogen_VDom_Types.Elem(ns, name, props, children);
        };
      };
    };
  };

  var bifunctorHTML = new Data_Bifunctor.Bifunctor(function (f) {
    return function (g) {
      return function (v) {
        return Data_Bifunctor.bimap(Halogen_VDom_Types.bifunctorVDom)(Data_Functor.map(Data_Functor.functorArray)(Data_Functor.map(Halogen_VDom_DOM_Prop.functorProp)(Data_Functor.map(Halogen_Query_Input.functorInput)(g))))(f)(v);
      };
    };
  });

  var attr = function attr(ns) {
    return function (v) {
      return Halogen_VDom_DOM_Prop.Attribute.create(ns)(v);
    };
  };

  exports["text"] = text;
  exports["element"] = element;
  exports["prop"] = prop;
  exports["attr"] = attr;
  exports["handler"] = handler;
  exports["bifunctorHTML"] = bifunctorHTML;
  exports["isPropString"] = isPropString;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Web.DOM.Element"] = $PS["Web.DOM.Element"] || {};
  var exports = $PS["Web.DOM.Element"];
  var Unsafe_Coerce = $PS["Unsafe.Coerce"];
  var toNode = Unsafe_Coerce.unsafeCoerce;
  exports["toNode"] = toNode;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Halogen.VDom.DOM"] = $PS["Halogen.VDom.DOM"] || {};
  var exports = $PS["Halogen.VDom.DOM"];
  var Data_Array = $PS["Data.Array"];
  var Data_Boolean = $PS["Data.Boolean"];
  var Data_Maybe = $PS["Data.Maybe"];
  var Data_Nullable = $PS["Data.Nullable"];
  var Data_Tuple = $PS["Data.Tuple"];
  var Halogen_VDom_Machine = $PS["Halogen.VDom.Machine"];
  var Halogen_VDom_Types = $PS["Halogen.VDom.Types"];
  var Halogen_VDom_Util = $PS["Halogen.VDom.Util"];
  var Web_DOM_Element = $PS["Web.DOM.Element"];

  var haltWidget = function haltWidget(v) {
    return Halogen_VDom_Machine.halt(v.widget);
  };

  var patchWidget = function patchWidget(state, vdom) {
    if (vdom instanceof Halogen_VDom_Types.Grafted) {
      return patchWidget(state, Halogen_VDom_Types.runGraft(vdom.value0));
    }

    ;

    if (vdom instanceof Halogen_VDom_Types.Widget) {
      var res = Halogen_VDom_Machine.step(state.widget, vdom.value0);
      var res$prime = Halogen_VDom_Machine.unStep(function (v) {
        return Halogen_VDom_Machine.mkStep(new Halogen_VDom_Machine.Step(v.value0, {
          build: state.build,
          widget: res
        }, patchWidget, haltWidget));
      })(res);
      return res$prime;
    }

    ;
    haltWidget(state);
    return state.build(vdom);
  };

  var haltText = function haltText(v) {
    var parent = Halogen_VDom_Util.parentNode(v.node);
    return Halogen_VDom_Util.removeChild(v.node, parent);
  };

  var patchText = function patchText(state, vdom) {
    if (vdom instanceof Halogen_VDom_Types.Grafted) {
      return patchText(state, Halogen_VDom_Types.runGraft(vdom.value0));
    }

    ;

    if (vdom instanceof Halogen_VDom_Types.Text) {
      if (state.value === vdom.value0) {
        return Halogen_VDom_Machine.mkStep(new Halogen_VDom_Machine.Step(state.node, state, patchText, haltText));
      }

      ;

      if (Data_Boolean.otherwise) {
        var nextState = {
          build: state.build,
          node: state.node,
          value: vdom.value0
        };
        Halogen_VDom_Util.setTextContent(vdom.value0, state.node);
        return Halogen_VDom_Machine.mkStep(new Halogen_VDom_Machine.Step(state.node, nextState, patchText, haltText));
      }

      ;
    }

    ;
    haltText(state);
    return state.build(vdom);
  };

  var haltKeyed = function haltKeyed(v) {
    var parent = Halogen_VDom_Util.parentNode(v.node);
    Halogen_VDom_Util.removeChild(v.node, parent);
    Halogen_VDom_Util.forInE(v.children, function (v1, s) {
      return Halogen_VDom_Machine.halt(s);
    });
    return Halogen_VDom_Machine.halt(v.attrs);
  };

  var haltElem = function haltElem(v) {
    var parent = Halogen_VDom_Util.parentNode(v.node);
    Halogen_VDom_Util.removeChild(v.node, parent);
    Halogen_VDom_Util.forEachE(v.children, Halogen_VDom_Machine.halt);
    return Halogen_VDom_Machine.halt(v.attrs);
  };

  var eqElemSpec = function eqElemSpec(ns1, v, ns2, v1) {
    var $56 = v === v1;

    if ($56) {
      if (ns1 instanceof Data_Maybe.Just && ns2 instanceof Data_Maybe.Just && ns1.value0 === ns2.value0) {
        return true;
      }

      ;

      if (ns1 instanceof Data_Maybe.Nothing && ns2 instanceof Data_Maybe.Nothing) {
        return true;
      }

      ;
      return false;
    }

    ;
    return false;
  };

  var patchElem = function patchElem(state, vdom) {
    if (vdom instanceof Halogen_VDom_Types.Grafted) {
      return patchElem(state, Halogen_VDom_Types.runGraft(vdom.value0));
    }

    ;

    if (vdom instanceof Halogen_VDom_Types.Elem && eqElemSpec(state.ns, state.name, vdom.value0, vdom.value1)) {
      var v = Data_Array.length(vdom.value3);
      var v1 = Data_Array.length(state.children);

      if (v1 === 0 && v === 0) {
        var attrs2 = Halogen_VDom_Machine.step(state.attrs, vdom.value2);
        var nextState = {
          build: state.build,
          node: state.node,
          attrs: attrs2,
          ns: vdom.value0,
          name: vdom.value1,
          children: state.children
        };
        return Halogen_VDom_Machine.mkStep(new Halogen_VDom_Machine.Step(state.node, nextState, patchElem, haltElem));
      }

      ;

      var onThis = function onThis(ix, s) {
        return Halogen_VDom_Machine.halt(s);
      };

      var onThese = function onThese(ix, s, v2) {
        var res = Halogen_VDom_Machine.step(s, v2);
        Halogen_VDom_Util.insertChildIx(ix, Halogen_VDom_Machine.extract(res), state.node);
        return res;
      };

      var onThat = function onThat(ix, v2) {
        var res = state.build(v2);
        Halogen_VDom_Util.insertChildIx(ix, Halogen_VDom_Machine.extract(res), state.node);
        return res;
      };

      var children2 = Halogen_VDom_Util.diffWithIxE(state.children, vdom.value3, onThese, onThis, onThat);
      var attrs2 = Halogen_VDom_Machine.step(state.attrs, vdom.value2);
      var nextState = {
        build: state.build,
        node: state.node,
        attrs: attrs2,
        ns: vdom.value0,
        name: vdom.value1,
        children: children2
      };
      return Halogen_VDom_Machine.mkStep(new Halogen_VDom_Machine.Step(state.node, nextState, patchElem, haltElem));
    }

    ;
    haltElem(state);
    return state.build(vdom);
  };

  var patchKeyed = function patchKeyed(state, vdom) {
    if (vdom instanceof Halogen_VDom_Types.Grafted) {
      return patchKeyed(state, Halogen_VDom_Types.runGraft(vdom.value0));
    }

    ;

    if (vdom instanceof Halogen_VDom_Types.Keyed && eqElemSpec(state.ns, state.name, vdom.value0, vdom.value1)) {
      var v = Data_Array.length(vdom.value3);

      if (state.length === 0 && v === 0) {
        var attrs2 = Halogen_VDom_Machine.step(state.attrs, vdom.value2);
        var nextState = {
          build: state.build,
          node: state.node,
          attrs: attrs2,
          ns: vdom.value0,
          name: vdom.value1,
          children: state.children,
          length: 0
        };
        return Halogen_VDom_Machine.mkStep(new Halogen_VDom_Machine.Step(state.node, nextState, patchKeyed, haltKeyed));
      }

      ;

      var onThis = function onThis(v2, s) {
        return Halogen_VDom_Machine.halt(s);
      };

      var onThese = function onThese(v2, ix$prime, s, v3) {
        var res = Halogen_VDom_Machine.step(s, v3.value1);
        Halogen_VDom_Util.insertChildIx(ix$prime, Halogen_VDom_Machine.extract(res), state.node);
        return res;
      };

      var onThat = function onThat(v2, ix, v3) {
        var res = state.build(v3.value1);
        Halogen_VDom_Util.insertChildIx(ix, Halogen_VDom_Machine.extract(res), state.node);
        return res;
      };

      var children2 = Halogen_VDom_Util.diffWithKeyAndIxE(state.children, vdom.value3, Data_Tuple.fst, onThese, onThis, onThat);
      var attrs2 = Halogen_VDom_Machine.step(state.attrs, vdom.value2);
      var nextState = {
        build: state.build,
        node: state.node,
        attrs: attrs2,
        ns: vdom.value0,
        name: vdom.value1,
        children: children2,
        length: v
      };
      return Halogen_VDom_Machine.mkStep(new Halogen_VDom_Machine.Step(state.node, nextState, patchKeyed, haltKeyed));
    }

    ;
    haltKeyed(state);
    return state.build(vdom);
  };

  var buildWidget = function buildWidget(v, build, w) {
    var res = v.buildWidget(v)(w);
    var res$prime = Halogen_VDom_Machine.unStep(function (v1) {
      return Halogen_VDom_Machine.mkStep(new Halogen_VDom_Machine.Step(v1.value0, {
        build: build,
        widget: res
      }, patchWidget, haltWidget));
    })(res);
    return res$prime;
  };

  var buildText = function buildText(v, build, s) {
    var node = Halogen_VDom_Util.createTextNode(s, v.document);
    var state = {
      build: build,
      node: node,
      value: s
    };
    return Halogen_VDom_Machine.mkStep(new Halogen_VDom_Machine.Step(node, state, patchText, haltText));
  };

  var buildKeyed = function buildKeyed(v, build, ns1, name1, as1, ch1) {
    var el = Halogen_VDom_Util.createElement(Data_Nullable.toNullable(ns1), name1, v.document);
    var node = Web_DOM_Element.toNode(el);

    var onChild = function onChild(k, ix, v1) {
      var res = build(v1.value1);
      Halogen_VDom_Util.insertChildIx(ix, Halogen_VDom_Machine.extract(res), node);
      return res;
    };

    var children = Halogen_VDom_Util.strMapWithIxE(ch1, Data_Tuple.fst, onChild);
    var attrs = v.buildAttributes(el)(as1);
    var state = {
      build: build,
      node: node,
      attrs: attrs,
      ns: ns1,
      name: name1,
      children: children,
      length: Data_Array.length(ch1)
    };
    return Halogen_VDom_Machine.mkStep(new Halogen_VDom_Machine.Step(node, state, patchKeyed, haltKeyed));
  };

  var buildElem = function buildElem(v, build, ns1, name1, as1, ch1) {
    var el = Halogen_VDom_Util.createElement(Data_Nullable.toNullable(ns1), name1, v.document);
    var node = Web_DOM_Element.toNode(el);

    var onChild = function onChild(ix, child) {
      var res = build(child);
      Halogen_VDom_Util.insertChildIx(ix, Halogen_VDom_Machine.extract(res), node);
      return res;
    };

    var children = Halogen_VDom_Util.forE(ch1, onChild);
    var attrs = v.buildAttributes(el)(as1);
    var state = {
      build: build,
      node: node,
      attrs: attrs,
      ns: ns1,
      name: name1,
      children: children
    };
    return Halogen_VDom_Machine.mkStep(new Halogen_VDom_Machine.Step(node, state, patchElem, haltElem));
  };

  var buildVDom = function buildVDom(spec) {
    var build = function build(v) {
      if (v instanceof Halogen_VDom_Types.Text) {
        return buildText(spec, build, v.value0);
      }

      ;

      if (v instanceof Halogen_VDom_Types.Elem) {
        return buildElem(spec, build, v.value0, v.value1, v.value2, v.value3);
      }

      ;

      if (v instanceof Halogen_VDom_Types.Keyed) {
        return buildKeyed(spec, build, v.value0, v.value1, v.value2, v.value3);
      }

      ;

      if (v instanceof Halogen_VDom_Types.Widget) {
        return buildWidget(spec, build, v.value0);
      }

      ;

      if (v instanceof Halogen_VDom_Types.Grafted) {
        return build(Halogen_VDom_Types.runGraft(v.value0));
      }

      ;
      throw new Error("Failed pattern match at Halogen.VDom.DOM (line 58, column 27 - line 63, column 52): " + [v.constructor.name]);
    };

    return build;
  };

  exports["buildVDom"] = buildVDom;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Halogen.VDom.Thunk"] = $PS["Halogen.VDom.Thunk"] || {};
  var exports = $PS["Halogen.VDom.Thunk"];
  var Halogen_VDom_DOM = $PS["Halogen.VDom.DOM"];
  var Halogen_VDom_Machine = $PS["Halogen.VDom.Machine"];
  var Halogen_VDom_Util = $PS["Halogen.VDom.Util"];

  var Thunk = function () {
    function Thunk(value0, value1, value2, value3) {
      this.value0 = value0;
      this.value1 = value1;
      this.value2 = value2;
      this.value3 = value3;
    }

    ;

    Thunk.create = function (value0) {
      return function (value1) {
        return function (value2) {
          return function (value3) {
            return new Thunk(value0, value1, value2, value3);
          };
        };
      };
    };

    return Thunk;
  }();

  var unsafeEqThunk = function unsafeEqThunk(v, v1) {
    return Halogen_VDom_Util.refEq(v.value0, v1.value0) && Halogen_VDom_Util.refEq(v.value1, v1.value1) && v.value1(v.value3, v1.value3);
  };

  var thunk = function thunk(tid, eqFn, f, a) {
    return new Thunk(tid, eqFn, f, a);
  };

  var runThunk = function runThunk(v) {
    return v.value2(v.value3);
  };

  var mapThunk = function mapThunk(k) {
    return function (v) {
      return new Thunk(v.value0, v.value1, function ($46) {
        return k(v.value2($46));
      }, v.value3);
    };
  };

  var hoist = mapThunk;

  var buildThunk = function buildThunk(toVDom) {
    var haltThunk = function haltThunk(state) {
      return Halogen_VDom_Machine.halt(state.vdom);
    };

    var patchThunk = function patchThunk(state, t2) {
      var $43 = unsafeEqThunk(state.thunk, t2);

      if ($43) {
        return Halogen_VDom_Machine.mkStep(new Halogen_VDom_Machine.Step(Halogen_VDom_Machine.extract(state.vdom), state, patchThunk, haltThunk));
      }

      ;
      var vdom = Halogen_VDom_Machine.step(state.vdom, toVDom(runThunk(t2)));
      return Halogen_VDom_Machine.mkStep(new Halogen_VDom_Machine.Step(Halogen_VDom_Machine.extract(vdom), {
        vdom: vdom,
        thunk: t2
      }, patchThunk, haltThunk));
    };

    var renderThunk = function renderThunk(spec) {
      return function (t) {
        var vdom = Halogen_VDom_DOM.buildVDom(spec)(toVDom(runThunk(t)));
        return Halogen_VDom_Machine.mkStep(new Halogen_VDom_Machine.Step(Halogen_VDom_Machine.extract(vdom), {
          thunk: t,
          vdom: vdom
        }, patchThunk, haltThunk));
      };
    };

    return renderThunk;
  };

  exports["buildThunk"] = buildThunk;
  exports["hoist"] = hoist;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Halogen.Component"] = $PS["Halogen.Component"] || {};
  var exports = $PS["Halogen.Component"];
  var Control_Applicative = $PS["Control.Applicative"];
  var Data_Bifunctor = $PS["Data.Bifunctor"];
  var Data_Coyoneda = $PS["Data.Coyoneda"];
  var Data_Foldable = $PS["Data.Foldable"];
  var Data_Function = $PS["Data.Function"];
  var Data_Functor = $PS["Data.Functor"];
  var Data_Maybe = $PS["Data.Maybe"];
  var Data_Unit = $PS["Data.Unit"];
  var Halogen_HTML_Core = $PS["Halogen.HTML.Core"];
  var Halogen_Query_HalogenM = $PS["Halogen.Query.HalogenM"];
  var Halogen_Query_HalogenQ = $PS["Halogen.Query.HalogenQ"];
  var Halogen_VDom_Thunk = $PS["Halogen.VDom.Thunk"];
  var Unsafe_Coerce = $PS["Unsafe.Coerce"];

  var ComponentSlot = function () {
    function ComponentSlot(value0) {
      this.value0 = value0;
    }

    ;

    ComponentSlot.create = function (value0) {
      return new ComponentSlot(value0);
    };

    return ComponentSlot;
  }();

  var ThunkSlot = function () {
    function ThunkSlot(value0) {
      this.value0 = value0;
    }

    ;

    ThunkSlot.create = function (value0) {
      return new ThunkSlot(value0);
    };

    return ThunkSlot;
  }();

  var unComponentSlot = Unsafe_Coerce.unsafeCoerce;
  var unComponent = Unsafe_Coerce.unsafeCoerce;

  var mkEval = function mkEval(args) {
    return function (v) {
      if (v instanceof Halogen_Query_HalogenQ.Initialize) {
        return Data_Functor.voidLeft(Halogen_Query_HalogenM.functorHalogenM)(Data_Foldable.traverse_(Halogen_Query_HalogenM.applicativeHalogenM)(Data_Foldable.foldableMaybe)(args.handleAction)(args.initialize))(v.value0);
      }

      ;

      if (v instanceof Halogen_Query_HalogenQ.Finalize) {
        return Data_Functor.voidLeft(Halogen_Query_HalogenM.functorHalogenM)(Data_Foldable.traverse_(Halogen_Query_HalogenM.applicativeHalogenM)(Data_Foldable.foldableMaybe)(args.handleAction)(args.finalize))(v.value0);
      }

      ;

      if (v instanceof Halogen_Query_HalogenQ.Receive) {
        return Data_Functor.voidLeft(Halogen_Query_HalogenM.functorHalogenM)(Data_Foldable.traverse_(Halogen_Query_HalogenM.applicativeHalogenM)(Data_Foldable.foldableMaybe)(args.handleAction)(args.receive(v.value0)))(v.value1);
      }

      ;

      if (v instanceof Halogen_Query_HalogenQ.Action) {
        return Data_Functor.voidLeft(Halogen_Query_HalogenM.functorHalogenM)(args.handleAction(v.value0))(v.value1);
      }

      ;

      if (v instanceof Halogen_Query_HalogenQ.Query) {
        return Data_Coyoneda.unCoyoneda(function (g) {
          var $25 = Data_Functor.map(Halogen_Query_HalogenM.functorHalogenM)(Data_Maybe.maybe(v.value1(Data_Unit.unit))(g));
          return function ($26) {
            return $25(args.handleQuery($26));
          };
        })(v.value0);
      }

      ;
      throw new Error("Failed pattern match at Halogen.Component (line 182, column 15 - line 192, column 70): " + [v.constructor.name]);
    };
  };

  var mkComponentSlot = Unsafe_Coerce.unsafeCoerce;
  var mkComponent = Unsafe_Coerce.unsafeCoerce;

  var hoistSlot = function hoistSlot(dictFunctor) {
    return function (nat) {
      return function (v) {
        if (v instanceof ComponentSlot) {
          return unComponentSlot(function (slot) {
            return ComponentSlot.create(mkComponentSlot({
              get: slot.get,
              pop: slot.pop,
              set: slot.set,
              component: hoist(dictFunctor)(nat)(slot.component),
              input: slot.input,
              output: slot.output
            }));
          })(v.value0);
        }

        ;

        if (v instanceof ThunkSlot) {
          return ThunkSlot.create(Halogen_VDom_Thunk.hoist(Data_Bifunctor.lmap(Halogen_HTML_Core.bifunctorHTML)(hoistSlot(dictFunctor)(nat)))(v.value0));
        }

        ;
        throw new Error("Failed pattern match at Halogen.Component (line 279, column 17 - line 284, column 53): " + [v.constructor.name]);
      };
    };
  };

  var hoist = function hoist(dictFunctor) {
    return function (nat) {
      return unComponent(function (c) {
        return mkComponent({
          initialState: c.initialState,
          render: function () {
            var $27 = Data_Bifunctor.lmap(Halogen_HTML_Core.bifunctorHTML)(hoistSlot(dictFunctor)(nat));
            return function ($28) {
              return $27(c.render($28));
            };
          }(),
          "eval": function () {
            var $29 = Halogen_Query_HalogenM.hoist(dictFunctor)(nat);
            return function ($30) {
              return $29(c["eval"]($30));
            };
          }()
        });
      });
    };
  };

  var defaultEval = {
    handleAction: Data_Function["const"](Control_Applicative.pure(Halogen_Query_HalogenM.applicativeHalogenM)(Data_Unit.unit)),
    handleQuery: Data_Function["const"](Control_Applicative.pure(Halogen_Query_HalogenM.applicativeHalogenM)(Data_Maybe.Nothing.value)),
    receive: Data_Function["const"](Data_Maybe.Nothing.value),
    initialize: Data_Maybe.Nothing.value,
    finalize: Data_Maybe.Nothing.value
  };
  exports["mkComponent"] = mkComponent;
  exports["unComponent"] = unComponent;
  exports["hoist"] = hoist;
  exports["mkEval"] = mkEval;
  exports["defaultEval"] = defaultEval;
  exports["ComponentSlot"] = ComponentSlot;
  exports["ThunkSlot"] = ThunkSlot;
  exports["unComponentSlot"] = unComponentSlot;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Halogen.Aff.Driver"] = $PS["Halogen.Aff.Driver"] || {};
  var exports = $PS["Halogen.Aff.Driver"];
  var Control_Applicative = $PS["Control.Applicative"];
  var Control_Bind = $PS["Control.Bind"];
  var Control_Category = $PS["Control.Category"];
  var Control_Monad_Fork_Class = $PS["Control.Monad.Fork.Class"];
  var Control_Monad_Rec_Class = $PS["Control.Monad.Rec.Class"];
  var Control_Parallel = $PS["Control.Parallel"];
  var Data_Foldable = $PS["Data.Foldable"];
  var Data_Function = $PS["Data.Function"];
  var Data_Functor = $PS["Data.Functor"];
  var Data_List = $PS["Data.List"];
  var Data_List_Types = $PS["Data.List.Types"];
  var Data_Map_Internal = $PS["Data.Map.Internal"];
  var Data_Maybe = $PS["Data.Maybe"];
  var Data_Unit = $PS["Data.Unit"];
  var Effect = $PS["Effect"];
  var Effect_Aff = $PS["Effect.Aff"];
  var Effect_Class = $PS["Effect.Class"];
  var Effect_Console = $PS["Effect.Console"];
  var Effect_Exception = $PS["Effect.Exception"];
  var Effect_Ref = $PS["Effect.Ref"];
  var Halogen_Aff_Driver_Eval = $PS["Halogen.Aff.Driver.Eval"];
  var Halogen_Aff_Driver_State = $PS["Halogen.Aff.Driver.State"];
  var Halogen_Component = $PS["Halogen.Component"];
  var Halogen_Data_Slot = $PS["Halogen.Data.Slot"];
  var Halogen_Query_HalogenQ = $PS["Halogen.Query.HalogenQ"];
  var Halogen_Query_Input = $PS["Halogen.Query.Input"];
  var Halogen_Subscription = $PS["Halogen.Subscription"];
  var newLifecycleHandlers = Effect_Ref["new"]({
    initializers: Data_List_Types.Nil.value,
    finalizers: Data_List_Types.Nil.value
  });

  var handlePending = function handlePending(ref) {
    return function __do() {
      var queue = Effect_Ref.read(ref)();
      Effect_Ref.write(Data_Maybe.Nothing.value)(ref)();
      return Data_Foldable.for_(Effect.applicativeEffect)(Data_Foldable.foldableMaybe)(queue)(function () {
        var $28 = Data_Foldable.traverse_(Effect_Aff.applicativeAff)(Data_List_Types.foldableList)(Control_Monad_Fork_Class.fork(Control_Monad_Fork_Class.monadForkAff));
        return function ($29) {
          return Halogen_Aff_Driver_Eval.handleAff($28(Data_List.reverse($29)));
        };
      }())();
    };
  };

  var cleanupSubscriptionsAndForks = function cleanupSubscriptionsAndForks(v) {
    return function __do() {
      Control_Bind.bindFlipped(Effect.bindEffect)(Data_Foldable.traverse_(Effect.applicativeEffect)(Data_Foldable.foldableMaybe)(Data_Foldable.traverse_(Effect.applicativeEffect)(Data_Map_Internal.foldableMap)(Halogen_Subscription.unsubscribe)))(Effect_Ref.read(v.subscriptions))();
      Effect_Ref.write(Data_Maybe.Nothing.value)(v.subscriptions)();
      Control_Bind.bindFlipped(Effect.bindEffect)(Data_Foldable.traverse_(Effect.applicativeEffect)(Data_Map_Internal.foldableMap)(function () {
        var $30 = Effect_Aff.killFiber(Effect_Exception.error("finalized"));
        return function ($31) {
          return Halogen_Aff_Driver_Eval.handleAff($30($31));
        };
      }()))(Effect_Ref.read(v.forks))();
      return Effect_Ref.write(Data_Map_Internal.empty)(v.forks)();
    };
  };

  var runUI = function runUI(renderSpec) {
    return function (component) {
      return function (i) {
        var squashChildInitializers = function squashChildInitializers(lchs) {
          return function (preInits) {
            return Halogen_Aff_Driver_State.unDriverStateX(function (st) {
              var parentInitializer = Halogen_Aff_Driver_Eval.evalM(render)(st.selfRef)(st["component"]["eval"](new Halogen_Query_HalogenQ.Initialize(Data_Unit.unit)));
              return Effect_Ref.modify_(function (handlers) {
                return {
                  initializers: new Data_List_Types.Cons(Control_Bind.discard(Control_Bind.discardUnit)(Effect_Aff.bindAff)(Control_Parallel.parSequence_(Effect_Aff.parallelAff)(Data_List_Types.foldableList)(Data_List.reverse(handlers.initializers)))(function () {
                    return Control_Bind.discard(Control_Bind.discardUnit)(Effect_Aff.bindAff)(parentInitializer)(function () {
                      return Effect_Class.liftEffect(Effect_Aff.monadEffectAff)(function __do() {
                        handlePending(st.pendingQueries)();
                        return handlePending(st.pendingOuts)();
                      });
                    });
                  }), preInits),
                  finalizers: handlers.finalizers
                };
              })(lchs);
            });
          };
        };

        var runComponent = function runComponent(lchs) {
          return function (handler) {
            return function (j) {
              return Halogen_Component.unComponent(function (c) {
                return function __do() {
                  var lchs$prime = newLifecycleHandlers();
                  var $$var = Halogen_Aff_Driver_State.initDriverState(c)(j)(handler)(lchs$prime)();
                  var pre = Effect_Ref.read(lchs)();
                  Effect_Ref.write({
                    initializers: Data_List_Types.Nil.value,
                    finalizers: pre.finalizers
                  })(lchs)();
                  Control_Bind.bindFlipped(Effect.bindEffect)(Halogen_Aff_Driver_State.unDriverStateX(function () {
                    var $32 = render(lchs);
                    return function ($33) {
                      return $32(function (v) {
                        return v.selfRef;
                      }($33));
                    };
                  }()))(Effect_Ref.read($$var))();
                  Control_Bind.bindFlipped(Effect.bindEffect)(squashChildInitializers(lchs)(pre.initializers))(Effect_Ref.read($$var))();
                  return $$var;
                };
              });
            };
          };
        };

        var renderChild = function renderChild(lchs) {
          return function (handler) {
            return function (childrenInRef) {
              return function (childrenOutRef) {
                return Halogen_Component.unComponentSlot(function (slot) {
                  return function __do() {
                    var childrenIn = Data_Functor.map(Effect.functorEffect)(slot.pop)(Effect_Ref.read(childrenInRef))();

                    var $$var = function () {
                      if (childrenIn instanceof Data_Maybe.Just) {
                        Effect_Ref.write(childrenIn.value0.value1)(childrenInRef)();
                        var dsx = Effect_Ref.read(childrenIn.value0.value0)();
                        Halogen_Aff_Driver_State.unDriverStateX(function (st) {
                          return function __do() {
                            Data_Function.flip(Effect_Ref.write)(st.handlerRef)(function () {
                              var $34 = Data_Maybe.maybe(Control_Applicative.pure(Effect_Aff.applicativeAff)(Data_Unit.unit))(handler);
                              return function ($35) {
                                return $34(slot.output($35));
                              };
                            }())();
                            return Halogen_Aff_Driver_Eval.handleAff(Halogen_Aff_Driver_Eval.evalM(render)(st.selfRef)(st["component"]["eval"](new Halogen_Query_HalogenQ.Receive(slot.input, Data_Unit.unit))))();
                          };
                        })(dsx)();
                        return childrenIn.value0.value0;
                      }

                      ;

                      if (childrenIn instanceof Data_Maybe.Nothing) {
                        return runComponent(lchs)(function () {
                          var $36 = Data_Maybe.maybe(Control_Applicative.pure(Effect_Aff.applicativeAff)(Data_Unit.unit))(handler);
                          return function ($37) {
                            return $36(slot.output($37));
                          };
                        }())(slot.input)(slot.component)();
                      }

                      ;
                      throw new Error("Failed pattern match at Halogen.Aff.Driver (line 211, column 14 - line 220, column 98): " + [childrenIn.constructor.name]);
                    }();

                    var isDuplicate = Data_Functor.map(Effect.functorEffect)(function ($38) {
                      return Data_Maybe.isJust(slot.get($38));
                    })(Effect_Ref.read(childrenOutRef))();
                    Control_Applicative.when(Effect.applicativeEffect)(isDuplicate)(Effect_Console.warn("Halogen: Duplicate slot address was detected during rendering, unexpected results may occur"))();
                    Effect_Ref.modify_(slot.set($$var))(childrenOutRef)();
                    return Control_Bind.bind(Effect.bindEffect)(Effect_Ref.read($$var))(Halogen_Aff_Driver_State.renderStateX(Effect.functorEffect)(function (v) {
                      if (v instanceof Data_Maybe.Nothing) {
                        return Effect_Exception["throw"]("Halogen internal error: child was not initialized in renderChild");
                      }

                      ;

                      if (v instanceof Data_Maybe.Just) {
                        return Control_Applicative.pure(Effect.applicativeEffect)(renderSpec.renderChild(v.value0));
                      }

                      ;
                      throw new Error("Failed pattern match at Halogen.Aff.Driver (line 225, column 37 - line 227, column 50): " + [v.constructor.name]);
                    }))();
                  };
                });
              };
            };
          };
        };

        var render = function render(lchs) {
          return function ($$var) {
            return function __do() {
              var v = Effect_Ref.read($$var)();
              var shouldProcessHandlers = Data_Functor.map(Effect.functorEffect)(Data_Maybe.isNothing)(Effect_Ref.read(v.pendingHandlers))();
              Control_Applicative.when(Effect.applicativeEffect)(shouldProcessHandlers)(Effect_Ref.write(new Data_Maybe.Just(Data_List_Types.Nil.value))(v.pendingHandlers))();
              Effect_Ref.write(Halogen_Data_Slot.empty)(v.childrenOut)();
              Effect_Ref.write(v.children)(v.childrenIn)();
              var selfRef = Control_Category.identity(Control_Category.categoryFn)(v.selfRef);
              var pendingQueries = Control_Category.identity(Control_Category.categoryFn)(v.pendingQueries);
              var pendingHandlers = Control_Category.identity(Control_Category.categoryFn)(v.pendingHandlers);

              var handler = function () {
                var $39 = Halogen_Aff_Driver_Eval.queueOrRun(pendingHandlers);
                var $40 = Data_Functor["void"](Effect_Aff.functorAff);
                var $41 = Halogen_Aff_Driver_Eval.evalF(render)(selfRef);
                return function ($42) {
                  return $39($40($41($42)));
                };
              }();

              var childHandler = function () {
                var $43 = Halogen_Aff_Driver_Eval.queueOrRun(pendingQueries);
                return function ($44) {
                  return $43(handler(Halogen_Query_Input.Action.create($44)));
                };
              }();

              var rendering = renderSpec.render(function ($45) {
                return Halogen_Aff_Driver_Eval.handleAff(handler($45));
              })(renderChild(lchs)(childHandler)(v.childrenIn)(v.childrenOut))(v.component.render(v.state))(v.rendering)();
              var children = Effect_Ref.read(v.childrenOut)();
              var childrenIn = Effect_Ref.read(v.childrenIn)();
              Halogen_Data_Slot.foreachSlot(Effect.applicativeEffect)(childrenIn)(function (v1) {
                return function __do() {
                  var childDS = Effect_Ref.read(v1)();
                  Halogen_Aff_Driver_State.renderStateX_(Effect.applicativeEffect)(renderSpec.removeChild)(childDS)();
                  return finalize(lchs)(childDS)();
                };
              })();
              Data_Function.flip(Effect_Ref.modify_)(v.selfRef)(Halogen_Aff_Driver_State.mapDriverState(function (ds$prime) {
                return {
                  component: ds$prime.component,
                  state: ds$prime.state,
                  refs: ds$prime.refs,
                  children: children,
                  childrenIn: ds$prime.childrenIn,
                  childrenOut: ds$prime.childrenOut,
                  selfRef: ds$prime.selfRef,
                  handlerRef: ds$prime.handlerRef,
                  pendingQueries: ds$prime.pendingQueries,
                  pendingOuts: ds$prime.pendingOuts,
                  pendingHandlers: ds$prime.pendingHandlers,
                  rendering: new Data_Maybe.Just(rendering),
                  fresh: ds$prime.fresh,
                  subscriptions: ds$prime.subscriptions,
                  forks: ds$prime.forks,
                  lifecycleHandlers: ds$prime.lifecycleHandlers
                };
              }))();
              return Control_Applicative.when(Effect.applicativeEffect)(shouldProcessHandlers)(Data_Function.flip(Control_Monad_Rec_Class.tailRecM(Control_Monad_Rec_Class.monadRecEffect))(Data_Unit.unit)(function (v1) {
                return function __do() {
                  var handlers = Effect_Ref.read(pendingHandlers)();
                  Effect_Ref.write(new Data_Maybe.Just(Data_List_Types.Nil.value))(pendingHandlers)();
                  Data_Foldable.traverse_(Effect.applicativeEffect)(Data_Foldable.foldableMaybe)(function () {
                    var $46 = Data_Foldable.traverse_(Effect_Aff.applicativeAff)(Data_List_Types.foldableList)(Control_Monad_Fork_Class.fork(Control_Monad_Fork_Class.monadForkAff));
                    return function ($47) {
                      return Halogen_Aff_Driver_Eval.handleAff($46(Data_List.reverse($47)));
                    };
                  }())(handlers)();
                  var mmore = Effect_Ref.read(pendingHandlers)();
                  var $21 = Data_Maybe.maybe(false)(Data_List["null"])(mmore);

                  if ($21) {
                    return Data_Functor.voidLeft(Effect.functorEffect)(Effect_Ref.write(Data_Maybe.Nothing.value)(pendingHandlers))(new Control_Monad_Rec_Class.Done(Data_Unit.unit))();
                  }

                  ;
                  return new Control_Monad_Rec_Class.Loop(Data_Unit.unit);
                };
              }))();
            };
          };
        };

        var finalize = function finalize(lchs) {
          return Halogen_Aff_Driver_State.unDriverStateX(function (st) {
            return function __do() {
              cleanupSubscriptionsAndForks(st)();
              var f = Halogen_Aff_Driver_Eval.evalM(render)(st.selfRef)(st["component"]["eval"](new Halogen_Query_HalogenQ.Finalize(Data_Unit.unit)));
              Effect_Ref.modify_(function (handlers) {
                return {
                  initializers: handlers.initializers,
                  finalizers: new Data_List_Types.Cons(f, handlers.finalizers)
                };
              })(lchs)();
              return Halogen_Data_Slot.foreachSlot(Effect.applicativeEffect)(st.children)(function (v) {
                return function __do() {
                  var dsx = Effect_Ref.read(v)();
                  return finalize(lchs)(dsx)();
                };
              })();
            };
          });
        };

        var evalDriver = function evalDriver(disposed) {
          return function (ref) {
            return function (q) {
              return Control_Bind.bind(Effect_Aff.bindAff)(Effect_Class.liftEffect(Effect_Aff.monadEffectAff)(Effect_Ref.read(disposed)))(function (v) {
                if (v) {
                  return Control_Applicative.pure(Effect_Aff.applicativeAff)(Data_Maybe.Nothing.value);
                }

                ;
                return Halogen_Aff_Driver_Eval.evalQ(render)(ref)(q);
              });
            };
          };
        };

        var dispose = function dispose(disposed) {
          return function (lchs) {
            return function (dsx) {
              return Halogen_Aff_Driver_Eval.handleLifecycle(lchs)(function __do() {
                var v = Effect_Ref.read(disposed)();

                if (v) {
                  return Data_Unit.unit;
                }

                ;
                Effect_Ref.write(true)(disposed)();
                finalize(lchs)(dsx)();
                return Halogen_Aff_Driver_State.unDriverStateX(function (v1) {
                  return function __do() {
                    var v2 = Effect_Class.liftEffect(Effect_Class.monadEffectEffect)(Effect_Ref.read(v1.selfRef))();
                    return Data_Foldable.for_(Effect.applicativeEffect)(Data_Foldable.foldableMaybe)(v2.rendering)(renderSpec.dispose)();
                  };
                })(dsx)();
              });
            };
          };
        };

        return Control_Bind.bind(Effect_Aff.bindAff)(Effect_Class.liftEffect(Effect_Aff.monadEffectAff)(newLifecycleHandlers))(function (lchs) {
          return Control_Bind.bind(Effect_Aff.bindAff)(Effect_Class.liftEffect(Effect_Aff.monadEffectAff)(Effect_Ref["new"](0)))(function (fresh) {
            return Control_Bind.bind(Effect_Aff.bindAff)(Effect_Class.liftEffect(Effect_Aff.monadEffectAff)(Effect_Ref["new"](false)))(function (disposed) {
              return Halogen_Aff_Driver_Eval.handleLifecycle(lchs)(function __do() {
                var sio = Halogen_Subscription.create();
                var dsx = Control_Bind.bindFlipped(Effect.bindEffect)(Effect_Ref.read)(runComponent(lchs)(function () {
                  var $48 = Effect_Class.liftEffect(Effect_Aff.monadEffectAff);
                  var $49 = Halogen_Subscription.notify(sio.listener);
                  return function ($50) {
                    return $48($49($50));
                  };
                }())(i)(component))();
                return Halogen_Aff_Driver_State.unDriverStateX(function (st) {
                  return Control_Applicative.pure(Effect.applicativeEffect)({
                    query: evalDriver(disposed)(st.selfRef),
                    messages: sio.emitter,
                    dispose: dispose(disposed)(lchs)(dsx)
                  });
                })(dsx)();
              });
            });
          });
        });
      };
    };
  };

  exports["runUI"] = runUI;
})(PS);

(function (exports) {
  "use strict";

  exports._querySelector = function (selector) {
    return function (node) {
      return function () {
        return node.querySelector(selector);
      };
    };
  };
})(PS["Web.DOM.ParentNode"] = PS["Web.DOM.ParentNode"] || {});

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Web.DOM.ParentNode"] = $PS["Web.DOM.ParentNode"] || {};
  var exports = $PS["Web.DOM.ParentNode"];
  var $foreign = $PS["Web.DOM.ParentNode"];
  var Data_Functor = $PS["Data.Functor"];
  var Data_Nullable = $PS["Data.Nullable"];
  var Effect = $PS["Effect"];

  var querySelector = function querySelector(qs) {
    var $0 = Data_Functor.map(Effect.functorEffect)(Data_Nullable.toMaybe);
    var $1 = $foreign["_querySelector"](qs);
    return function ($2) {
      return $0($1($2));
    };
  };

  exports["querySelector"] = querySelector;
})(PS);

(function (exports) {
  "use strict";

  exports.window = function () {
    return window;
  };
})(PS["Web.HTML"] = PS["Web.HTML"] || {});

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Web.HTML"] = $PS["Web.HTML"] || {};
  var exports = $PS["Web.HTML"];
  var $foreign = $PS["Web.HTML"];
  exports["window"] = $foreign.window;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Web.HTML.Event.EventTypes"] = $PS["Web.HTML.Event.EventTypes"] || {};
  var exports = $PS["Web.HTML.Event.EventTypes"];
  var domcontentloaded = "DOMContentLoaded";
  exports["domcontentloaded"] = domcontentloaded;
})(PS);

(function (exports) {
  "use strict";

  exports._readyState = function (doc) {
    return function () {
      return doc.readyState;
    };
  };
})(PS["Web.HTML.HTMLDocument"] = PS["Web.HTML.HTMLDocument"] || {});

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Web.HTML.HTMLDocument.ReadyState"] = $PS["Web.HTML.HTMLDocument.ReadyState"] || {};
  var exports = $PS["Web.HTML.HTMLDocument.ReadyState"];
  var Data_Maybe = $PS["Data.Maybe"];

  var Loading = function () {
    function Loading() {}

    ;
    Loading.value = new Loading();
    return Loading;
  }();

  var Interactive = function () {
    function Interactive() {}

    ;
    Interactive.value = new Interactive();
    return Interactive;
  }();

  var Complete = function () {
    function Complete() {}

    ;
    Complete.value = new Complete();
    return Complete;
  }();

  var parse = function parse(v) {
    if (v === "loading") {
      return new Data_Maybe.Just(Loading.value);
    }

    ;

    if (v === "interactive") {
      return new Data_Maybe.Just(Interactive.value);
    }

    ;

    if (v === "complete") {
      return new Data_Maybe.Just(Complete.value);
    }

    ;
    return Data_Maybe.Nothing.value;
  };

  exports["Loading"] = Loading;
  exports["parse"] = parse;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Web.HTML.HTMLDocument"] = $PS["Web.HTML.HTMLDocument"] || {};
  var exports = $PS["Web.HTML.HTMLDocument"];
  var $foreign = $PS["Web.HTML.HTMLDocument"];
  var Data_Functor = $PS["Data.Functor"];
  var Data_Maybe = $PS["Data.Maybe"];
  var Effect = $PS["Effect"];
  var Unsafe_Coerce = $PS["Unsafe.Coerce"];
  var Web_HTML_HTMLDocument_ReadyState = $PS["Web.HTML.HTMLDocument.ReadyState"];
  var toParentNode = Unsafe_Coerce.unsafeCoerce;
  var toDocument = Unsafe_Coerce.unsafeCoerce;

  var readyState = function () {
    var $0 = Data_Functor.map(Effect.functorEffect)(function () {
      var $2 = Data_Maybe.fromMaybe(Web_HTML_HTMLDocument_ReadyState.Loading.value);
      return function ($3) {
        return $2(Web_HTML_HTMLDocument_ReadyState.parse($3));
      };
    }());
    return function ($1) {
      return $0($foreign["_readyState"]($1));
    };
  }();

  exports["toDocument"] = toDocument;
  exports["toParentNode"] = toParentNode;
  exports["readyState"] = readyState;
})(PS);

(function (exports) {
  "use strict";

  exports._read = function (nothing, just, value) {
    var tag = Object.prototype.toString.call(value);

    if (tag.indexOf("[object HTML") === 0 && tag.indexOf("Element]") === tag.length - 8) {
      return just(value);
    } else {
      return nothing;
    }
  };
})(PS["Web.HTML.HTMLElement"] = PS["Web.HTML.HTMLElement"] || {});

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Web.HTML.HTMLElement"] = $PS["Web.HTML.HTMLElement"] || {};
  var exports = $PS["Web.HTML.HTMLElement"];
  var $foreign = $PS["Web.HTML.HTMLElement"];
  var Data_Maybe = $PS["Data.Maybe"];
  var Unsafe_Coerce = $PS["Unsafe.Coerce"];
  var toNode = Unsafe_Coerce.unsafeCoerce;

  var fromElement = function fromElement(x) {
    return $foreign["_read"](Data_Maybe.Nothing.value, Data_Maybe.Just.create, x);
  };

  exports["fromElement"] = fromElement;
  exports["toNode"] = toNode;
})(PS);

(function (exports) {
  "use strict";

  exports.document = function (window) {
    return function () {
      return window.document;
    };
  };

  exports.location = function (window) {
    return function () {
      return window.location;
    };
  };

  exports.history = function (window) {
    return function () {
      return window.history;
    };
  };
})(PS["Web.HTML.Window"] = PS["Web.HTML.Window"] || {});

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Web.HTML.Window"] = $PS["Web.HTML.Window"] || {};
  var exports = $PS["Web.HTML.Window"];
  var $foreign = $PS["Web.HTML.Window"];
  var Unsafe_Coerce = $PS["Unsafe.Coerce"];
  var toEventTarget = Unsafe_Coerce.unsafeCoerce;
  exports["toEventTarget"] = toEventTarget;
  exports["document"] = $foreign.document;
  exports["location"] = $foreign.location;
  exports["history"] = $foreign.history;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Halogen.Aff.Util"] = $PS["Halogen.Aff.Util"] || {};
  var exports = $PS["Halogen.Aff.Util"];
  var Control_Applicative = $PS["Control.Applicative"];
  var Control_Bind = $PS["Control.Bind"];
  var Control_Monad_Error_Class = $PS["Control.Monad.Error.Class"];
  var Data_Either = $PS["Data.Either"];
  var Data_Function = $PS["Data.Function"];
  var Data_Functor = $PS["Data.Functor"];
  var Data_Maybe = $PS["Data.Maybe"];
  var Data_Unit = $PS["Data.Unit"];
  var Effect = $PS["Effect"];
  var Effect_Aff = $PS["Effect.Aff"];
  var Effect_Class = $PS["Effect.Class"];
  var Effect_Exception = $PS["Effect.Exception"];
  var Web_DOM_ParentNode = $PS["Web.DOM.ParentNode"];
  var Web_Event_EventTarget = $PS["Web.Event.EventTarget"];
  var Web_HTML = $PS["Web.HTML"];
  var Web_HTML_Event_EventTypes = $PS["Web.HTML.Event.EventTypes"];
  var Web_HTML_HTMLDocument = $PS["Web.HTML.HTMLDocument"];
  var Web_HTML_HTMLDocument_ReadyState = $PS["Web.HTML.HTMLDocument.ReadyState"];
  var Web_HTML_HTMLElement = $PS["Web.HTML.HTMLElement"];
  var Web_HTML_Window = $PS["Web.HTML.Window"];

  var selectElement = function selectElement(query) {
    return Control_Bind.bind(Effect_Aff.bindAff)(Effect_Class.liftEffect(Effect_Aff.monadEffectAff)(Control_Bind.bindFlipped(Effect.bindEffect)(Control_Bind.composeKleisliFlipped(Effect.bindEffect)(function () {
      var $2 = Web_DOM_ParentNode.querySelector(query);
      return function ($3) {
        return $2(Web_HTML_HTMLDocument.toParentNode($3));
      };
    }())(Web_HTML_Window.document))(Web_HTML.window)))(function (mel) {
      return Control_Applicative.pure(Effect_Aff.applicativeAff)(Control_Bind.bindFlipped(Data_Maybe.bindMaybe)(Web_HTML_HTMLElement.fromElement)(mel));
    });
  };

  var runHalogenAff = Effect_Aff.runAff_(Data_Either.either(Effect_Exception.throwException)(Data_Function["const"](Control_Applicative.pure(Effect.applicativeEffect)(Data_Unit.unit))));
  var awaitLoad = Effect_Aff.makeAff(function (callback) {
    return function __do() {
      var rs = Control_Bind.bindFlipped(Effect.bindEffect)(Web_HTML_HTMLDocument.readyState)(Control_Bind.bindFlipped(Effect.bindEffect)(Web_HTML_Window.document)(Web_HTML.window))();

      if (rs instanceof Web_HTML_HTMLDocument_ReadyState.Loading) {
        var et = Data_Functor.map(Effect.functorEffect)(Web_HTML_Window.toEventTarget)(Web_HTML.window)();
        var listener = Web_Event_EventTarget.eventListener(function (v) {
          return callback(new Data_Either.Right(Data_Unit.unit));
        })();
        Web_Event_EventTarget.addEventListener(Web_HTML_Event_EventTypes.domcontentloaded)(listener)(false)(et)();
        return Effect_Aff.effectCanceler(Web_Event_EventTarget.removeEventListener(Web_HTML_Event_EventTypes.domcontentloaded)(listener)(false)(et));
      }

      ;
      callback(new Data_Either.Right(Data_Unit.unit))();
      return Effect_Aff.nonCanceler;
    };
  });
  var awaitBody = Control_Bind.discard(Control_Bind.discardUnit)(Effect_Aff.bindAff)(awaitLoad)(function () {
    return Control_Bind.bind(Effect_Aff.bindAff)(selectElement("body"))(function (body) {
      return Data_Maybe.maybe(Control_Monad_Error_Class.throwError(Effect_Aff.monadThrowAff)(Effect_Exception.error("Could not find body")))(Control_Applicative.pure(Effect_Aff.applicativeAff))(body);
    });
  });
  exports["awaitLoad"] = awaitLoad;
  exports["awaitBody"] = awaitBody;
  exports["runHalogenAff"] = runHalogenAff;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Halogen.HTML.Elements"] = $PS["Halogen.HTML.Elements"] || {};
  var exports = $PS["Halogen.HTML.Elements"];
  var Control_Applicative = $PS["Control.Applicative"];
  var Data_Maybe = $PS["Data.Maybe"];
  var Halogen_HTML_Core = $PS["Halogen.HTML.Core"];

  var elementNS = function () {
    var $14 = Control_Applicative.pure(Data_Maybe.applicativeMaybe);
    return function ($15) {
      return Halogen_HTML_Core.element($14($15));
    };
  }();

  var element = Halogen_HTML_Core.element(Data_Maybe.Nothing.value);
  var h1 = element("h1");
  var h2 = element("h2");
  var h2_ = h2([]);

  var hr = function hr(props) {
    return element("hr")(props)([]);
  };

  var img = function img(props) {
    return element("img")(props)([]);
  };

  var p = element("p");
  var p_ = p([]);
  var span = element("span");
  var div = element("div");
  var div_ = div([]);
  var a = element("a");
  exports["element"] = element;
  exports["elementNS"] = elementNS;
  exports["a"] = a;
  exports["div"] = div;
  exports["div_"] = div_;
  exports["h1"] = h1;
  exports["h2_"] = h2_;
  exports["hr"] = hr;
  exports["img"] = img;
  exports["p_"] = p_;
  exports["span"] = span;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Web.UIEvent.MouseEvent.EventTypes"] = $PS["Web.UIEvent.MouseEvent.EventTypes"] || {};
  var exports = $PS["Web.UIEvent.MouseEvent.EventTypes"];
  var click = "click";
  exports["click"] = click;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Halogen.HTML.Events"] = $PS["Halogen.HTML.Events"] || {};
  var exports = $PS["Halogen.HTML.Events"];
  var Data_Maybe = $PS["Data.Maybe"];
  var Halogen_HTML_Core = $PS["Halogen.HTML.Core"];
  var Halogen_Query_Input = $PS["Halogen.Query.Input"];
  var Unsafe_Coerce = $PS["Unsafe.Coerce"];
  var Web_UIEvent_MouseEvent_EventTypes = $PS["Web.UIEvent.MouseEvent.EventTypes"];
  var mouseHandler = Unsafe_Coerce.unsafeCoerce;

  var handler = function handler(et) {
    return function (f) {
      return Halogen_HTML_Core.handler(et)(function (ev) {
        return new Data_Maybe.Just(new Halogen_Query_Input.Action(f(ev)));
      });
    };
  };

  var onClick = function () {
    var $1 = handler(Web_UIEvent_MouseEvent_EventTypes.click);
    return function ($2) {
      return $1(mouseHandler($2));
    };
  }();

  exports["onClick"] = onClick;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Halogen.HTML.Properties"] = $PS["Halogen.HTML.Properties"] || {};
  var exports = $PS["Halogen.HTML.Properties"];
  var Data_Maybe = $PS["Data.Maybe"];
  var Data_Newtype = $PS["Data.Newtype"];
  var Halogen_HTML_Core = $PS["Halogen.HTML.Core"];

  var prop = function prop(dictIsProp) {
    return Halogen_HTML_Core.prop(dictIsProp);
  };

  var src = prop(Halogen_HTML_Core.isPropString)("src");
  var target = prop(Halogen_HTML_Core.isPropString)("target");
  var value = prop(Halogen_HTML_Core.isPropString)("value");
  var href = prop(Halogen_HTML_Core.isPropString)("href");

  var class_ = function () {
    var $16 = prop(Halogen_HTML_Core.isPropString)("className");
    var $17 = Data_Newtype.unwrap();
    return function ($18) {
      return $16($17($18));
    };
  }();

  var attr = Halogen_HTML_Core.attr(Data_Maybe.Nothing.value);
  exports["attr"] = attr;
  exports["class_"] = class_;
  exports["href"] = href;
  exports["src"] = src;
  exports["target"] = target;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Halogen.Query"] = $PS["Halogen.Query"] || {};
  var exports = $PS["Halogen.Query"];
  var Data_Unit = $PS["Data.Unit"];

  var mkTell = function mkTell(act) {
    return act(Data_Unit.unit);
  };

  exports["mkTell"] = mkTell;
})(PS);

(function (exports) {
  "use strict";

  var getEffProp = function getEffProp(name) {
    return function (node) {
      return function () {
        return node[name];
      };
    };
  };

  exports._parentNode = getEffProp("parentNode");
  exports._nextSibling = getEffProp("nextSibling");

  exports.setNodeValue = function (value) {
    return function (node) {
      return function () {
        node.nodeValue = value;
      };
    };
  };

  exports.insertBefore = function (node1) {
    return function (node2) {
      return function (parent) {
        return function () {
          parent.insertBefore(node1, node2);
        };
      };
    };
  };

  exports.appendChild = function (node) {
    return function (parent) {
      return function () {
        parent.appendChild(node);
      };
    };
  };

  exports.removeChild = function (node) {
    return function (parent) {
      return function () {
        parent.removeChild(node);
      };
    };
  };
})(PS["Web.DOM.Node"] = PS["Web.DOM.Node"] || {});

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Web.DOM.Node"] = $PS["Web.DOM.Node"] || {};
  var exports = $PS["Web.DOM.Node"];
  var $foreign = $PS["Web.DOM.Node"];
  var Data_Functor = $PS["Data.Functor"];
  var Data_Nullable = $PS["Data.Nullable"];
  var Effect = $PS["Effect"];

  var parentNode = function () {
    var $3 = Data_Functor.map(Effect.functorEffect)(Data_Nullable.toMaybe);
    return function ($4) {
      return $3($foreign["_parentNode"]($4));
    };
  }();

  var nextSibling = function () {
    var $14 = Data_Functor.map(Effect.functorEffect)(Data_Nullable.toMaybe);
    return function ($15) {
      return $14($foreign["_nextSibling"]($15));
    };
  }();

  exports["parentNode"] = parentNode;
  exports["nextSibling"] = nextSibling;
  exports["setNodeValue"] = $foreign.setNodeValue;
  exports["insertBefore"] = $foreign.insertBefore;
  exports["appendChild"] = $foreign.appendChild;
  exports["removeChild"] = $foreign.removeChild;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Halogen.VDom.Driver"] = $PS["Halogen.VDom.Driver"] || {};
  var exports = $PS["Halogen.VDom.Driver"];
  var Control_Applicative = $PS["Control.Applicative"];
  var Control_Bind = $PS["Control.Bind"];
  var Control_Category = $PS["Control.Category"];
  var Data_Foldable = $PS["Data.Foldable"];
  var Data_Functor = $PS["Data.Functor"];
  var Data_HeytingAlgebra = $PS["Data.HeytingAlgebra"];
  var Data_Maybe = $PS["Data.Maybe"];
  var Data_Newtype = $PS["Data.Newtype"];
  var Data_Unit = $PS["Data.Unit"];
  var Effect = $PS["Effect"];
  var Effect_Aff = $PS["Effect.Aff"];
  var Effect_Class = $PS["Effect.Class"];
  var Effect_Ref = $PS["Effect.Ref"];
  var Halogen_Aff_Driver = $PS["Halogen.Aff.Driver"];
  var Halogen_Aff_Driver_State = $PS["Halogen.Aff.Driver.State"];
  var Halogen_Component = $PS["Halogen.Component"];
  var Halogen_VDom_DOM = $PS["Halogen.VDom.DOM"];
  var Halogen_VDom_DOM_Prop = $PS["Halogen.VDom.DOM.Prop"];
  var Halogen_VDom_Machine = $PS["Halogen.VDom.Machine"];
  var Halogen_VDom_Thunk = $PS["Halogen.VDom.Thunk"];
  var Unsafe_Reference = $PS["Unsafe.Reference"];
  var Web_DOM_Node = $PS["Web.DOM.Node"];
  var Web_HTML = $PS["Web.HTML"];
  var Web_HTML_HTMLDocument = $PS["Web.HTML.HTMLDocument"];
  var Web_HTML_HTMLElement = $PS["Web.HTML.HTMLElement"];
  var Web_HTML_Window = $PS["Web.HTML.Window"];

  var substInParent = function substInParent(v) {
    return function (v1) {
      return function (v2) {
        if (v1 instanceof Data_Maybe.Just && v2 instanceof Data_Maybe.Just) {
          return Data_Functor["void"](Effect.functorEffect)(Web_DOM_Node.insertBefore(v)(v1.value0)(v2.value0));
        }

        ;

        if (v1 instanceof Data_Maybe.Nothing && v2 instanceof Data_Maybe.Just) {
          return Data_Functor["void"](Effect.functorEffect)(Web_DOM_Node.appendChild(v)(v2.value0));
        }

        ;
        return Control_Applicative.pure(Effect.applicativeEffect)(Data_Unit.unit);
      };
    };
  };

  var removeChild = function removeChild(v) {
    return function __do() {
      var npn = Web_DOM_Node.parentNode(v.node)();
      return Data_Foldable.traverse_(Effect.applicativeEffect)(Data_Foldable.foldableMaybe)(function (pn) {
        return Web_DOM_Node.removeChild(v.node)(pn);
      })(npn)();
    };
  };

  var mkSpec = function mkSpec(handler) {
    return function (renderChildRef) {
      return function (document) {
        var getNode = Halogen_Aff_Driver_State.unRenderStateX(function (v) {
          return v.node;
        });

        var done = function done(st) {
          if (st instanceof Data_Maybe.Just) {
            return Halogen_VDom_Machine.halt(st.value0);
          }

          ;
          return Data_Unit.unit;
        };

        var buildWidget = function buildWidget(spec) {
          var buildThunk = Halogen_VDom_Thunk.buildThunk(Data_Newtype.unwrap())(spec);

          var renderComponentSlot = function renderComponentSlot(cs) {
            var renderChild = Effect_Ref.read(renderChildRef)();
            var rsx = renderChild(cs)();
            var node = getNode(rsx);
            return Halogen_VDom_Machine.mkStep(new Halogen_VDom_Machine.Step(node, Data_Maybe.Nothing.value, patch, done));
          };

          var render = function render(slot) {
            if (slot instanceof Halogen_Component.ComponentSlot) {
              return renderComponentSlot(slot.value0);
            }

            ;

            if (slot instanceof Halogen_Component.ThunkSlot) {
              var step = buildThunk(slot.value0);
              return Halogen_VDom_Machine.mkStep(new Halogen_VDom_Machine.Step(Halogen_VDom_Machine.extract(step), new Data_Maybe.Just(step), patch, done));
            }

            ;
            throw new Error("Failed pattern match at Halogen.VDom.Driver (line 85, column 7 - line 90, column 75): " + [slot.constructor.name]);
          };

          var patch = function patch(st, slot) {
            if (st instanceof Data_Maybe.Just) {
              if (slot instanceof Halogen_Component.ComponentSlot) {
                Halogen_VDom_Machine.halt(st.value0);
                return renderComponentSlot(slot.value0);
              }

              ;

              if (slot instanceof Halogen_Component.ThunkSlot) {
                var step$prime = Halogen_VDom_Machine.step(st.value0, slot.value0);
                return Halogen_VDom_Machine.mkStep(new Halogen_VDom_Machine.Step(Halogen_VDom_Machine.extract(step$prime), new Data_Maybe.Just(step$prime), patch, done));
              }

              ;
              throw new Error("Failed pattern match at Halogen.VDom.Driver (line 98, column 22 - line 104, column 79): " + [slot.constructor.name]);
            }

            ;
            return render(slot);
          };

          return render;
        };

        var buildAttributes = Halogen_VDom_DOM_Prop.buildProp(handler);
        return {
          buildWidget: buildWidget,
          buildAttributes: buildAttributes,
          document: document
        };
      };
    };
  };

  var renderSpec = function renderSpec(document) {
    return function (container) {
      var render = function render(handler) {
        return function (child) {
          return function (v) {
            return function (v1) {
              if (v1 instanceof Data_Maybe.Nothing) {
                return function __do() {
                  var renderChildRef = Effect_Ref["new"](child)();
                  var spec = mkSpec(handler)(renderChildRef)(document);
                  var machine = Halogen_VDom_DOM.buildVDom(spec)(v);
                  var node = Halogen_VDom_Machine.extract(machine);
                  Data_Functor["void"](Effect.functorEffect)(Web_DOM_Node.appendChild(node)(Web_HTML_HTMLElement.toNode(container)))();
                  return {
                    machine: machine,
                    node: node,
                    renderChildRef: renderChildRef
                  };
                };
              }

              ;

              if (v1 instanceof Data_Maybe.Just) {
                return function __do() {
                  Effect_Ref.write(child)(v1.value0.renderChildRef)();
                  var parent = Web_DOM_Node.parentNode(v1.value0.node)();
                  var nextSib = Web_DOM_Node.nextSibling(v1.value0.node)();
                  var machine$prime = Halogen_VDom_Machine.step(v1.value0.machine, v);
                  var newNode = Halogen_VDom_Machine.extract(machine$prime);
                  Control_Applicative.when(Effect.applicativeEffect)(Data_HeytingAlgebra.not(Data_HeytingAlgebra.heytingAlgebraFunction(Data_HeytingAlgebra.heytingAlgebraFunction(Data_HeytingAlgebra.heytingAlgebraBoolean)))(Unsafe_Reference.unsafeRefEq)(v1.value0.node)(newNode))(substInParent(newNode)(nextSib)(parent))();
                  return {
                    machine: machine$prime,
                    node: newNode,
                    renderChildRef: v1.value0.renderChildRef
                  };
                };
              }

              ;
              throw new Error("Failed pattern match at Halogen.VDom.Driver (line 159, column 5 - line 175, column 80): " + [v1.constructor.name]);
            };
          };
        };
      };

      return {
        render: render,
        renderChild: Control_Category.identity(Control_Category.categoryFn),
        removeChild: removeChild,
        dispose: removeChild
      };
    };
  };

  var runUI = function runUI(component) {
    return function (i) {
      return function (element) {
        return Control_Bind.bind(Effect_Aff.bindAff)(Effect_Class.liftEffect(Effect_Aff.monadEffectAff)(Data_Functor.map(Effect.functorEffect)(Web_HTML_HTMLDocument.toDocument)(Control_Bind.bindFlipped(Effect.bindEffect)(Web_HTML_Window.document)(Web_HTML.window))))(function (document) {
          return Halogen_Aff_Driver.runUI(renderSpec(document)(element))(component)(i);
        });
      };
    };
  };

  exports["runUI"] = runUI;
})(PS);

(function (exports) {
  function getAttributes(node) {
    var entries = [];

    for (var i = 0; i < node.attributes.length; i++) {
      var _node$attributes$item = node.attributes.item(i),
          name = _node$attributes$item.name,
          value = _node$attributes$item.value;

      entries.push([name, value]);
    }

    return entries;
  }

  function walk(treeWalker) {
    var nodes = [];

    function handleNode(node) {
      if (["#comment", "#text"].includes(node.nodeName)) {
        var text = node.textContent;

        if (text) {
          nodes.push({
            type: node.nodeName.slice(1),
            text: text
          });
        }
      } else {
        var children = walk(treeWalker);
        treeWalker.currentNode = node;
        nodes.push({
          type: "element",
          name: node.localName,
          attributes: getAttributes(node),
          children: children
        });
      }
    }

    var currentNode = treeWalker.currentNode;
    var firstChild = treeWalker.firstChild();

    if (firstChild) {
      handleNode(firstChild);
    } else {
      return nodes;
    }

    var nextSibling = treeWalker.nextSibling();

    while (nextSibling) {
      handleNode(nextSibling);
      treeWalker.currentNode = nextSibling;
      nextSibling = treeWalker.nextSibling();
    }

    return nodes;
  }

  exports.parseFromString = function (elementCtor) {
    return function (attributeCtor) {
      return function (textCtor) {
        return function (commentCtor) {
          return function (input) {
            function mapNode(node) {
              if (node.type == "element") {
                return elementCtor({
                  name: node.name,
                  attributes: node.attributes.map(function (_ref) {
                    var _ref2 = _slicedToArray(_ref, 2),
                        k = _ref2[0],
                        v = _ref2[1];

                    return attributeCtor(k)(v);
                  }),
                  children: node.children.map(mapNode)
                });
              } else {
                var ctor = node.type == "text" ? textCtor : commentCtor;
                return ctor(node.text);
              }
            }

            var doc = new DOMParser().parseFromString(input, "text/html");
            var headNodes = walk(doc.createTreeWalker(doc.documentElement.querySelector("head")));
            var bodyNodes = walk(doc.createTreeWalker(doc.documentElement.querySelector("body")));
            return [].concat(_toConsumableArray(headNodes), _toConsumableArray(bodyNodes)).map(function (node) {
              if (node.type == "element") {
                return mapNode(node);
              } else {
                var ctor = node.type == "text" ? textCtor : commentCtor;
                return ctor(node.text);
              }
            });
          };
        };
      };
    };
  };
})(PS["Html.Parser"] = PS["Html.Parser"] || {});

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Html.Parser"] = $PS["Html.Parser"] || {};
  var exports = $PS["Html.Parser"];
  var $foreign = $PS["Html.Parser"];

  var HtmlAttribute = function () {
    function HtmlAttribute(value0, value1) {
      this.value0 = value0;
      this.value1 = value1;
    }

    ;

    HtmlAttribute.create = function (value0) {
      return function (value1) {
        return new HtmlAttribute(value0, value1);
      };
    };

    return HtmlAttribute;
  }();

  var HtmlElement = function () {
    function HtmlElement(value0) {
      this.value0 = value0;
    }

    ;

    HtmlElement.create = function (value0) {
      return new HtmlElement(value0);
    };

    return HtmlElement;
  }();

  var HtmlText = function () {
    function HtmlText(value0) {
      this.value0 = value0;
    }

    ;

    HtmlText.create = function (value0) {
      return new HtmlText(value0);
    };

    return HtmlText;
  }();

  var HtmlComment = function () {
    function HtmlComment(value0) {
      this.value0 = value0;
    }

    ;

    HtmlComment.create = function (value0) {
      return new HtmlComment(value0);
    };

    return HtmlComment;
  }();

  var parse = function parse(input) {
    return $foreign.parseFromString(HtmlElement.create)(HtmlAttribute.create)(HtmlText.create)(HtmlComment.create)(input);
  };

  exports["HtmlElement"] = HtmlElement;
  exports["HtmlText"] = HtmlText;
  exports["HtmlComment"] = HtmlComment;
  exports["parse"] = parse;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Html.Renderer.Halogen"] = $PS["Html.Renderer.Halogen"] || {};
  var exports = $PS["Html.Renderer.Halogen"];
  var Control_Alt = $PS["Control.Alt"];
  var Data_Array = $PS["Data.Array"];
  var Data_Foldable = $PS["Data.Foldable"];
  var Data_Functor = $PS["Data.Functor"];
  var Data_Maybe = $PS["Data.Maybe"];
  var Halogen_HTML_Core = $PS["Halogen.HTML.Core"];
  var Halogen_HTML_Elements = $PS["Halogen.HTML.Elements"];
  var Halogen_HTML_Properties = $PS["Halogen.HTML.Properties"];
  var Html_Parser = $PS["Html.Parser"];

  var htmlAttributeToProp = function htmlAttributeToProp(v) {
    return Halogen_HTML_Properties.attr(v.value0)(v.value1);
  };

  var nodeToHtml = function nodeToHtml(v) {
    return function (v1) {
      if (v1 instanceof Html_Parser.HtmlElement) {
        return elementToHtml(v)(v1.value0);
      }

      ;

      if (v1 instanceof Html_Parser.HtmlText) {
        return Halogen_HTML_Core.text(v1.value0);
      }

      ;

      if (v1 instanceof Html_Parser.HtmlComment) {
        return Halogen_HTML_Core.text("");
      }

      ;
      throw new Error("Failed pattern match at Html.Renderer.Halogen (line 38, column 1 - line 38, column 72): " + [v.constructor.name, v1.constructor.name]);
    };
  };

  var elementToHtml = function elementToHtml(mParentNs) {
    return function (ele) {
      var mCurNs = Data_Functor.mapFlipped(Data_Maybe.functorMaybe)(Data_Array.find(function (v) {
        return v.value0 === "xmlns";
      })(ele.attributes))(function (v) {
        return v.value1;
      });
      var mNs = Control_Alt.alt(Data_Maybe.altMaybe)(mCurNs)(mParentNs);

      var ctor = function () {
        if (mNs instanceof Data_Maybe.Just) {
          return Halogen_HTML_Elements.elementNS(mNs.value0);
        }

        ;

        if (mNs instanceof Data_Maybe.Nothing) {
          return Halogen_HTML_Elements.element;
        }

        ;
        throw new Error("Failed pattern match at Html.Renderer.Halogen (line 34, column 12 - line 36, column 28): " + [mNs.constructor.name]);
      }();

      var children = Data_Functor.mapFlipped(Data_Functor.functorArray)(ele.children)(nodeToHtml(mNs));
      return ctor(ele.name)(Data_Array.fromFoldable(Data_Foldable.foldableArray)(Data_Functor.map(Data_Functor.functorArray)(htmlAttributeToProp)(ele.attributes)))(children);
    };
  };

  var renderToArray = function renderToArray(raw) {
    return Data_Functor.map(Data_Functor.functorArray)(nodeToHtml(Data_Maybe.Nothing.value))(Html_Parser.parse(raw));
  };

  var render = function render(props) {
    var $21 = Halogen_HTML_Elements.div(props);
    return function ($22) {
      return $21(renderToArray($22));
    };
  };

  var render_ = render([]);
  exports["render_"] = render_;
})(PS);

(function (exports) {
  "use strict"; // A helper which transforms the result ofencodeURIComponent to be compliant
  // with RFC3896, as described in the MDN documentation here:
  //
  // https://web.archive.org/web/20201206001047/https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent

  function toRFC3896(input) {
    return input.replace(/[!'()*]/g, function (c) {
      return "%" + c.charCodeAt(0).toString(16);
    });
  }

  exports._encodeURIComponent = function encode(fail, succeed, input) {
    try {
      return succeed(toRFC3896(encodeURIComponent(input)));
    } catch (err) {
      return fail(err);
    }
  };

  function _decodeURIComponent(fail, succeed, input) {
    try {
      return succeed(decodeURIComponent(input));
    } catch (err) {
      return fail(err);
    }
  }

  exports._decodeURIComponent = _decodeURIComponent;
})(PS["JSURI"] = PS["JSURI"] || {});

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["JSURI"] = $PS["JSURI"] || {};
  var exports = $PS["JSURI"];
  var $foreign = $PS["JSURI"];
  var Data_Function = $PS["Data.Function"];
  var Data_Function_Uncurried = $PS["Data.Function.Uncurried"];
  var Data_Maybe = $PS["Data.Maybe"];
  var $$encodeURIComponent = Data_Function_Uncurried.runFn3($foreign["_encodeURIComponent"])(Data_Function["const"](Data_Maybe.Nothing.value))(Data_Maybe.Just.create);
  var $$decodeURIComponent = Data_Function_Uncurried.runFn3($foreign["_decodeURIComponent"])(Data_Function["const"](Data_Maybe.Nothing.value))(Data_Maybe.Just.create);
  exports["encodeURIComponent"] = $$encodeURIComponent;
  exports["decodeURIComponent"] = $$decodeURIComponent;
})(PS);

(function ($PS) {
  "use strict";

  $PS["Types"] = $PS["Types"] || {};
  var exports = $PS["Types"];
  var Data_Eq = $PS["Data.Eq"];
  var Data_Generic_Rep = $PS["Data.Generic.Rep"];
  /**
  * 
  * page hierarchy
  */

  var Main = function () {
    function Main() {}

    ;
    Main.value = new Main();
    return Main;
  }();
  /**
  * 
  * page hierarchy
  */


  var BlogList = function () {
    function BlogList() {}

    ;
    BlogList.value = new BlogList();
    return BlogList;
  }();
  /**
  * 
  * page hierarchy
  */


  var Blog = function () {
    function Blog(value0) {
      this.value0 = value0;
    }

    ;

    Blog.create = function (value0) {
      return new Blog(value0);
    };

    return Blog;
  }();
  /**
  * 
  * Query type. A query has one type parameter that defines queries that can be
  * send to a component. The component can then trigger some action without
  * returning a value (tell-style), or return a value (request-style).
  */


  var Navigate = function () {
    function Navigate(value0, value1) {
      this.value0 = value0;
      this.value1 = value1;
    }

    ;

    Navigate.create = function (value0) {
      return function (value1) {
        return new Navigate(value0, value1);
      };
    };

    return Navigate;
  }();
  /**
  * 
  * an Action is a datatype that describes
  * this could contain e.g. switching language instead of page, or
  * changing the window resolution. Actions are _internal_ to a component and
  * can't be directly triggered from the outside (they can be triggered indirectly
  * thought.
  */


  var SwitchPage = function () {
    function SwitchPage(value0, value1) {
      this.value0 = value0;
      this.value1 = value1;
    }

    ;

    SwitchPage.create = function (value0) {
      return function (value1) {
        return new SwitchPage(value0, value1);
      };
    };

    return SwitchPage;
  }();
  /**
  * 
  * an Action is a datatype that describes
  * this could contain e.g. switching language instead of page, or
  * changing the window resolution. Actions are _internal_ to a component and
  * can't be directly triggered from the outside (they can be triggered indirectly
  * thought.
  */


  var Initialize = function () {
    function Initialize() {}

    ;
    Initialize.value = new Initialize();
    return Initialize;
  }(); // this is required to automatically match these Main, Blog, About with a
  // text route later


  var genericPage = new Data_Generic_Rep.Generic(function (x) {
    if (x instanceof Main) {
      return new Data_Generic_Rep.Inl(Data_Generic_Rep.NoArguments.value);
    }

    ;

    if (x instanceof BlogList) {
      return new Data_Generic_Rep.Inr(new Data_Generic_Rep.Inl(Data_Generic_Rep.NoArguments.value));
    }

    ;

    if (x instanceof Blog) {
      return new Data_Generic_Rep.Inr(new Data_Generic_Rep.Inr(x.value0));
    }

    ;
    throw new Error("Failed pattern match at Types (line 19, column 1 - line 19, column 46): " + [x.constructor.name]);
  }, function (x) {
    if (x instanceof Data_Generic_Rep.Inl) {
      return Main.value;
    }

    ;

    if (x instanceof Data_Generic_Rep.Inr && x.value0 instanceof Data_Generic_Rep.Inl) {
      return BlogList.value;
    }

    ;

    if (x instanceof Data_Generic_Rep.Inr && x.value0 instanceof Data_Generic_Rep.Inr) {
      return new Blog(x.value0.value0);
    }

    ;
    throw new Error("Failed pattern match at Types (line 19, column 1 - line 19, column 46): " + [x.constructor.name]);
  }); // this is required to check whether a new page corresponds to an old one.

  var eqPage = new Data_Eq.Eq(function (x) {
    return function (y) {
      if (x instanceof Main && y instanceof Main) {
        return true;
      }

      ;

      if (x instanceof BlogList && y instanceof BlogList) {
        return true;
      }

      ;

      if (x instanceof Blog && y instanceof Blog) {
        return x.value0 === y.value0;
      }

      ;
      return false;
    };
  });
  exports["Main"] = Main;
  exports["BlogList"] = BlogList;
  exports["Blog"] = Blog;
  exports["SwitchPage"] = SwitchPage;
  exports["Initialize"] = Initialize;
  exports["Navigate"] = Navigate;
  exports["genericPage"] = genericPage;
  exports["eqPage"] = eqPage;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Web.HTML.Common"] = $PS["Web.HTML.Common"] || {};
  var exports = $PS["Web.HTML.Common"];

  var ClassName = function ClassName(x) {
    return x;
  };

  exports["ClassName"] = ClassName;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Web.UIEvent.MouseEvent"] = $PS["Web.UIEvent.MouseEvent"] || {};
  var exports = $PS["Web.UIEvent.MouseEvent"];
  var Unsafe_Coerce = $PS["Unsafe.Coerce"];
  var toEvent = Unsafe_Coerce.unsafeCoerce;
  exports["toEvent"] = toEvent;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Pages"] = $PS["Pages"] || {};
  var exports = $PS["Pages"];
  var Data_Array = $PS["Data.Array"];
  var Data_Eq = $PS["Data.Eq"];
  var Data_EuclideanRing = $PS["Data.EuclideanRing"];
  var Data_Functor = $PS["Data.Functor"];
  var Data_List = $PS["Data.List"];
  var Data_Map_Internal = $PS["Data.Map.Internal"];
  var Data_Maybe = $PS["Data.Maybe"];
  var Data_Semigroup = $PS["Data.Semigroup"];
  var Data_Show = $PS["Data.Show"];
  var Data_Unfoldable = $PS["Data.Unfoldable"];
  var Halogen_HTML_Core = $PS["Halogen.HTML.Core"];
  var Halogen_HTML_Elements = $PS["Halogen.HTML.Elements"];
  var Halogen_HTML_Events = $PS["Halogen.HTML.Events"];
  var Halogen_HTML_Properties = $PS["Halogen.HTML.Properties"];
  var Html_Renderer_Halogen = $PS["Html.Renderer.Halogen"];
  var Types = $PS["Types"];
  var Web_HTML_Common = $PS["Web.HTML.Common"];
  var Web_UIEvent_MouseEvent = $PS["Web.UIEvent.MouseEvent"];

  var cn = function cn($22) {
    return Halogen_HTML_Properties.class_(Web_HTML_Common.ClassName($22));
  };

  var listCard = function listCard(post) {
    var postId = Data_Maybe.fromMaybe("")(post.id);
    var href = Data_Maybe.fromMaybe("/blog/" + postId)(post.external);
    var externalTag = Halogen_HTML_Elements.span([cn("text-red-800 font-bold")])([Halogen_HTML_Core.text("external: ")]);
    return Halogen_HTML_Elements.a(Data_Semigroup.append(Data_Semigroup.semigroupArray)([Halogen_HTML_Properties.href(href), cn("hover:cursor-pointer w-full block p-4 md:p-6 my-3 border-solid border-2 rounded-lg")])(function () {
      if (post.external instanceof Data_Maybe.Nothing) {
        return [Halogen_HTML_Events.onClick(function () {
          var $23 = Types.SwitchPage.create(new Types.Blog(postId));
          return function ($24) {
            return $23(Web_UIEvent_MouseEvent.toEvent($24));
          };
        }())];
      }

      ;

      if (post.external instanceof Data_Maybe.Just) {
        return [Halogen_HTML_Properties.target("_blank")];
      }

      ;
      throw new Error("Failed pattern match at Pages (line 168, column 14 - line 170, column 52): " + [post.external.constructor.name]);
    }()))([Halogen_HTML_Elements.div([cn("block text-lg")])(Data_Semigroup.append(Data_Semigroup.semigroupArray)(function () {
      var $6 = Data_Eq.notEq(Data_Maybe.eqMaybe(Data_Eq.eqString))(post.external)(Data_Maybe.Nothing.value);

      if ($6) {
        return [externalTag];
      }

      ;
      return [];
    }())([Halogen_HTML_Core.text(Data_Maybe.fromMaybe("no title")(post.title))])), Halogen_HTML_Elements.div([cn("block text-sm my-2")])([Halogen_HTML_Core.text(Data_Maybe.fromMaybe("")(post.description))]), Halogen_HTML_Elements.div([cn("block")])([Halogen_HTML_Core.text(Data_Maybe.fromMaybe("no date")(post.date))])]);
  };

  var list = function list(posts) {
    var postCards = Data_Functor.mapFlipped(Data_Functor.functorArray)(Data_Array.reverse(Data_List.toUnfoldable(Data_Unfoldable.unfoldableArray)(Data_Map_Internal.values(posts))))(listCard);
    var images = Data_Functor.map(Data_Functor.functorArray)(function (x) {
      return "path" + (Data_Show.show(Data_Show.showInt)(x) + ".svg");
    })(Data_Array.filter(function (x) {
      return Data_EuclideanRing.mod(Data_EuclideanRing.euclideanRingInt)(x)(2) === 0;
    })(Data_Array.range(1760)(1962)));
    var imageElements = Data_Functor.map(Data_Functor.functorArray)(function (path) {
      return Halogen_HTML_Elements.img([cn("hidden md:inline md:h-12 lg:h-16 mx-6 lg:mx-10"), Halogen_HTML_Properties.src("./images/backgrounds/" + path)]);
    })(images);
    var elements = Data_Array.zipWith(function (a) {
      return function (b) {
        return Halogen_HTML_Elements.div([cn("flex flex-row items-center")])([a, b]);
      };
    })(imageElements)(postCards);
    return Halogen_HTML_Elements.div([cn("bg-white pt-6 flex flex-col")])(elements);
  };

  var navBarButton = function navBarButton(v) {
    return Halogen_HTML_Elements.a([Halogen_HTML_Properties.href(v.href), Halogen_HTML_Events.onClick(function () {
      var $25 = Types.SwitchPage.create(v.page);
      return function ($26) {
        return $25(Web_UIEvent_MouseEvent.toEvent($26));
      };
    }()), cn("block hover:cursor-pointer my-1 ml-1 mr-5 text-3xl md:text-5xl")])([Halogen_HTML_Core.text(v.content)]);
  };

  var navBarButtonGroup = function navBarButtonGroup(v) {
    return Halogen_HTML_Elements.div([cn("font-bold flex flex-row lg:flex-col m-2")])(v.elements);
  };

  var navBarIcon = function navBarIcon(v) {
    return Halogen_HTML_Elements.a([Halogen_HTML_Properties.href(v.link), cn("")])([Halogen_HTML_Elements.img([Halogen_HTML_Properties.src("/images/logos/" + v.path), cn("block w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 m-1")])]);
  };

  var navBarIconGroup = function navBarIconGroup(v) {
    return Halogen_HTML_Elements.div([cn("flex flex-row m-2")])(v.elements);
  };

  var navBar = Halogen_HTML_Elements.div([cn("lg:absolute lg:top-4 flex justify-between flex-row lg:flex-col mb-10 lg:mb-0")])([navBarButtonGroup({
    elements: [navBarButton({
      href: "/",
      content: "About",
      page: Types.Main.value
    }), navBarButton({
      href: "/blog",
      content: "Blog",
      page: Types.BlogList.value
    })]
  }), navBarIconGroup({
    elements: [navBarIcon({
      link: "https://twitter.com/Mattwittus",
      path: "mmesch.png"
    }), navBarIcon({
      link: "https://github.com/mmesch",
      path: "github.png"
    }), navBarIcon({
      link: "https://www.linkedin.com/in/mmesch",
      path: "logo-linkedin.png"
    })]
  })]);

  var layout1 = function layout1(elements) {
    var container = Halogen_HTML_Elements.div([cn("w-full max-w-4xl block mx-auto px-1 md:px-3 py-3")]);
    return Halogen_HTML_Elements.div([cn("block")])([navBar, container(elements)]);
  };

  var mainPage = function mainPage(maybeCV) {
    var experienceCard = function experienceCard(exp) {
      return Halogen_HTML_Elements.div([cn("block border-2 p-2 m-2")])([Halogen_HTML_Core.text(exp.employer + (" (" + (exp.years + (") \u21D2 " + exp.role))))]);
    };

    var educationCard = function educationCard(edu) {
      return Halogen_HTML_Elements.div([cn("block border-2 p-2 m-2")])([Halogen_HTML_Core.text(edu.institution + (" - " + (edu.name + (" " + edu.qualification))))]);
    };

    return layout1(function () {
      if (maybeCV instanceof Data_Maybe.Nothing) {
        return [Halogen_HTML_Core.text("Loading")];
      }

      ;

      if (maybeCV instanceof Data_Maybe.Just) {
        return [Halogen_HTML_Elements.div([cn("markdown mx-4")])([Halogen_HTML_Elements.h2_([Halogen_HTML_Core.text(maybeCV.value0.summary)]), Halogen_HTML_Elements.hr([]), Halogen_HTML_Elements.h2_([Halogen_HTML_Core.text("What I do")]), Halogen_HTML_Elements.p_([Halogen_HTML_Core.text(maybeCV.value0.what)]), Halogen_HTML_Elements.h2_([Halogen_HTML_Core.text("The fields I worked in")]), Halogen_HTML_Elements.p_([Halogen_HTML_Core.text(maybeCV.value0.domains)]), Halogen_HTML_Elements.h2_([Halogen_HTML_Core.text("My tech stack")]), Halogen_HTML_Elements.p_([Halogen_HTML_Core.text(maybeCV.value0.stack)]), Halogen_HTML_Elements.h2_([Halogen_HTML_Core.text("Experience")]), Halogen_HTML_Elements.div_(Data_Functor.map(Data_Functor.functorArray)(experienceCard)(maybeCV.value0.experience)), Halogen_HTML_Elements.h2_([Halogen_HTML_Core.text("Education")]), Halogen_HTML_Elements.div_(Data_Functor.map(Data_Functor.functorArray)(educationCard)(maybeCV.value0.education))])];
      }

      ;
      throw new Error("Failed pattern match at Pages (line 35, column 7 - line 52, column 12): " + [maybeCV.constructor.name]);
    }());
  };

  var blogPage = function blogPage(post) {
    var title = Data_Maybe.fromMaybe("no title")(post.title);
    var rendered = Html_Renderer_Halogen.render_(Data_Maybe.fromMaybe("")(post.compiled));
    var markdown = Data_Maybe.fromMaybe("")(post.content);
    var date = Data_Maybe.fromMaybe("no date")(post.date);
    return layout1([Halogen_HTML_Elements.div([cn("markdown max-w-4xl border-t-2 lg:border-0 border-gray px-3 mx-auto py-16")])([Halogen_HTML_Elements.div([cn("text-gray-800 text-lg")])([Halogen_HTML_Core.text(date)]), Halogen_HTML_Elements.h1([])([Halogen_HTML_Core.text(title)]), function () {
      if (post.description instanceof Data_Maybe.Nothing) {
        return Halogen_HTML_Elements.div([])([]);
      }

      ;

      if (post.description instanceof Data_Maybe.Just) {
        return Halogen_HTML_Elements.div([cn("abstract")])([Halogen_HTML_Core.text(post.description.value0)]);
      }

      ;
      throw new Error("Failed pattern match at Pages (line 77, column 13 - line 79, column 83): " + [post.description.constructor.name]);
    }(), rendered])]);
  };

  var blogList = function blogList(state) {
    return layout1([list(state.posts)]);
  };

  exports["blogList"] = blogList;
  exports["mainPage"] = mainPage;
  exports["blogPage"] = blogPage;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Routing.Duplex.Parser"] = $PS["Routing.Duplex.Parser"] || {};
  var exports = $PS["Routing.Duplex.Parser"];
  var Control_Alt = $PS["Control.Alt"];
  var Control_Applicative = $PS["Control.Applicative"];
  var Control_Apply = $PS["Control.Apply"];
  var Data_Array = $PS["Data.Array"];
  var Data_Array_NonEmpty = $PS["Data.Array.NonEmpty"];
  var Data_Array_NonEmpty_Internal = $PS["Data.Array.NonEmpty.Internal"];
  var Data_Bifunctor = $PS["Data.Bifunctor"];
  var Data_Boolean = $PS["Data.Boolean"];
  var Data_Either = $PS["Data.Either"];
  var Data_Foldable = $PS["Data.Foldable"];
  var Data_Function = $PS["Data.Function"];
  var Data_Functor = $PS["Data.Functor"];
  var Data_Maybe = $PS["Data.Maybe"];
  var Data_Semigroup = $PS["Data.Semigroup"];
  var Data_String_CodeUnits = $PS["Data.String.CodeUnits"];
  var Data_String_Common = $PS["Data.String.Common"];
  var Data_Tuple = $PS["Data.Tuple"];
  var Data_Unit = $PS["Data.Unit"];
  var JSURI = $PS["JSURI"];

  var Expected = function () {
    function Expected(value0, value1) {
      this.value0 = value0;
      this.value1 = value1;
    }

    ;

    Expected.create = function (value0) {
      return function (value1) {
        return new Expected(value0, value1);
      };
    };

    return Expected;
  }();

  var ExpectedEndOfPath = function () {
    function ExpectedEndOfPath(value0) {
      this.value0 = value0;
    }

    ;

    ExpectedEndOfPath.create = function (value0) {
      return new ExpectedEndOfPath(value0);
    };

    return ExpectedEndOfPath;
  }();

  var EndOfPath = function () {
    function EndOfPath() {}

    ;
    EndOfPath.value = new EndOfPath();
    return EndOfPath;
  }();

  var Fail = function () {
    function Fail(value0) {
      this.value0 = value0;
    }

    ;

    Fail.create = function (value0) {
      return new Fail(value0);
    };

    return Fail;
  }();

  var Success = function () {
    function Success(value0, value1) {
      this.value0 = value0;
      this.value1 = value1;
    }

    ;

    Success.create = function (value0) {
      return function (value1) {
        return new Success(value0, value1);
      };
    };

    return Success;
  }();

  var Alt = function () {
    function Alt(value0) {
      this.value0 = value0;
    }

    ;

    Alt.create = function (value0) {
      return new Alt(value0);
    };

    return Alt;
  }();

  var Chomp = function () {
    function Chomp(value0) {
      this.value0 = value0;
    }

    ;

    Chomp.create = function (value0) {
      return new Chomp(value0);
    };

    return Chomp;
  }();

  var Prefix = function () {
    function Prefix(value0, value1) {
      this.value0 = value0;
      this.value1 = value1;
    }

    ;

    Prefix.create = function (value0) {
      return function (value1) {
        return new Prefix(value0, value1);
      };
    };

    return Prefix;
  }();

  var take = new Chomp(function (state) {
    var v = Data_Array.uncons(state.segments);

    if (v instanceof Data_Maybe.Just) {
      return new Success({
        segments: v.value0.tail,
        params: state.params,
        hash: state.hash
      }, v.value0.head);
    }

    ;
    return new Fail(EndOfPath.value);
  });
  var prefix = Prefix.create;

  var parsePath = function () {
    var unsafeDecodeURIComponent = function () {
      var $236 = Data_Maybe.fromJust();
      return function ($237) {
        return $236(JSURI["decodeURIComponent"]($237));
      };
    }();

    var toRouteState = function toRouteState(v) {
      return {
        segments: v.value0.value0,
        params: v.value0.value1,
        hash: v.value1
      };
    };

    var splitNonEmpty = function splitNonEmpty(v) {
      return function (v1) {
        if (v1 === "") {
          return [];
        }

        ;
        return Data_String_Common.split(v)(v1);
      };
    };

    var splitSegments = function () {
      var $238 = splitNonEmpty("/");
      return function ($239) {
        return function (v) {
          if (v.length === 2 && v[0] === "" && v[1] === "") {
            return [""];
          }

          ;
          return Data_Functor.map(Data_Functor.functorArray)(unsafeDecodeURIComponent)(v);
        }($238($239));
      };
    }();

    var splitAt = function splitAt(k) {
      return function (p) {
        return function (str) {
          var v = Data_String_CodeUnits.indexOf(p)(str);

          if (v instanceof Data_Maybe.Just) {
            return new Data_Tuple.Tuple(Data_String_CodeUnits.take(v.value0)(str), Data_String_CodeUnits.drop(v.value0 + Data_String_CodeUnits.length(p) | 0)(str));
          }

          ;

          if (v instanceof Data_Maybe.Nothing) {
            return k(str);
          }

          ;
          throw new Error("Failed pattern match at Routing.Duplex.Parser (line 185, column 5 - line 187, column 23): " + [v.constructor.name]);
        };
      };
    };

    var splitKeyValue = function () {
      var $240 = Data_Bifunctor.bimap(Data_Bifunctor.bifunctorTuple)(unsafeDecodeURIComponent)(unsafeDecodeURIComponent);
      var $241 = splitAt(Data_Function.flip(Data_Tuple.Tuple.create)(""))("=");
      return function ($242) {
        return $240($241($242));
      };
    }();

    var splitParams = function () {
      var $243 = Data_Functor.map(Data_Functor.functorArray)(splitKeyValue);
      var $244 = splitNonEmpty("&");
      return function ($245) {
        return $243($244($245));
      };
    }();

    var splitPath = function () {
      var $246 = Data_Bifunctor.bimap(Data_Bifunctor.bifunctorTuple)(splitSegments)(splitParams);
      var $247 = splitAt(Data_Function.flip(Data_Tuple.Tuple.create)(""))("?");
      return function ($248) {
        return $246($247($248));
      };
    }();

    var $249 = Data_Bifunctor.lmap(Data_Bifunctor.bifunctorTuple)(splitPath);
    var $250 = splitAt(Data_Function.flip(Data_Tuple.Tuple.create)(""))("#");
    return function ($251) {
      return toRouteState($249($250($251)));
    };
  }();

  var hash = new Chomp(function (state) {
    return new Success(state, state.hash);
  });
  var functorRouteResult = new Data_Functor.Functor(function (f) {
    return function (m) {
      if (m instanceof Fail) {
        return new Fail(m.value0);
      }

      ;

      if (m instanceof Success) {
        return new Success(m.value0, f(m.value1));
      }

      ;
      throw new Error("Failed pattern match at Routing.Duplex.Parser (line 53, column 1 - line 53, column 58): " + [m.constructor.name]);
    };
  });
  var functorRouteParser = new Data_Functor.Functor(function (f) {
    return function (m) {
      if (m instanceof Alt) {
        return new Alt(Data_Functor.map(Data_Array_NonEmpty_Internal.functorNonEmptyArray)(Data_Functor.map(functorRouteParser)(f))(m.value0));
      }

      ;

      if (m instanceof Chomp) {
        return new Chomp(Data_Functor.map(Data_Functor.functorFn)(Data_Functor.map(functorRouteResult)(f))(m.value0));
      }

      ;

      if (m instanceof Prefix) {
        return new Prefix(m.value0, Data_Functor.map(functorRouteParser)(f)(m.value1));
      }

      ;
      throw new Error("Failed pattern match at Routing.Duplex.Parser (line 72, column 1 - line 72, column 58): " + [m.constructor.name]);
    };
  });
  var end = new Chomp(function (state) {
    var v = Data_Array.head(state.segments);

    if (v instanceof Data_Maybe.Nothing) {
      return new Success(state, Data_Unit.unit);
    }

    ;

    if (v instanceof Data_Maybe.Just) {
      return new Fail(new ExpectedEndOfPath(v.value0));
    }

    ;
    throw new Error("Failed pattern match at Routing.Duplex.Parser (line 256, column 3 - line 258, column 45): " + [v.constructor.name]);
  });

  var chompPrefix = function chompPrefix(pre) {
    return function (state) {
      var v = Data_Array.head(state.segments);

      if (v instanceof Data_Maybe.Just && pre === v.value0) {
        return new Success({
          segments: Data_Array.drop(1)(state.segments),
          params: state.params,
          hash: state.hash
        }, Data_Unit.unit);
      }

      ;

      if (v instanceof Data_Maybe.Just) {
        return Fail.create(new Expected(pre, v.value0));
      }

      ;
      return Fail.create(EndOfPath.value);
    };
  };

  var runRouteParser = function () {
    var goAlt = function goAlt(v) {
      return function (v1) {
        return function (v2) {
          if (v1 instanceof Fail) {
            return runRouteParser(v)(v2);
          }

          ;
          return v1;
        };
      };
    };

    var go = function go($copy_state) {
      return function ($copy_v) {
        var $tco_var_state = $copy_state;
        var $tco_done = false;
        var $tco_result;

        function $tco_loop(state, v) {
          if (v instanceof Alt) {
            $tco_done = true;
            return Data_Foldable.foldl(Data_Array_NonEmpty_Internal.foldableNonEmptyArray)(goAlt(state))(new Fail(EndOfPath.value))(v.value0);
          }

          ;

          if (v instanceof Chomp) {
            $tco_done = true;
            return v.value0(state);
          }

          ;

          if (v instanceof Prefix) {
            var v1 = chompPrefix(v.value0)(state);

            if (v1 instanceof Fail) {
              $tco_done = true;
              return new Fail(v1.value0);
            }

            ;

            if (v1 instanceof Success) {
              $tco_var_state = v1.value0;
              $copy_v = v.value1;
              return;
            }

            ;
            throw new Error("Failed pattern match at Routing.Duplex.Parser (line 149, column 7 - line 151, column 40): " + [v1.constructor.name]);
          }

          ;
          throw new Error("Failed pattern match at Routing.Duplex.Parser (line 145, column 14 - line 151, column 40): " + [v.constructor.name]);
        }

        ;

        while (!$tco_done) {
          $tco_result = $tco_loop($tco_var_state, $copy_v);
        }

        ;
        return $tco_result;
      };
    };

    return go;
  }();

  var run = function run(p) {
    var $254 = Data_Function.flip(runRouteParser)(p);
    return function ($255) {
      return function (v) {
        if (v instanceof Fail) {
          return new Data_Either.Left(v.value0);
        }

        ;

        if (v instanceof Success) {
          return new Data_Either.Right(v.value1);
        }

        ;
        throw new Error("Failed pattern match at Routing.Duplex.Parser (line 190, column 49 - line 192, column 29): " + [v.constructor.name]);
      }($254(parsePath($255)));
    };
  };

  var applyRouteParser = new Control_Apply.Apply(function () {
    return functorRouteParser;
  }, function (fx) {
    return function (x) {
      return new Chomp(function (state) {
        var v = runRouteParser(state)(fx);

        if (v instanceof Fail) {
          return new Fail(v.value0);
        }

        ;

        if (v instanceof Success) {
          return Data_Functor.map(functorRouteResult)(v.value1)(runRouteParser(v.value0)(x));
        }

        ;
        throw new Error("Failed pattern match at Routing.Duplex.Parser (line 76, column 5 - line 78, column 56): " + [v.constructor.name]);
      });
    };
  });
  var applicativeRouteParser = new Control_Applicative.Applicative(function () {
    return applyRouteParser;
  }, function () {
    var $256 = Data_Function.flip(Success.create);
    return function ($257) {
      return Chomp.create($256($257));
    };
  }());

  var altSnoc = function altSnoc(ls) {
    return function (v) {
      var v1 = function v1(v2) {
        return Data_Array_NonEmpty.snoc(ls)(v);
      };

      if (v instanceof Prefix) {
        var $197 = Data_Array_NonEmpty.last(ls);

        if ($197 instanceof Prefix) {
          var $198 = v.value0 === $197.value0;

          if ($198) {
            return Data_Array_NonEmpty["snoc'"](Data_Array_NonEmpty.init(ls))(new Prefix(v.value0, Control_Alt.alt(altRouteParser)($197.value1)(v.value1)));
          }

          ;
          return v1(true);
        }

        ;
        return v1(true);
      }

      ;
      return v1(true);
    };
  };

  var altRouteParser = new Control_Alt.Alt(function () {
    return functorRouteParser;
  }, function (v) {
    return function (v1) {
      if (v instanceof Alt && v1 instanceof Alt) {
        return new Alt(altAppend(v.value0)(v1.value0));
      }

      ;

      if (v instanceof Alt) {
        return new Alt(altSnoc(v.value0)(v1));
      }

      ;

      if (v1 instanceof Alt) {
        return new Alt(altCons(v)(v1.value0));
      }

      ;

      if (v instanceof Prefix && v1 instanceof Prefix && v.value0 === v1.value0) {
        return new Prefix(v.value0, Control_Alt.alt(altRouteParser)(v.value1)(v1.value1));
      }

      ;
      return new Alt(Data_Array_NonEmpty.cons(v)(Data_Array_NonEmpty.singleton(v1)));
    };
  });

  var altCons = function altCons(v) {
    return function (rs) {
      var v1 = function v1(v2) {
        return Data_Array_NonEmpty.cons(v)(rs);
      };

      if (v instanceof Prefix) {
        var $217 = Data_Array_NonEmpty.head(rs);

        if ($217 instanceof Prefix) {
          var $218 = v.value0 === $217.value0;

          if ($218) {
            return Data_Array_NonEmpty["cons'"](new Prefix(v.value0, Control_Alt.alt(altRouteParser)(v.value1)($217.value1)))(Data_Array_NonEmpty.tail(rs));
          }

          ;
          return v1(true);
        }

        ;
        return v1(true);
      }

      ;
      return v1(true);
    };
  };

  var altAppend = function altAppend($copy_ls) {
    return function ($copy_rs) {
      var $tco_var_ls = $copy_ls;
      var $tco_done = false;
      var $tco_result;

      function $tco_loop(ls, rs) {
        var v = function v(v1) {
          if (Data_Boolean.otherwise) {
            return Data_Semigroup.append(Data_Array_NonEmpty_Internal.semigroupNonEmptyArray)(ls)(rs);
          }

          ;
          throw new Error("Failed pattern match at Routing.Duplex.Parser (line 98, column 1 - line 101, column 32): " + [ls.constructor.name, rs.constructor.name]);
        };

        var $227 = Data_Array_NonEmpty.last(ls);

        if ($227 instanceof Prefix) {
          var $228 = Data_Array_NonEmpty.head(rs);

          if ($228 instanceof Prefix) {
            var $229 = $227.value0 === $228.value0;

            if ($229) {
              var rs$prime = Data_Array_NonEmpty["cons'"](new Prefix($227.value0, Control_Alt.alt(altRouteParser)($227.value1)($228.value1)))(Data_Array_NonEmpty.tail(rs));
              var v1 = Data_Array_NonEmpty.fromArray(Data_Array_NonEmpty.init(ls));

              if (v1 instanceof Data_Maybe.Just) {
                $tco_var_ls = v1.value0;
                $copy_rs = rs$prime;
                return;
              }

              ;

              if (v1 instanceof Data_Maybe.Nothing) {
                $tco_done = true;
                return rs$prime;
              }

              ;
              throw new Error("Failed pattern match at Routing.Duplex.Parser (line 110, column 9 - line 112, column 26): " + [v1.constructor.name]);
            }

            ;
            $tco_done = true;
            return v(true);
          }

          ;
          $tco_done = true;
          return v(true);
        }

        ;
        $tco_done = true;
        return v(true);
      }

      ;

      while (!$tco_done) {
        $tco_result = $tco_loop($tco_var_ls, $copy_rs);
      }

      ;
      return $tco_result;
    };
  };

  var $$default = function () {
    var $258 = Data_Function.flip(Control_Alt.alt(altRouteParser));
    var $259 = Control_Applicative.pure(applicativeRouteParser);
    return function ($260) {
      return $258($259($260));
    };
  }();

  var optional = function () {
    var $264 = $$default(Data_Maybe.Nothing.value);
    var $265 = Data_Functor.map(functorRouteParser)(Data_Maybe.Just.create);
    return function ($266) {
      return $264($265($266));
    };
  }();

  exports["run"] = run;
  exports["prefix"] = prefix;
  exports["take"] = take;
  exports["optional"] = optional;
  exports["end"] = end;
  exports["functorRouteParser"] = functorRouteParser;
  exports["applyRouteParser"] = applyRouteParser;
  exports["applicativeRouteParser"] = applicativeRouteParser;
  exports["altRouteParser"] = altRouteParser;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Routing.Duplex.Types"] = $PS["Routing.Duplex.Types"] || {};
  var exports = $PS["Routing.Duplex.Types"];
  var emptyRouteState = {
    segments: [],
    params: [],
    hash: ""
  };
  exports["emptyRouteState"] = emptyRouteState;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Routing.Duplex.Printer"] = $PS["Routing.Duplex.Printer"] || {};
  var exports = $PS["Routing.Duplex.Printer"];
  var Control_Category = $PS["Control.Category"];
  var Data_Array = $PS["Data.Array"];
  var Data_Function = $PS["Data.Function"];
  var Data_Functor = $PS["Data.Functor"];
  var Data_Maybe = $PS["Data.Maybe"];
  var Data_Monoid = $PS["Data.Monoid"];
  var Data_Newtype = $PS["Data.Newtype"];
  var Data_Semigroup = $PS["Data.Semigroup"];
  var Data_String_Common = $PS["Data.String.Common"];
  var Data_Tuple = $PS["Data.Tuple"];
  var JSURI = $PS["JSURI"];
  var Routing_Duplex_Types = $PS["Routing.Duplex.Types"];
  var semigroupRoutePrinter = new Data_Semigroup.Semigroup(function (v) {
    return function (v1) {
      return function ($25) {
        return v1(v($25));
      };
    };
  });

  var put = function put(str) {
    return function (state) {
      return {
        segments: Data_Array.snoc(state.segments)(str),
        params: state.params,
        hash: state.hash
      };
    };
  };

  var printPath = function printPath(v) {
    var unsafeEncodeURIComponent = function () {
      var $26 = Data_Maybe.fromJust();
      return function ($27) {
        return $26(JSURI["encodeURIComponent"]($27));
      };
    }();

    var printSegments = function printSegments(v1) {
      if (v1.length === 1 && v1[0] === "") {
        return "/";
      }

      ;
      return Data_String_Common.joinWith("/")(Data_Functor.map(Data_Functor.functorArray)(unsafeEncodeURIComponent)(v1));
    };

    var printParam = function printParam(key) {
      return function (v1) {
        if (v1 === "") {
          return unsafeEncodeURIComponent(key);
        }

        ;
        return unsafeEncodeURIComponent(key) + ("=" + unsafeEncodeURIComponent(v1));
      };
    };

    var printParams = function printParams(v1) {
      if (v1.length === 0) {
        return "";
      }

      ;
      return "?" + Data_String_Common.joinWith("&")(Data_Functor.map(Data_Functor.functorArray)(Data_Tuple.uncurry(printParam))(v1));
    };

    var printHash = function printHash(v1) {
      if (v1 === "") {
        return "";
      }

      ;
      return "#" + v1;
    };

    return printSegments(v.segments) + (printParams(v.params) + printHash(v.hash));
  };

  var run = function () {
    var $28 = Data_Function.applyFlipped(Routing_Duplex_Types.emptyRouteState);
    var $29 = Data_Newtype.unwrap();
    return function ($30) {
      return printPath($28($29($30)));
    };
  }();

  var monoidRoutePRinter = new Data_Monoid.Monoid(function () {
    return semigroupRoutePrinter;
  }, Control_Category.identity(Control_Category.categoryFn));

  var hash = function hash(h) {
    return function (v) {
      return {
        segments: v.segments,
        params: v.params,
        hash: h
      };
    };
  };

  exports["put"] = put;
  exports["run"] = run;
  exports["semigroupRoutePrinter"] = semigroupRoutePrinter;
  exports["monoidRoutePRinter"] = monoidRoutePRinter;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Routing.Duplex"] = $PS["Routing.Duplex"] || {};
  var exports = $PS["Routing.Duplex"];
  var Control_Applicative = $PS["Control.Applicative"];
  var Control_Apply = $PS["Control.Apply"];
  var Control_Category = $PS["Control.Category"];
  var Data_Foldable = $PS["Data.Foldable"];
  var Data_Function = $PS["Data.Function"];
  var Data_Functor = $PS["Data.Functor"];
  var Data_Monoid = $PS["Data.Monoid"];
  var Data_Profunctor = $PS["Data.Profunctor"];
  var Data_Semigroup = $PS["Data.Semigroup"];
  var Data_String_Common = $PS["Data.String.Common"];
  var Routing_Duplex_Parser = $PS["Routing.Duplex.Parser"];
  var Routing_Duplex_Printer = $PS["Routing.Duplex.Printer"];

  var RouteDuplex = function () {
    function RouteDuplex(value0, value1) {
      this.value0 = value0;
      this.value1 = value1;
    }

    ;

    RouteDuplex.create = function (value0) {
      return function (value1) {
        return new RouteDuplex(value0, value1);
      };
    };

    return RouteDuplex;
  }();

  var string = Control_Category.identity(Control_Category.categoryFn);
  var segment = new RouteDuplex(Routing_Duplex_Printer.put, Routing_Duplex_Parser.take);
  var profunctorRouteDuplex = new Data_Profunctor.Profunctor(function (f) {
    return function (g) {
      return function (v) {
        return new RouteDuplex(function ($100) {
          return v.value0(f($100));
        }, Data_Functor.map(Routing_Duplex_Parser.functorRouteParser)(g)(v.value1));
      };
    };
  });

  var print = function print(v) {
    return function ($101) {
      return Routing_Duplex_Printer.run(v.value0($101));
    };
  };

  var prefix = function prefix(s) {
    return function (v) {
      return new RouteDuplex(function (a) {
        return Data_Semigroup.append(Routing_Duplex_Printer.semigroupRoutePrinter)(Routing_Duplex_Printer.put(s))(v.value0(a));
      }, Routing_Duplex_Parser.prefix(s)(v.value1));
    };
  };

  var path = function () {
    var $102 = Data_Function.flip(Data_Foldable.foldr(Data_Foldable.foldableArray)(prefix));
    var $103 = Data_String_Common.split("/");
    return function ($104) {
      return $102($103($104));
    };
  }();

  var root = path("");

  var parse = function parse(v) {
    return Routing_Duplex_Parser.run(v.value1);
  };

  var optional = function optional(v) {
    return new RouteDuplex(Data_Foldable.foldMap(Data_Foldable.foldableMaybe)(Routing_Duplex_Printer.monoidRoutePRinter)(v.value0), Routing_Duplex_Parser.optional(v.value1));
  };

  var functorRouteDuplex = new Data_Functor.Functor(function (f) {
    return function (m) {
      return new RouteDuplex(m.value0, Data_Functor.map(Routing_Duplex_Parser.functorRouteParser)(f)(m.value1));
    };
  });

  var end = function end(v) {
    return new RouteDuplex(v.value0, Control_Apply.applyFirst(Routing_Duplex_Parser.applyRouteParser)(v.value1)(Routing_Duplex_Parser.end));
  };

  var applyRouteDuplex = new Control_Apply.Apply(function () {
    return functorRouteDuplex;
  }, function (v) {
    return function (v1) {
      return new RouteDuplex(Control_Apply.apply(Control_Apply.applyFn)(Data_Functor.map(Data_Functor.functorFn)(Data_Semigroup.append(Routing_Duplex_Printer.semigroupRoutePrinter))(v.value0))(v1.value0), Control_Apply.apply(Routing_Duplex_Parser.applyRouteParser)(v.value1)(v1.value1));
    };
  });
  var applicativeRouteDuplex = new Control_Applicative.Applicative(function () {
    return applyRouteDuplex;
  }, function () {
    var $106 = RouteDuplex.create(Data_Function["const"](Data_Monoid.mempty(Routing_Duplex_Printer.monoidRoutePRinter)));
    var $107 = Control_Applicative.pure(Routing_Duplex_Parser.applicativeRouteParser);
    return function ($108) {
      return $106($107($108));
    };
  }());
  exports["RouteDuplex"] = RouteDuplex;
  exports["parse"] = parse;
  exports["print"] = print;
  exports["prefix"] = prefix;
  exports["path"] = path;
  exports["root"] = root;
  exports["end"] = end;
  exports["segment"] = segment;
  exports["optional"] = optional;
  exports["string"] = string;
  exports["applicativeRouteDuplex"] = applicativeRouteDuplex;
  exports["profunctorRouteDuplex"] = profunctorRouteDuplex;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Routing.Duplex.Generic"] = $PS["Routing.Duplex.Generic"] || {};
  var exports = $PS["Routing.Duplex.Generic"];
  var Control_Alt = $PS["Control.Alt"];
  var Control_Applicative = $PS["Control.Applicative"];
  var Control_Category = $PS["Control.Category"];
  var Data_Functor = $PS["Data.Functor"];
  var Data_Generic_Rep = $PS["Data.Generic.Rep"];
  var Data_Profunctor = $PS["Data.Profunctor"];
  var Data_Symbol = $PS["Data.Symbol"];
  var Record = $PS["Record"];
  var Routing_Duplex = $PS["Routing.Duplex"];
  var Routing_Duplex_Parser = $PS["Routing.Duplex.Parser"];

  var GRouteDuplexCtr = function GRouteDuplexCtr(gRouteDuplexCtr) {
    this.gRouteDuplexCtr = gRouteDuplexCtr;
  };

  var GRouteDuplex = function GRouteDuplex(gRouteDuplex) {
    this.gRouteDuplex = gRouteDuplex;
  };

  var noArgs = Control_Applicative.pure(Routing_Duplex.applicativeRouteDuplex)(Data_Generic_Rep.NoArguments.value);
  var gRouteNoArguments = new GRouteDuplexCtr(Control_Category.identity(Control_Category.categoryFn));

  var gRouteDuplexCtr = function gRouteDuplexCtr(dict) {
    return dict.gRouteDuplexCtr;
  };

  var gRouteDuplex = function gRouteDuplex(dict) {
    return dict.gRouteDuplex;
  };

  var gRouteSum = function gRouteSum(dictGRouteDuplex) {
    return function (dictGRouteDuplex1) {
      return new GRouteDuplex(function (r) {
        var v = gRouteDuplex(dictGRouteDuplex)(r);
        var v1 = gRouteDuplex(dictGRouteDuplex1)(r);

        var enc = function enc(v2) {
          if (v2 instanceof Data_Generic_Rep.Inl) {
            return v.value0(v2.value0);
          }

          ;

          if (v2 instanceof Data_Generic_Rep.Inr) {
            return v1.value0(v2.value0);
          }

          ;
          throw new Error("Failed pattern match at Routing.Duplex.Generic (line 32, column 11 - line 34, column 22): " + [v2.constructor.name]);
        };

        var dec = Control_Alt.alt(Routing_Duplex_Parser.altRouteParser)(Data_Functor.map(Routing_Duplex_Parser.functorRouteParser)(Data_Generic_Rep.Inl.create)(v.value1))(Data_Functor.map(Routing_Duplex_Parser.functorRouteParser)(Data_Generic_Rep.Inr.create)(v1.value1));
        return new Routing_Duplex.RouteDuplex(enc, dec);
      });
    };
  };

  var sum = function sum(dictGeneric) {
    return function (dictGRouteDuplex) {
      var $48 = Data_Profunctor.dimap(Routing_Duplex.profunctorRouteDuplex)(Data_Generic_Rep.from(dictGeneric))(Data_Generic_Rep.to(dictGeneric));
      var $49 = gRouteDuplex(dictGRouteDuplex);
      return function ($50) {
        return $48($49($50));
      };
    };
  };

  var gRouteConstructor = function gRouteConstructor(dictIsSymbol) {
    return function (dictCons) {
      return function (dictGRouteDuplexCtr) {
        return new GRouteDuplex(function (r) {
          var v = Routing_Duplex.end(gRouteDuplexCtr(dictGRouteDuplexCtr)(Record.get(dictIsSymbol)()(Data_Symbol.SProxy.value)(r)));

          var enc = function enc(v1) {
            return v.value0(v1);
          };

          var dec = Data_Functor.map(Routing_Duplex_Parser.functorRouteParser)(Data_Generic_Rep.Constructor)(v.value1);
          return new Routing_Duplex.RouteDuplex(enc, dec);
        });
      };
    };
  };

  var gRouteAll = new GRouteDuplexCtr(function (v) {
    return new Routing_Duplex.RouteDuplex(function (v1) {
      return v.value0(v1);
    }, Data_Functor.map(Routing_Duplex_Parser.functorRouteParser)(Data_Generic_Rep.Argument)(v.value1));
  });
  exports["gRouteDuplexCtr"] = gRouteDuplexCtr;
  exports["sum"] = sum;
  exports["noArgs"] = noArgs;
  exports["gRouteSum"] = gRouteSum;
  exports["gRouteConstructor"] = gRouteConstructor;
  exports["gRouteNoArguments"] = gRouteNoArguments;
  exports["gRouteAll"] = gRouteAll;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Routing.Duplex.Generic.Syntax"] = $PS["Routing.Duplex.Generic.Syntax"] || {};
  var exports = $PS["Routing.Duplex.Generic.Syntax"];
  var Routing_Duplex = $PS["Routing.Duplex"];
  var Routing_Duplex_Generic = $PS["Routing.Duplex.Generic"];

  var GSep = function GSep(gsep) {
    this.gsep = gsep;
  };

  var gsepStringRoute = function gsepStringRoute(dictGRouteDuplexCtr) {
    return new GSep(function (a) {
      var $5 = Routing_Duplex.prefix(a);
      var $6 = Routing_Duplex_Generic.gRouteDuplexCtr(dictGRouteDuplexCtr);
      return function ($7) {
        return $5($6($7));
      };
    });
  };

  var gsep = function gsep(dict) {
    return dict.gsep;
  };

  exports["gsep"] = gsep;
  exports["gsepStringRoute"] = gsepStringRoute;
})(PS);

(function (exports) {
  "use strict";

  exports.createTextNode = function (data) {
    return function (doc) {
      return function () {
        return doc.createTextNode(data);
      };
    };
  };
})(PS["Web.DOM.Document"] = PS["Web.DOM.Document"] || {});

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Web.DOM.Document"] = $PS["Web.DOM.Document"] || {};
  var exports = $PS["Web.DOM.Document"];
  var $foreign = $PS["Web.DOM.Document"];
  exports["createTextNode"] = $foreign.createTextNode;
})(PS);

(function (exports) {
  "use strict";

  exports.mutationObserver = function (cb) {
    return function () {
      return new MutationObserver(function (mr, mo) {
        return cb(mr)(mo)();
      });
    };
  };

  exports._observe = function (node) {
    return function (config) {
      return function (mo) {
        return function () {
          return mo.observe(node, config);
        };
      };
    };
  };
})(PS["Web.DOM.MutationObserver"] = PS["Web.DOM.MutationObserver"] || {});

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Web.DOM.MutationObserver"] = $PS["Web.DOM.MutationObserver"] || {};
  var exports = $PS["Web.DOM.MutationObserver"];
  var $foreign = $PS["Web.DOM.MutationObserver"];

  var observe = function observe(dictUnion) {
    return $foreign["_observe"];
  };

  exports["observe"] = observe;
  exports["mutationObserver"] = $foreign.mutationObserver;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Web.DOM.Text"] = $PS["Web.DOM.Text"] || {};
  var exports = $PS["Web.DOM.Text"];
  var Unsafe_Coerce = $PS["Unsafe.Coerce"];
  var toNode = Unsafe_Coerce.unsafeCoerce;
  exports["toNode"] = toNode;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Web.HTML.Event.PopStateEvent.EventTypes"] = $PS["Web.HTML.Event.PopStateEvent.EventTypes"] || {};
  var exports = $PS["Web.HTML.Event.PopStateEvent.EventTypes"];
  var popstate = "popstate";
  exports["popstate"] = popstate;
})(PS);

(function (exports) {
  "use strict";

  exports.pushState = function (a) {
    return function (docTitle) {
      return function (url) {
        return function (history) {
          return function () {
            return history.pushState(a, docTitle, url);
          };
        };
      };
    };
  };

  exports.replaceState = function (a) {
    return function (docTitle) {
      return function (url) {
        return function (history) {
          return function () {
            return history.replaceState(a, docTitle, url);
          };
        };
      };
    };
  };

  exports.state = function (history) {
    return function () {
      return history.state;
    };
  };
})(PS["Web.HTML.History"] = PS["Web.HTML.History"] || {});

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Web.HTML.History"] = $PS["Web.HTML.History"] || {};
  var exports = $PS["Web.HTML.History"];
  var $foreign = $PS["Web.HTML.History"];
  exports["pushState"] = $foreign.pushState;
  exports["replaceState"] = $foreign.replaceState;
  exports["state"] = $foreign.state;
})(PS);

(function (exports) {
  "use strict";

  exports.hash = function (location) {
    return function () {
      return location.hash;
    };
  }; // ----------------------------------------------------------------------------


  exports.pathname = function (location) {
    return function () {
      return location.pathname;
    };
  }; // ----------------------------------------------------------------------------


  exports.search = function (location) {
    return function () {
      return location.search;
    };
  };
})(PS["Web.HTML.Location"] = PS["Web.HTML.Location"] || {});

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Web.HTML.Location"] = $PS["Web.HTML.Location"] || {};
  var exports = $PS["Web.HTML.Location"];
  var $foreign = $PS["Web.HTML.Location"];
  exports["hash"] = $foreign.hash;
  exports["pathname"] = $foreign.pathname;
  exports["search"] = $foreign.search;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Routing.PushState"] = $PS["Routing.PushState"] || {};
  var exports = $PS["Routing.PushState"];
  var Control_Applicative = $PS["Control.Applicative"];
  var Control_Bind = $PS["Control.Bind"];
  var Data_Either = $PS["Data.Either"];
  var Data_Foldable = $PS["Data.Foldable"];
  var Data_Function = $PS["Data.Function"];
  var Data_Functor = $PS["Data.Functor"];
  var Data_Map_Internal = $PS["Data.Map.Internal"];
  var Data_Maybe = $PS["Data.Maybe"];
  var Data_Ord = $PS["Data.Ord"];
  var Data_Semiring = $PS["Data.Semiring"];
  var Data_Show = $PS["Data.Show"];
  var Effect = $PS["Effect"];
  var Effect_Ref = $PS["Effect.Ref"];
  var Web_DOM_Document = $PS["Web.DOM.Document"];
  var Web_DOM_MutationObserver = $PS["Web.DOM.MutationObserver"];
  var Web_DOM_Node = $PS["Web.DOM.Node"];
  var Web_DOM_Text = $PS["Web.DOM.Text"];
  var Web_Event_EventTarget = $PS["Web.Event.EventTarget"];
  var Web_HTML = $PS["Web.HTML"];
  var Web_HTML_Event_PopStateEvent_EventTypes = $PS["Web.HTML.Event.PopStateEvent.EventTypes"];
  var Web_HTML_HTMLDocument = $PS["Web.HTML.HTMLDocument"];
  var Web_HTML_History = $PS["Web.HTML.History"];
  var Web_HTML_Location = $PS["Web.HTML.Location"];
  var Web_HTML_Window = $PS["Web.HTML.Window"];

  var makeImmediate = function makeImmediate(run) {
    return function __do() {
      var document = Control_Bind.bind(Effect.bindEffect)(Web_HTML.window)(function () {
        var $7 = Data_Functor.map(Effect.functorEffect)(Web_HTML_HTMLDocument.toDocument);
        return function ($8) {
          return $7(Web_HTML_Window.document($8));
        };
      }())();
      var nextTick = Effect_Ref["new"](new Data_Either.Right(0))();
      var obsvNode = Data_Functor.map(Effect.functorEffect)(Web_DOM_Text.toNode)(Web_DOM_Document.createTextNode("")(document))();
      var observer = Web_DOM_MutationObserver.mutationObserver(function (v) {
        return function (v1) {
          return function __do() {
            Effect_Ref.modify_(Data_Either.either(function () {
              var $9 = Data_Semiring.add(Data_Semiring.semiringInt)(1);
              return function ($10) {
                return Data_Either.Right.create($9($10));
              };
            }())(Data_Either.Right.create))(nextTick)();
            return run();
          };
        };
      })();
      Web_DOM_MutationObserver.observe()(obsvNode)({
        characterData: true
      })(observer)();
      return Control_Bind.bind(Effect.bindEffect)(Effect_Ref.read(nextTick))(Data_Foldable.traverse_(Effect.applicativeEffect)(Data_Foldable.foldableEither)(function (tick) {
        return function __do() {
          Effect_Ref.write(new Data_Either.Left(tick + 1 | 0))(nextTick)();
          return Web_DOM_Node.setNodeValue(Data_Show.show(Data_Show.showInt)(tick))(obsvNode)();
        };
      }));
    };
  };

  var makeInterface = function __do() {
    var freshRef = Effect_Ref["new"](0)();
    var listenersRef = Effect_Ref["new"](Data_Map_Internal.empty)();

    var notify = function notify(ev) {
      return Control_Bind.bindFlipped(Effect.bindEffect)(Data_Foldable.traverse_(Effect.applicativeEffect)(Data_Map_Internal.foldableMap)(function (v) {
        return v(ev);
      }))(Effect_Ref.read(listenersRef));
    };

    var locationState = function __do() {
      var loc = Control_Bind.bind(Effect.bindEffect)(Web_HTML.window)(Web_HTML_Window.location)();
      var state = Control_Bind.bind(Effect.bindEffect)(Control_Bind.bind(Effect.bindEffect)(Web_HTML.window)(Web_HTML_Window.history))(Web_HTML_History.state)();
      var pathname = Web_HTML_Location.pathname(loc)();
      var search = Web_HTML_Location.search(loc)();
      var hash = Web_HTML_Location.hash(loc)();
      var path = pathname + (search + hash);
      return {
        state: state,
        pathname: pathname,
        search: search,
        hash: hash,
        path: path
      };
    };

    var listen = function listen(k) {
      return function __do() {
        var fresh = Effect_Ref.read(freshRef)();
        Effect_Ref.write(fresh + 1 | 0)(freshRef)();
        Effect_Ref.modify_(Data_Map_Internal.insert(Data_Ord.ordInt)(fresh)(k))(listenersRef)();
        return Effect_Ref.modify_(Data_Map_Internal["delete"](Data_Ord.ordInt)(fresh))(listenersRef);
      };
    };

    var schedule = makeImmediate(Control_Bind.bindFlipped(Effect.bindEffect)(notify)(locationState))();

    var stateFn = function stateFn(op) {
      return function (state) {
        return function (path) {
          return function __do() {
            Control_Bind.bind(Effect.bindEffect)(Control_Bind.bind(Effect.bindEffect)(Web_HTML.window)(Web_HTML_Window.history))(op(state)("")(path))();
            return schedule();
          };
        };
      };
    };

    var listener = Web_Event_EventTarget.eventListener(function (v) {
      return Control_Bind.bindFlipped(Effect.bindEffect)(notify)(locationState);
    })();
    Control_Bind.bind(Effect.bindEffect)(Web_HTML.window)(function () {
      var $11 = Web_Event_EventTarget.addEventListener(Web_HTML_Event_PopStateEvent_EventTypes.popstate)(listener)(false);
      return function ($12) {
        return $11(Web_HTML_Window.toEventTarget($12));
      };
    }())();
    return {
      pushState: stateFn(Web_HTML_History.pushState),
      replaceState: stateFn(Web_HTML_History.replaceState),
      locationState: locationState,
      listen: listen
    };
  };

  var foldLocations = function foldLocations(cb) {
    return function (init) {
      return function (psi) {
        return function __do() {
          var ref = Control_Bind.bindFlipped(Effect.bindEffect)(Effect_Ref["new"])(Control_Bind.bindFlipped(Effect.bindEffect)(init)(psi.locationState))();
          return psi.listen(function (loc) {
            return Control_Bind.bindFlipped(Effect.bindEffect)(Data_Function.flip(Effect_Ref.write)(ref))(Control_Bind.bindFlipped(Effect.bindEffect)(Data_Function.flip(cb)(loc))(Effect_Ref.read(ref)));
          })();
        };
      };
    };
  };

  var foldPaths = function foldPaths(cb) {
    return function (init) {
      return foldLocations(function (a) {
        var $13 = cb(a);
        return function ($14) {
          return $13(function (v) {
            return v.path;
          }($14));
        };
      })(function ($15) {
        return init(function (v) {
          return v.path;
        }($15));
      });
    };
  };

  var matchesWith = function matchesWith(dictFoldable) {
    return function (parser) {
      return function (cb) {
        var go = function go(a) {
          var $16 = Data_Maybe.maybe(Control_Applicative.pure(Effect.applicativeEffect)(a))(function (b) {
            return Data_Functor.voidRight(Effect.functorEffect)(new Data_Maybe.Just(b))(cb(a)(b));
          });
          var $17 = Data_Foldable.indexl(dictFoldable)(0);
          return function ($18) {
            return $16($17(parser($18)));
          };
        };

        return foldPaths(go)(go(Data_Maybe.Nothing.value));
      };
    };
  };

  exports["makeInterface"] = makeInterface;
  exports["matchesWith"] = matchesWith;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Routes"] = $PS["Routes"] || {};
  var exports = $PS["Routes"];
  var Control_Applicative = $PS["Control.Applicative"];
  var Control_Bind = $PS["Control.Bind"];
  var Data_Either = $PS["Data.Either"];
  var Data_Eq = $PS["Data.Eq"];
  var Data_Foldable = $PS["Data.Foldable"];
  var Data_Maybe = $PS["Data.Maybe"];
  var Data_Symbol = $PS["Data.Symbol"];
  var Effect = $PS["Effect"];
  var Effect_Aff = $PS["Effect.Aff"];
  var Effect_Class = $PS["Effect.Class"];
  var Foreign = $PS["Foreign"];
  var Halogen_Query = $PS["Halogen.Query"];
  var Routing_Duplex = $PS["Routing.Duplex"];
  var Routing_Duplex_Generic = $PS["Routing.Duplex.Generic"];
  var Routing_Duplex_Generic_Syntax = $PS["Routing.Duplex.Generic.Syntax"];
  var Routing_PushState = $PS["Routing.PushState"];
  var Types = $PS["Types"];
  var pageCodec = Routing_Duplex_Generic.sum(Types.genericPage)(Routing_Duplex_Generic.gRouteSum(Routing_Duplex_Generic.gRouteConstructor(new Data_Symbol.IsSymbol(function () {
    return "Main";
  }))()(Routing_Duplex_Generic.gRouteNoArguments))(Routing_Duplex_Generic.gRouteSum(Routing_Duplex_Generic.gRouteConstructor(new Data_Symbol.IsSymbol(function () {
    return "BlogList";
  }))()(Routing_Duplex_Generic.gRouteNoArguments))(Routing_Duplex_Generic.gRouteConstructor(new Data_Symbol.IsSymbol(function () {
    return "Blog";
  }))()(Routing_Duplex_Generic.gRouteAll))))({
    Main: Routing_Duplex_Generic.noArgs,
    BlogList: Routing_Duplex_Generic_Syntax.gsep(Routing_Duplex_Generic_Syntax.gsepStringRoute(Routing_Duplex_Generic.gRouteNoArguments))("blog")(Routing_Duplex_Generic.noArgs),
    Blog: Routing_Duplex.path("blog")(Routing_Duplex.string(Routing_Duplex.segment))
  });
  var routeCodec = Routing_Duplex.root(Routing_Duplex.optional(pageCodec));

  var setUrl = function setUrl(dictMonadEffect) {
    return function (nav) {
      var $7 = Effect_Class.liftEffect(dictMonadEffect);
      var $8 = nav.pushState(Foreign.unsafeToForeign({}));
      var $9 = Routing_Duplex.print(routeCodec);
      return function ($10) {
        return $7($8($9($10)));
      };
    };
  };

  var validateUrl = function validateUrl(dictMonadEffect) {
    return function (nav) {
      return Control_Bind.bind(dictMonadEffect.Monad0().Bind1())(Effect_Class.liftEffect(dictMonadEffect)(nav.locationState))(function (v) {
        var initialRoute = Data_Either.hush(Routing_Duplex.parse(routeCodec)(v.path));
        return setUrl(dictMonadEffect)(nav)(Data_Maybe.fromMaybe(new Data_Maybe.Just(Types.Main.value))(initialRoute));
      });
    };
  };

  var listenForUrlChanges = function listenForUrlChanges(nav) {
    return function (halogenIO) {
      return Routing_PushState.matchesWith(Data_Foldable.foldableEither)(Routing_Duplex.parse(routeCodec))(function (old) {
        return function ($$new) {
          return Control_Applicative.when(Effect.applicativeEffect)(Data_Eq.notEq(Data_Maybe.eqMaybe(Data_Maybe.eqMaybe(Types.eqPage)))(old)(new Data_Maybe.Just($$new)))(Effect_Aff.launchAff_(halogenIO.query(Halogen_Query.mkTell(Types.Navigate.create($$new)))));
        };
      })(nav);
    };
  };

  exports["routeCodec"] = routeCodec;
  exports["validateUrl"] = validateUrl;
  exports["listenForUrlChanges"] = listenForUrlChanges;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Type.Equality"] = $PS["Type.Equality"] || {};
  var exports = $PS["Type.Equality"];

  var TypeEquals = function TypeEquals(Coercible0, proof) {
    this.Coercible0 = Coercible0;
    this.proof = proof;
  };

  var refl = new TypeEquals(function () {
    return undefined;
  }, function (a) {
    return a;
  });

  var proof = function proof(dict) {
    return dict.proof;
  };

  var from = function from(dictTypeEquals) {
    var v = proof(dictTypeEquals)(function (a) {
      return a;
    });
    return v;
  };

  exports["from"] = from;
  exports["refl"] = refl;
})(PS);

(function (exports) {
  exports._fetch = function (fetchImpl) {
    return function (url) {
      return function (options) {
        return function () {
          return fetchImpl(url, options).catch(function (e) {
            // we have to wrap node-fetch's non-Error error :(
            throw new Error(e);
          });
        };
      };
    };
  };

  exports.textImpl = function (response) {
    return function () {
      return response.text();
    };
  };
})(PS["Milkis"] = PS["Milkis"] || {});

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Milkis"] = $PS["Milkis"] || {};
  var exports = $PS["Milkis"];
  var $foreign = $PS["Milkis"];
  var Control_Promise = $PS["Control.Promise"];

  var text = function text(res) {
    return Control_Promise.toAffE($foreign.textImpl(res));
  };

  var getMethod = "GET";

  var fetch = function fetch(impl) {
    return function (dictUnion) {
      return function (url$prime) {
        return function (opts) {
          return Control_Promise.toAffE($foreign["_fetch"](impl)(url$prime)(opts));
        };
      };
    };
  };

  var defaultFetchOptions = {
    method: getMethod
  };
  exports["defaultFetchOptions"] = defaultFetchOptions;
  exports["fetch"] = fetch;
  exports["text"] = text;
})(PS);

(function (exports) {
  exports.windowFetch = window.fetch;
})(PS["Milkis.Impl.Window"] = PS["Milkis.Impl.Window"] || {});

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Milkis.Impl.Window"] = $PS["Milkis.Impl.Window"] || {};
  var exports = $PS["Milkis.Impl.Window"];
  var $foreign = $PS["Milkis.Impl.Window"];
  exports["windowFetch"] = $foreign.windowFetch;
})(PS);

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Util"] = $PS["Util"] || {};
  var exports = $PS["Util"];
  var Control_Applicative = $PS["Control.Applicative"];
  var Control_Bind = $PS["Control.Bind"];
  var Control_Monad_Except = $PS["Control.Monad.Except"];
  var Control_Monad_Except_Trans = $PS["Control.Monad.Except.Trans"];
  var Data_Argonaut_Decode_Class = $PS["Data.Argonaut.Decode.Class"];
  var Data_Argonaut_Decode_Error = $PS["Data.Argonaut.Decode.Error"];
  var Data_Array = $PS["Data.Array"];
  var Data_Array_NonEmpty = $PS["Data.Array.NonEmpty"];
  var Data_Bifunctor = $PS["Data.Bifunctor"];
  var Data_Either = $PS["Data.Either"];
  var Data_Foldable = $PS["Data.Foldable"];
  var Data_Functor = $PS["Data.Functor"];
  var Data_Identity = $PS["Data.Identity"];
  var Data_List_Types = $PS["Data.List.Types"];
  var Data_Maybe = $PS["Data.Maybe"];
  var Data_Monoid = $PS["Data.Monoid"];
  var Data_Semigroup = $PS["Data.Semigroup"];
  var Data_Show = $PS["Data.Show"];
  var Data_String_Common = $PS["Data.String.Common"];
  var Data_String_Regex = $PS["Data.String.Regex"];
  var Data_String_Regex_Flags = $PS["Data.String.Regex.Flags"];
  var Data_Symbol = $PS["Data.Symbol"];
  var Data_Traversable = $PS["Data.Traversable"];
  var Data_YAML_Foreign_Decode = $PS["Data.YAML.Foreign.Decode"];
  var Effect_Aff = $PS["Effect.Aff"];
  var Effect_Exception = $PS["Effect.Exception"];
  var Foreign = $PS["Foreign"];
  var Milkis = $PS["Milkis"];
  var Milkis_Impl_Window = $PS["Milkis.Impl.Window"];

  var parseYaml = function parseYaml(dictDecodeJson) {
    return function (content) {
      var foreignListError = function foreignListError(x) {
        return Data_Foldable.foldMap(Data_List_Types.foldableNonEmptyList)(Data_Monoid.monoidString)(function (err) {
          return Foreign.renderForeignError(err);
        })(x);
      };

      return Control_Bind.bind(Control_Monad_Except_Trans.bindExceptT(Data_Identity.monadIdentity))(Control_Monad_Except_Trans.withExceptT(Data_Identity.functorIdentity)(foreignListError)(Data_YAML_Foreign_Decode.parseYAMLToJson(content)))(function (json) {
        return Control_Monad_Except_Trans.withExceptT(Data_Identity.functorIdentity)(Data_Argonaut_Decode_Error.printJsonDecodeError)(Control_Monad_Except_Trans.except(Data_Identity.applicativeIdentity)(Data_Argonaut_Decode_Class.decodeJson(dictDecodeJson)(json)));
      });
    };
  };

  var fixupHtml = function fixupHtml(rawHtml) {
    return Control_Bind.bind(Data_Maybe.bindMaybe)(Data_Either.hush(Data_String_Regex.regex("<(mspace.*)/>")(Data_String_Regex_Flags.global)))(function (mspace) {
      return Control_Bind.bind(Data_Maybe.bindMaybe)(Data_Either.hush(Data_String_Regex.regex("<(path[\\s\\S]*?)\\/>")(Data_Semigroup.append(Data_String_Regex_Flags.semigroupRegexFlags)(Data_String_Regex_Flags.global)(Data_String_Regex_Flags.multiline))))(function (svgpath) {
        var pathReplacer = function pathReplacer(v) {
          return function (groups) {
            return "<" + (Data_Maybe.fromMaybe("path")(Control_Bind.join(Data_Maybe.bindMaybe)(Data_Array.head(groups))) + "></path>");
          };
        };

        var mspaceReplacer = function mspaceReplacer(v) {
          return function (groups) {
            return "<" + (Data_Maybe.fromMaybe("mspace width=0")(Control_Bind.join(Data_Maybe.bindMaybe)(Data_Array.head(groups))) + "></mspace>");
          };
        };

        var fixedHtml1 = Data_String_Regex["replace'"](mspace)(mspaceReplacer)(rawHtml);
        var fixedHtml2 = Data_String_Regex["replace'"](svgpath)(pathReplacer)(fixedHtml1);
        return Control_Applicative.pure(Data_Maybe.applicativeMaybe)(fixedHtml2);
      });
    });
  };

  var fetchFile = function fetchFile(url) {
    return Control_Bind.bind(Effect_Aff.bindAff)(Effect_Aff.attempt(Milkis.fetch(Milkis_Impl_Window.windowFetch)()(url)(Milkis.defaultFetchOptions)))(function (_response) {
      return Data_Traversable.sequence(Data_Traversable.traversableEither)(Effect_Aff.applicativeAff)(Data_Bifunctor.bimap(Data_Bifunctor.bifunctorEither)(Data_Show.show(Effect_Exception.showError))(Milkis.text)(_response));
    });
  };

  var fetchList = function fetchList(url) {
    return Control_Bind.bind(Effect_Aff.bindAff)(fetchFile(url))(function (content) {
      return Control_Applicative.pure(Effect_Aff.applicativeAff)(Data_Functor.map(Data_Either.functorEither)(Data_String_Common.split("\x0a"))(content));
    });
  };

  var fetchYaml = function fetchYaml(dictDecodeJson) {
    return function (url) {
      return Control_Bind.bind(Effect_Aff.bindAff)(fetchFile(url))(function (yamlEither) {
        return Control_Applicative.pure(Effect_Aff.applicativeAff)(Control_Bind.bind(Data_Either.bindEither)(yamlEither)(function (yaml) {
          return Control_Monad_Except.runExcept(parseYaml(dictDecodeJson)(yaml));
        }));
      });
    };
  };

  var extractMarkdown = function extractMarkdown(markdown) {
    return Control_Bind.bind(Data_Maybe.bindMaybe)(Data_Either.hush(Data_String_Regex.regex("\\s*---([\\s\\S]*?)---\\s*([\\s\\S]*)")(Data_String_Regex_Flags.noFlags)))(function (expr) {
      return Control_Bind.bind(Data_Maybe.bindMaybe)(Data_String_Regex.match(expr)(markdown))(function (arr) {
        return Control_Bind.bind(Data_Maybe.bindMaybe)(Data_Array_NonEmpty.index(arr)(1))(function (firstGroup) {
          return Control_Bind.bind(Data_Maybe.bindMaybe)(firstGroup)(function (header) {
            return Control_Bind.bind(Data_Maybe.bindMaybe)(Data_Array_NonEmpty.index(arr)(2))(function (secondGroup) {
              return Control_Bind.bind(Data_Maybe.bindMaybe)(secondGroup)(function (body) {
                return Control_Applicative.pure(Data_Maybe.applicativeMaybe)({
                  header: header,
                  body: body
                });
              });
            });
          });
        });
      });
    });
  };

  var fetchPost = function fetchPost(url) {
    return Control_Bind.bind(Effect_Aff.bindAff)(fetchFile(url))(function (contentEither) {
      return Control_Bind.bind(Effect_Aff.bindAff)(fetchFile(Data_String_Common.replace(".md")(".html")(url)))(function (compiledEither) {
        return Control_Applicative.pure(Effect_Aff.applicativeAff)(Control_Bind.bind(Data_Either.bindEither)(contentEither)(function (content) {
          return Control_Bind.bind(Data_Either.bindEither)(Data_Either.note("error in markdown extractions")(extractMarkdown(content)))(function (v) {
            return Control_Bind.bind(Data_Either.bindEither)(Control_Monad_Except.runExcept(parseYaml(Data_Argonaut_Decode_Class.decodeRecord(Data_Argonaut_Decode_Class.gDecodeJsonCons(Data_Argonaut_Decode_Class.decodeFieldMaybe(Data_Argonaut_Decode_Class.decodeJsonString))(Data_Argonaut_Decode_Class.gDecodeJsonCons(Data_Argonaut_Decode_Class.decodeFieldMaybe(Data_Argonaut_Decode_Class.decodeJsonString))(Data_Argonaut_Decode_Class.gDecodeJsonCons(Data_Argonaut_Decode_Class.decodeFieldMaybe(Data_Argonaut_Decode_Class.decodeJsonString))(Data_Argonaut_Decode_Class.gDecodeJsonCons(Data_Argonaut_Decode_Class.decodeFieldMaybe(Data_Argonaut_Decode_Class.decodeJsonString))(Data_Argonaut_Decode_Class.gDecodeJsonCons(Data_Argonaut_Decode_Class.decodeFieldMaybe(Data_Argonaut_Decode_Class.decodeJsonString))(Data_Argonaut_Decode_Class.gDecodeJsonCons(Data_Argonaut_Decode_Class.decodeFieldMaybe(Data_Argonaut_Decode_Class.decodeJsonString))(Data_Argonaut_Decode_Class.gDecodeJsonCons(Data_Argonaut_Decode_Class.decodeFieldMaybe(Data_Argonaut_Decode_Class.decodeJsonString))(Data_Argonaut_Decode_Class.gDecodeJsonCons(Data_Argonaut_Decode_Class.decodeFieldMaybe(Data_Argonaut_Decode_Class.decodeJsonString))(Data_Argonaut_Decode_Class.gDecodeJsonCons(Data_Argonaut_Decode_Class.decodeFieldMaybe(Data_Argonaut_Decode_Class.decodeJsonString))(Data_Argonaut_Decode_Class.gDecodeJsonCons(Data_Argonaut_Decode_Class.decodeFieldMaybe(Data_Argonaut_Decode_Class.decodeJsonString))(Data_Argonaut_Decode_Class.gDecodeJsonNil)(new Data_Symbol.IsSymbol(function () {
              return "title";
            }))()())(new Data_Symbol.IsSymbol(function () {
              return "thumbnail";
            }))()())(new Data_Symbol.IsSymbol(function () {
              return "thumb";
            }))()())(new Data_Symbol.IsSymbol(function () {
              return "path";
            }))()())(new Data_Symbol.IsSymbol(function () {
              return "id";
            }))()())(new Data_Symbol.IsSymbol(function () {
              return "external";
            }))()())(new Data_Symbol.IsSymbol(function () {
              return "description";
            }))()())(new Data_Symbol.IsSymbol(function () {
              return "date";
            }))()())(new Data_Symbol.IsSymbol(function () {
              return "content";
            }))()())(new Data_Symbol.IsSymbol(function () {
              return "compiled";
            }))()())())(v.header)))(function (v1) {
              return Control_Applicative.pure(Data_Either.applicativeEither)({
                content: new Data_Maybe.Just(v.body),
                path: new Data_Maybe.Just(url),
                compiled: Control_Bind.bind(Data_Maybe.bindMaybe)(Data_Either.hush(compiledEither))(fixupHtml),
                date: Control_Bind.bind(Data_Maybe.bindMaybe)(Data_Either.hush(Data_String_Regex.regex(".*/(\\d+-\\d+-\\d+)-.*")(Data_String_Regex_Flags.noFlags)))(function (dateExpr) {
                  return Control_Bind.bind(Data_Maybe.bindMaybe)(Data_String_Regex.match(dateExpr)(url))(function (arr) {
                    return Control_Bind.join(Data_Maybe.bindMaybe)(Data_Array_NonEmpty.index(arr)(1));
                  });
                }),
                id: Control_Bind.bind(Data_Maybe.bindMaybe)(Data_Either.hush(Data_String_Regex.regex(".*/(.+)\\.md")(Data_String_Regex_Flags.noFlags)))(function (idExpr) {
                  return Control_Bind.bind(Data_Maybe.bindMaybe)(Data_String_Regex.match(idExpr)(url))(function (arr) {
                    return Control_Bind.join(Data_Maybe.bindMaybe)(Data_Array_NonEmpty.index(arr)(1));
                  });
                }),
                description: v1.description,
                external: v1.external,
                thumb: v1.thumb,
                thumbnail: v1.thumbnail,
                title: v1.title
              });
            });
          });
        }));
      });
    });
  };

  exports["fetchList"] = fetchList;
  exports["fetchPost"] = fetchPost;
  exports["fetchYaml"] = fetchYaml;
})(PS);

(function (exports) {
  "use strict";

  exports.preventDefault = function (e) {
    return function () {
      return e.preventDefault();
    };
  };
})(PS["Web.Event.Event"] = PS["Web.Event.Event"] || {});

(function ($PS) {
  // Generated by purs version 0.14.0
  "use strict";

  $PS["Web.Event.Event"] = $PS["Web.Event.Event"] || {};
  var exports = $PS["Web.Event.Event"];
  var $foreign = $PS["Web.Event.Event"];
  exports["preventDefault"] = $foreign.preventDefault;
})(PS);

(function ($PS) {
  "use strict";

  $PS["Main"] = $PS["Main"] || {};
  var exports = $PS["Main"];
  var Control_Applicative = $PS["Control.Applicative"];
  var Control_Bind = $PS["Control.Bind"];
  var Control_Monad_Reader_Class = $PS["Control.Monad.Reader.Class"];
  var Control_Monad_Reader_Trans = $PS["Control.Monad.Reader.Trans"];
  var Control_Monad_State_Class = $PS["Control.Monad.State.Class"];
  var Control_Monad_Trans_Class = $PS["Control.Monad.Trans.Class"];
  var Control_Parallel = $PS["Control.Parallel"];
  var Data_Argonaut_Decode_Class = $PS["Data.Argonaut.Decode.Class"];
  var Data_Array = $PS["Data.Array"];
  var Data_Either = $PS["Data.Either"];
  var Data_Eq = $PS["Data.Eq"];
  var Data_Foldable = $PS["Data.Foldable"];
  var Data_Functor = $PS["Data.Functor"];
  var Data_Map_Internal = $PS["Data.Map.Internal"];
  var Data_Maybe = $PS["Data.Maybe"];
  var Data_Ord = $PS["Data.Ord"];
  var Data_Semigroup = $PS["Data.Semigroup"];
  var Data_Show = $PS["Data.Show"];
  var Data_Symbol = $PS["Data.Symbol"];
  var Data_Traversable = $PS["Data.Traversable"];
  var Data_Tuple = $PS["Data.Tuple"];
  var Data_Unit = $PS["Data.Unit"];
  var Effect_Aff = $PS["Effect.Aff"];
  var Effect_Aff_Class = $PS["Effect.Aff.Class"];
  var Effect_Class = $PS["Effect.Class"];
  var Effect_Class_Console = $PS["Effect.Class.Console"];
  var Foreign = $PS["Foreign"];
  var Halogen_Aff_Util = $PS["Halogen.Aff.Util"];
  var Halogen_Component = $PS["Halogen.Component"];
  var Halogen_Query_HalogenM = $PS["Halogen.Query.HalogenM"];
  var Halogen_VDom_Driver = $PS["Halogen.VDom.Driver"];
  var Pages = $PS["Pages"];
  var Routes = $PS["Routes"];
  var Routing_Duplex = $PS["Routing.Duplex"];
  var Routing_PushState = $PS["Routing.PushState"];
  var Type_Equality = $PS["Type.Equality"];
  var Types = $PS["Types"];
  var Util = $PS["Util"];
  var Web_Event_Event = $PS["Web.Event.Event"];

  var Navigate = function Navigate(Monad0, navigate) {
    this.Monad0 = Monad0;
    this.navigate = navigate;
  };

  var AppM = function AppM(x) {
    return x;
  };

  var runAppM = function runAppM(env) {
    return function (v) {
      return Control_Monad_Reader_Trans.runReaderT(v)(env);
    };
  };

  var navigate = function navigate(dict) {
    return dict.navigate;
  };

  var navigateHalogenM = function navigateHalogenM(dictNavigate) {
    return new Navigate(function () {
      return Halogen_Query_HalogenM.monadHalogenM;
    }, function () {
      var $43 = Control_Monad_Trans_Class.lift(Halogen_Query_HalogenM.monadTransHalogenM)(dictNavigate.Monad0());
      var $44 = navigate(dictNavigate);
      return function ($45) {
        return $43($44($45));
      };
    }());
  };

  var monadEffectAppM = Control_Monad_Reader_Trans.monadEffectReader(Effect_Aff.monadEffectAff);
  var monadAppM = Control_Monad_Reader_Trans.monadReaderT(Effect_Aff.monadAff);

  var monadAskAppM = function monadAskAppM(dictTypeEquals) {
    return new Control_Monad_Reader_Class.MonadAsk(function () {
      return monadAppM;
    }, AppM(Control_Monad_Reader_Class.asks(Control_Monad_Reader_Trans.monadAskReaderT(Effect_Aff.monadAff))(Type_Equality.from(dictTypeEquals))));
  };

  var monadAffAppM = Effect_Aff_Class.monadAffReader(Effect_Aff_Class.monadAffAff);
  var functorAppM = Control_Monad_Reader_Trans.functorReaderT(Effect_Aff.functorAff);
  var bindAppM = Control_Monad_Reader_Trans.bindReaderT(Effect_Aff.bindAff);
  var navigateAppMPush = new Navigate(function () {
    return monadAppM;
  }, function (route) {
    return Control_Bind.bind(bindAppM)(Control_Monad_Reader_Class.asks(monadAskAppM(Type_Equality.refl))(function (v) {
      return v.nav;
    }))(function (pushInterface) {
      return Effect_Class.liftEffect(monadEffectAppM)(pushInterface.pushState(Foreign.unsafeToForeign({}))(Routing_Duplex.print(Routes.routeCodec)(route)));
    });
  });
  /**
  * 
  * Main component. This component is the purescript javascript code.
  */

  var component = function () {
    var render = function render(state) {
      if (state.page instanceof Types.Main) {
        return Pages.mainPage(state.cv);
      }

      ;

      if (state.page instanceof Types.BlogList) {
        return Pages.blogList(state);
      }

      ;

      if (state.page instanceof Types.Blog) {
        return Data_Maybe.fromMaybe(Pages.mainPage(state.cv))(Control_Bind.bind(Data_Maybe.bindMaybe)(Data_Map_Internal.lookup(Data_Ord.ordString)(state.page.value0)(state.posts))(function (post) {
          return Control_Applicative.pure(Data_Maybe.applicativeMaybe)(Pages.blogPage(post));
        }));
      }

      ;
      throw new Error("Failed pattern match at Main (line 166, column 18 - line 173, column 33): " + [state.page.constructor.name]);
    };
    /**
    *  initial state 
    */


    var initialState = function initialState(v) {
      return {
        page: Types.Main.value,
        posts: Data_Map_Internal.fromFoldable(Data_Ord.ordString)(Data_Foldable.foldableArray)([]),
        cv: Data_Maybe.Nothing.value
      };
    };
    /**
    * 
    *   handleQuery is more interesting
    *   
    */


    var handleQuery = function handleQuery(v) {
      return Control_Bind.bind(Halogen_Query_HalogenM.bindHalogenM)(Control_Monad_State_Class.get(Halogen_Query_HalogenM.monadStateHalogenM))(function (v1) {
        return Control_Bind.discard(Control_Bind.discardUnit)(Halogen_Query_HalogenM.bindHalogenM)(Control_Applicative.when(Halogen_Query_HalogenM.applicativeHalogenM)(Data_Eq.notEq(Data_Maybe.eqMaybe(Types.eqPage))(new Data_Maybe.Just(v1.page))(v.value0))(Control_Monad_State_Class.modify_(Halogen_Query_HalogenM.monadStateHalogenM)(function (state) {
          var $21 = {};

          for (var $22 in state) {
            if ({}.hasOwnProperty.call(state, $22)) {
              $21[$22] = state[$22];
            }

            ;
          }

          ;
          $21.page = Data_Maybe.fromMaybe(Types.Main.value)(v.value0);
          return $21;
        })))(function () {
          return Control_Applicative.pure(Halogen_Query_HalogenM.applicativeHalogenM)(new Data_Maybe.Just(v.value1));
        });
      });
    };

    var handleAction = function () {
      var toTuple = function toTuple(el) {
        return new Data_Tuple.Tuple(Data_Maybe.fromMaybe("default")(el.id), el);
      };

      return function (v) {
        if (v instanceof Types.SwitchPage) {
          return Control_Bind.discard(Control_Bind.discardUnit)(Halogen_Query_HalogenM.bindHalogenM)(Effect_Class.liftEffect(Halogen_Query_HalogenM.monadEffectHalogenM(monadEffectAppM))(Web_Event_Event.preventDefault(v.value1)))(function () {
            return Control_Bind.bind(Halogen_Query_HalogenM.bindHalogenM)(Control_Monad_State_Class.get(Halogen_Query_HalogenM.monadStateHalogenM))(function (state) {
              return navigate(navigateHalogenM(navigateAppMPush))(new Data_Maybe.Just(v.value0));
            });
          });
        }

        ;

        if (v instanceof Types.Initialize) {
          return Control_Bind.bind(Halogen_Query_HalogenM.bindHalogenM)(Control_Monad_Reader_Class.asks(Halogen_Query_HalogenM.monadAskHalogenM(monadAskAppM(Type_Equality.refl)))(function (v1) {
            return v1.nav;
          }))(function (nav) {
            return Control_Bind.discard(Control_Bind.discardUnit)(Halogen_Query_HalogenM.bindHalogenM)(Routes.validateUrl(Halogen_Query_HalogenM.monadEffectHalogenM(monadEffectAppM))(nav))(function () {
              return Control_Bind.bind(Halogen_Query_HalogenM.bindHalogenM)(Effect_Aff_Class.liftAff(Halogen_Query_HalogenM.monadAffHalogenM(monadAffAppM))(Util.fetchYaml(Data_Argonaut_Decode_Class.decodeRecord(Data_Argonaut_Decode_Class.gDecodeJsonCons(Data_Argonaut_Decode_Class.decodeFieldId(Data_Argonaut_Decode_Class.decodeJsonString))(Data_Argonaut_Decode_Class.gDecodeJsonCons(Data_Argonaut_Decode_Class.decodeFieldId(Data_Argonaut_Decode_Class.decodeArray(Data_Argonaut_Decode_Class.decodeRecord(Data_Argonaut_Decode_Class.gDecodeJsonCons(Data_Argonaut_Decode_Class.decodeFieldId(Data_Argonaut_Decode_Class.decodeJsonString))(Data_Argonaut_Decode_Class.gDecodeJsonCons(Data_Argonaut_Decode_Class.decodeFieldId(Data_Argonaut_Decode_Class.decodeJsonString))(Data_Argonaut_Decode_Class.gDecodeJsonCons(Data_Argonaut_Decode_Class.decodeFieldId(Data_Argonaut_Decode_Class.decodeJsonString))(Data_Argonaut_Decode_Class.gDecodeJsonNil)(new Data_Symbol.IsSymbol(function () {
                return "qualification";
              }))()())(new Data_Symbol.IsSymbol(function () {
                return "name";
              }))()())(new Data_Symbol.IsSymbol(function () {
                return "institution";
              }))()())())))(Data_Argonaut_Decode_Class.gDecodeJsonCons(Data_Argonaut_Decode_Class.decodeFieldId(Data_Argonaut_Decode_Class.decodeArray(Data_Argonaut_Decode_Class.decodeRecord(Data_Argonaut_Decode_Class.gDecodeJsonCons(Data_Argonaut_Decode_Class.decodeFieldId(Data_Argonaut_Decode_Class.decodeJsonString))(Data_Argonaut_Decode_Class.gDecodeJsonCons(Data_Argonaut_Decode_Class.decodeFieldId(Data_Argonaut_Decode_Class.decodeJsonString))(Data_Argonaut_Decode_Class.gDecodeJsonCons(Data_Argonaut_Decode_Class.decodeFieldId(Data_Argonaut_Decode_Class.decodeJsonString))(Data_Argonaut_Decode_Class.gDecodeJsonCons(Data_Argonaut_Decode_Class.decodeFieldId(Data_Argonaut_Decode_Class.decodeJsonString))(Data_Argonaut_Decode_Class.gDecodeJsonNil)(new Data_Symbol.IsSymbol(function () {
                return "years";
              }))()())(new Data_Symbol.IsSymbol(function () {
                return "role";
              }))()())(new Data_Symbol.IsSymbol(function () {
                return "employer";
              }))()())(new Data_Symbol.IsSymbol(function () {
                return "description";
              }))()())())))(Data_Argonaut_Decode_Class.gDecodeJsonCons(Data_Argonaut_Decode_Class.decodeFieldId(Data_Argonaut_Decode_Class.decodeJsonString))(Data_Argonaut_Decode_Class.gDecodeJsonCons(Data_Argonaut_Decode_Class.decodeFieldId(Data_Argonaut_Decode_Class.decodeJsonString))(Data_Argonaut_Decode_Class.gDecodeJsonCons(Data_Argonaut_Decode_Class.decodeFieldId(Data_Argonaut_Decode_Class.decodeJsonString))(Data_Argonaut_Decode_Class.gDecodeJsonNil)(new Data_Symbol.IsSymbol(function () {
                return "what";
              }))()())(new Data_Symbol.IsSymbol(function () {
                return "summary";
              }))()())(new Data_Symbol.IsSymbol(function () {
                return "stack";
              }))()())(new Data_Symbol.IsSymbol(function () {
                return "experience";
              }))()())(new Data_Symbol.IsSymbol(function () {
                return "education";
              }))()())(new Data_Symbol.IsSymbol(function () {
                return "domains";
              }))()())())("/assets/cv.yaml")))(function (v1) {
                return Control_Bind.discard(Control_Bind.discardUnit)(Halogen_Query_HalogenM.bindHalogenM)(Control_Monad_State_Class.modify_(Halogen_Query_HalogenM.monadStateHalogenM)(function (state) {
                  var $31 = {};

                  for (var $32 in state) {
                    if ({}.hasOwnProperty.call(state, $32)) {
                      $31[$32] = state[$32];
                    }

                    ;
                  }

                  ;
                  $31.cv = Data_Either.hush(v1);
                  return $31;
                }))(function () {
                  return Control_Bind.bind(Halogen_Query_HalogenM.bindHalogenM)(Effect_Aff_Class.liftAff(Halogen_Query_HalogenM.monadAffHalogenM(monadAffAppM))(Util.fetchList("/blog/posts.dat")))(function (postListEither) {
                    if (postListEither instanceof Data_Either.Left) {
                      return Effect_Aff_Class.liftAff(Halogen_Query_HalogenM.monadAffHalogenM(monadAffAppM))(Effect_Class_Console.log(Effect_Aff.monadEffectAff)(postListEither.value0));
                    }

                    ;

                    if (postListEither instanceof Data_Either.Right) {
                      var paths = Data_Functor.map(Data_Functor.functorArray)(Data_Semigroup.append(Data_Semigroup.semigroupString)("/blog/"))(postListEither.value0);
                      return Control_Bind.bind(Halogen_Query_HalogenM.bindHalogenM)(Effect_Aff_Class.liftAff(Halogen_Query_HalogenM.monadAffHalogenM(monadAffAppM))(Control_Parallel.parSequence(Effect_Aff.parallelAff)(Data_Traversable.traversableArray)(Data_Functor.map(Data_Functor.functorArray)(Util.fetchPost)(paths))))(function (arr) {
                        var printFailed = function printFailed(x) {
                          return Effect_Class_Console.log(Halogen_Query_HalogenM.monadEffectHalogenM(monadEffectAppM))("failed path: " + (Data_Show.show(Data_Show.showString)(Data_Tuple.snd(x)) + (" - " + Data_Either.fromLeft("unknown error")(Data_Tuple.fst(x)))));
                        };

                        var postMap = Data_Map_Internal.fromFoldable(Data_Ord.ordString)(Data_Foldable.foldableArray)(Data_Functor.map(Data_Functor.functorArray)(toTuple)(Data_Array.catMaybes(Data_Functor.map(Data_Functor.functorArray)(Data_Either.hush)(arr))));
                        var failed = Data_Array.filter(function (v2) {
                          return Data_Either.isLeft(v2.value0);
                        })(Data_Array.zip(arr)(paths));
                        return Control_Bind.bind(Halogen_Query_HalogenM.bindHalogenM)(Control_Parallel.parSequence(Halogen_Query_HalogenM.parallelHalogenM)(Data_Traversable.traversableArray)(Data_Functor.map(Data_Functor.functorArray)(printFailed)(failed)))(function () {
                          return Control_Monad_State_Class.modify_(Halogen_Query_HalogenM.monadStateHalogenM)(function (state) {
                            var $39 = {};

                            for (var $40 in state) {
                              if ({}.hasOwnProperty.call(state, $40)) {
                                $39[$40] = state[$40];
                              }

                              ;
                            }

                            ;
                            $39.posts = postMap;
                            return $39;
                          });
                        });
                      });
                    }

                    ;
                    throw new Error("Failed pattern match at Main (line 148, column 7 - line 161, column 60): " + [postListEither.constructor.name]);
                  });
                });
              });
            });
          });
        }

        ;
        throw new Error("Failed pattern match at Main (line 137, column 18 - line 161, column 60): " + [v.constructor.name]);
      };
    }();

    return Halogen_Component.mkComponent({
      initialState: initialState,
      render: render,
      "eval": Halogen_Component.mkEval({
        handleAction: handleAction,
        handleQuery: handleQuery,
        receive: Halogen_Component.defaultEval.receive,
        initialize: new Data_Maybe.Just(Types.Initialize.value),
        finalize: Halogen_Component.defaultEval.finalize
      })
    });
  }();
  /**
  * 
  * This is a minimal purescript example that sets up a website.
  * 
  * This gets the body element and injects the halogen component
  * it also listens for url changes and triggers a Navigate action
  * to switch pages with a halogen query that is sent to the component.
  */


  var main = Halogen_Aff_Util.runHalogenAff(Control_Bind.bind(Effect_Aff.bindAff)(Effect_Class.liftEffect(Effect_Aff.monadEffectAff)(Routing_PushState.makeInterface))(function (nav) {
    var environment = {
      nav: nav
    };
    var rootcomponent = Halogen_Component.hoist(Effect_Aff.functorAff)(runAppM(environment))(component);
    return Control_Bind.discard(Control_Bind.discardUnit)(Effect_Aff.bindAff)(Halogen_Aff_Util.awaitLoad)(function () {
      return Control_Bind.bind(Effect_Aff.bindAff)(Halogen_Aff_Util.awaitBody)(function (body) {
        return Control_Bind.bind(Effect_Aff.bindAff)(Halogen_VDom_Driver.runUI(rootcomponent)(Data_Unit.unit)(body))(function (halogenIO) {
          return Control_Bind.bind(Effect_Aff.bindAff)(Effect_Class.liftEffect(Effect_Aff.monadEffectAff)(Routes.listenForUrlChanges(nav)(halogenIO)))(function (canceller) {
            return Control_Applicative.pure(Effect_Aff.applicativeAff)(Data_Unit.unit);
          });
        });
      });
    });
  }));
  var applyAppM = Control_Monad_Reader_Trans.applyReaderT(Effect_Aff.applyAff);
  var applicativeAppM = Control_Monad_Reader_Trans.applicativeReaderT(Effect_Aff.applicativeAff);
  exports["navigate"] = navigate;
  exports["main"] = main;
  exports["AppM"] = AppM;
  exports["Navigate"] = Navigate;
  exports["runAppM"] = runAppM;
  exports["component"] = component;
  exports["functorAppM"] = functorAppM;
  exports["applyAppM"] = applyAppM;
  exports["applicativeAppM"] = applicativeAppM;
  exports["bindAppM"] = bindAppM;
  exports["monadAppM"] = monadAppM;
  exports["monadEffectAppM"] = monadEffectAppM;
  exports["monadAffAppM"] = monadAffAppM;
  exports["monadAskAppM"] = monadAskAppM;
  exports["navigateHalogenM"] = navigateHalogenM;
  exports["navigateAppMPush"] = navigateAppMPush;
})(PS);

PS["Main"].main();
},{"js-yaml":"node_modules/js-yaml/dist/js-yaml.mjs"}],"../../../../../nix/store/9w4mrzs0ajjfdy8wmgrg44jcd03rw6qv-node_parcel-bundler-1.12.5/lib/node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "37045" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../../../../../nix/store/9w4mrzs0ajjfdy8wmgrg44jcd03rw6qv-node_parcel-bundler-1.12.5/lib/node_modules/parcel-bundler/src/builtins/hmr-runtime.js","build/ps.js"], null)
//# sourceMappingURL=/ps.e4523678.js.map
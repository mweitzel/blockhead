var required = {}
  , path = require('path')
  , fs = require('fs')
  , ª = require('lil-carrot').apply
  , ˆ = require('lil-carrot').apply
  , unto = require('unto')
  , argshift = require('argshift')
  , teelog = require('teelog')
  , noop = (()=>{})
  , begetScope = require('./scope').extend
  , stdlib = {
      add: (a, b) => a + b
    , sum: (...nums) => nums.reduce(stdlib.add)
    , process: process
    , keys: Object.keys.bind(Object)
    , unto: argshift(unto)
    , pass: (a) => a
    , sum: (...rest) => rest.reduce(stdlib.add)
    , teelog: teelog
    , '*' : ª
    , '!' : ˆ
    , get: (obj, id) => obj[id]
    , ctx_get: (obj, id) => obj[id].bind(obj)
    , ctx_call: (obj, id, ...args) => obj[id].bind(obj).apply(null, args)
    , import: require
    , as: function (scope, tokens, args) {
        var identifier = ns.resolveToken(tokens[0], scope, args)
          , values =     ns.resolveToken(tokens[1], scope, args)
        if(!isArray(identifier))
          scope[identifier] = values
        else
          for( var i = 0; i < identifier.length; i++)
            scope[identifier[i]] = values[i]
        return values
      }
    , scope: function(scope, tokens, args) {
        return stdlib['\\'](begetScope(scope), tokens).apply(null, args)
      }
    , "\\": function (scope, tokens) { return ns.exec.bind(null, tokens, scope) }
    , "'": (...args) => args
    }

stdlib['\\'].__blockhead_macro__ = true
stdlib['\\'].ahhhhhhhhhhhhhhhhhhhhh = true
stdlib['as'].__blockhead_macro__ = true
stdlib.scope.__blockhead_macro__ = true

var ns = module.exports = {
  require: (name) => ns.interpret(ns.loadOnly(name))
, loadOnly: (name) => fs.readFileSync(path.resolve(name), 'utf8')
, buildStructure: text => ((tokens) =>
      parensMatch(tokens) && deepInvertUnto(liftMatch(tokens, '(', ')'))
    )(ns.tokenize(text))
, interpret: (string, scope) =>
    ns.exec(ns.buildStructure(string), scope || stdlib)
, tokenize: text => text
    .split('\n')
    .map(str => str.split(';')[0])
    .join('\n')
    .trim()
    .split('\n\n')
    .join('::\n\n')
    .split(' ')
    .map(str => extractIfPresent(str, ':'))
    .reduce(join)
    .map(str => extractIfPresent(str, '('))
    .reduce(join)
    .map(str => extractIfPresent(str, ')'))
    .reduce(join)
    .map(str => extractIfPresent(str, '\n'))
    .reduce(join)
    .map(str => extractIfPresent(str, '	'))
    .reduce(join)
    .filter(s => s !== '' && s !== '\n' && s !== '	')
, exec: function(structure, scope, ...args) {
    return (function(firstToken, ...remainingTokens) {
      scope['<>'] = args || []
      scope['.'] = (args || [])[0]
      var thing = ns.resolveToken(firstToken, scope, args)
      if(!isFunction(thing) && remainingTokens.length === 0)
        return thing
      thing = ensureFunction(thing, firstToken, scope)
      if(thing.__blockhead_macro__) {
        thing = thing(scope, remainingTokens, args)
      }
      else {
        thing = thing.apply(
          scope
        , remainingTokens.map((struc) => ns.resolveToken(struc, scope, args))
        )
      }
      return thing
    }).apply(null, structure)
  }
, resolveToken: function(token, scope, args) {
    return isArray(token)
      ? ns.exec.bind(null, token, scope).apply(null, args)
      : ( ( scope[token]      )
        ||( isFinite(parseInt(token)) ? parseInt(token) : token )
        )
  }
}

function isFunction(fn) {
  return typeof fn === 'function'
}

function ensureFunction(fn, token, scope) {
  if(isFunction(fn)) { return fn }
  console.log('token:', token)
  console.log(Object.keys(scope))
  console.log((scope))
  throw new Error(fn + " is not a function")
}

function invertUnto(array) {
  var i = array.indexOf(':')
  var j = array.slice(i+1).indexOf(':')
  return unnestIfSolo(
    (i === -1)
    ? array
    : invertUnto(
        unnestIfSolo(
          [
            [ 'unto' ].concat( [ array.slice(0, i) ] ).concat([
              [ '\\' ].concat( array.slice(i+1, j === -1 ? array.length : (i+1+j)) )
            ])
          ]
        ).concat(j > -1 ? array.slice(i+1+j) : [])
      )
  )
}

function unnestIfSolo(arr) {
  if(isArray(arr) && arr.length === 1 && isArray(arr[0]))
    return arr[0]
  return arr
}

function isNested(arr) {
  return arr.reduce(
    (carry, token) => (carry || isArray(token))
  , false
  )
}

function isArray(arr) {
  return arr && arr.constructor && arr.constructor.name === 'Array' && arr.length > -1
}

function deepInvertUnto(token_array_nestedArray) {
  var token, array, nestedArray
  token = array = nestedArray = unnestIfSolo(token_array_nestedArray)
  if(!isArray(token_array_nestedArray))
    return token
  return invertUnto(array).map(deepInvertUnto).map(unnestIfSolo)
}

function liftMatch(array, up, down) {
  var lastUp = 0
  for(var i = 0; i < array.length; i++)
    if(array[i] === up)
      lastUp = i
    else if(array[i] === down)
      return liftMatch(
        array.slice(0,lastUp)
        .concat([['scope'].concat([array.slice(lastUp+1,i)])])
        .concat(array.slice(i+1))
      , up
      , down
      )

  return array
}

function parensMatch(tokenArray) {
  var stack = tokenArray.reduce(function(stack, token, i) {
    if(token === '(') {
      stack.push({ token: token, i: i })
    }
    else if(token === ')') {
      if(stack.length === 0) {
        throw new Error('no matching open paren for token')
      }
      else
        stack.pop()
    }
    return stack
  }, [])
  if(stack.length !== 0) {
    throw new Error('no matching close paren')
  }
  return true
}

function extractIfPresent(string, subStr) {
  return string
    .split(subStr)
    .reduce((a,s) => a.concat(s).concat(subStr), [])
    .slice(0, -1)
}

function contains(arrayLike, obj) { return arrayLike.indexOf(obj) > -1 }
function join(a, b) { return a.concat(b) }

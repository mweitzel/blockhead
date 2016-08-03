var required = {}
  , path = require('path')
  , fs = require('fs')
  , ª = require('lil-carrot').apply
  , unto = require('unto')
  , argshift = require('argshift')
  , teelog = require('teelog')
  , noop = (()=>{})
  , stdlib = {
      add: (a, b) => a + b
    , sum: (...rest) => rest.reduce(stdlib.add)
    , unto: argshift(unto)
    , "\\": (fn, ...rest) => (...evenMore) => ª(fn||noop, rest.concat(evenMore))
    , teelog: teelog
    , '*' : argshift(ª)
    , get: (id, obj) => obj[id]
// import
    }

var ns = module.exports = {
  require: (name) => ns.compile(ns.loadOnly(name))
, loadOnly: (name) => fs.readFileSync(path.resolve(name), 'utf8')
, buildStructure: text => ((tokens) =>
      parensMatch(tokens) && deepInvertUnto(liftMatch(tokens, '(', ')'))
    )(ns.tokenize(text))
, interpret: (string, scope) =>
    ns.exec(ns.buildStructure(string), scope || stdlib)
, tokenize: text => text
    .split(' ')
    .map(str => extractIfPresent(str, ':'))
    .reduce(join)
    .map(str => extractIfPresent(str, '('))
    .reduce(join)
    .map(str => extractIfPresent(str, ')'))
    .reduce(join)
    .filter(s => s !== '' && s !== '\n' && s !== '	')
, exec: (structure, scope) =>
    ª((first, ...rest) =>
      ª(ns.resolveToken(first, scope)
      , rest.map((str) => ns.resolveToken(str, scope))
      )
    , structure)
, resolveToken: (token, scope) =>
    isArray(token)
    ? ns.exec(token, scope)
    : (scope[token] || parseInt(token)) //JSON.parse(token))
}

function invertUnto(array) {
  var i = array.indexOf(':')
  var j = array.slice(i+1).indexOf(':')
  return unnestIfSolo(
    (i === -1)
    ? array
    : invertUnto(
        unnestIfSolo(
          [                 /// or noop? in case empty?
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
  token = array = nestedArray = token_array_nestedArray
  if(!isArray(token_array_nestedArray))
    return token
//  else if(!isNested(array))
    return invertUnto(array).map(deepInvertUnto).map(unnestIfSolo)
//  else {
//    return nestedArray.map(deepInvertUnto)
//  }

//// is array
//var containsArray = false
//for(var i = 0; i < nestedArrays.length; i++)
//  if(nestedArrays[i] && nestedArrays[i].constructor && nestedArrays[i].constructor.name === 'Array')
//    containsArray = true

//if(containsArray)
//  return nestedArrays.map(deepInvertUnto)
//else
//  return nestedArrays.map(invertUnto)
}

function liftMatch(array, up, down) {
  var lastUp = 0
  for(var i = 0; i < array.length; i++)
    if(array[i] === up)
      lastUp = i
    else if(array[i] === down)
      return liftMatch(
        array.slice(0,lastUp)
        .concat([array.slice(lastUp+1,i)])
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

function contains(arrayLike, obj) {
  return arrayLike.indexOf(obj) > -1
}

function join(a, b) {
  return a.concat(b)
}

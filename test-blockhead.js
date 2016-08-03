var tape = require('tape')
  , test = (name, cb) => tape(name, (t) => (cb(t), t.end()))
  , blockhead = require('./blockhead')


//test('imports and exports js', t =>
//  t.equal(
//    blockhead.require('./adder.ks') //(2,6)
//  , 8
//  )
//)

test('builds data structure from code', t => (
  t.deepEqual(
    blockhead.buildStructure('funciton arg0 arg1 arg2')
  , [ 'funciton', 'arg0', 'arg1', 'arg2' ]
  )
, t.deepEqual(
    blockhead.buildStructure('add 1 3 : add 5')
  , [ 'unto', [ 'add', '1', '3' ], [ '\\', 'add', '5' ] ]
  )
, t.deepEqual(
    blockhead.buildStructure('add 1 3 : add 5 : add 20')
  , [ 'unto', [ 'unto', [ 'add', '1', '3' ], [ '\\', 'add', '5' ] ], [ '\\', 'add', '20' ]]
  )
))

test('colon creates nested arrays', t => (
  t.deepEqual(
    blockhead.buildStructure('f1 a1 a2 : f2 a3 a4')
  , [ 'unto', ['f1','a1','a2'], ['\\','f2','a3','a4'] ]
  )
  , t.deepEqual(
      blockhead.buildStructure('f1 a1 : f2 a2 : f3 a3')
    , [ 'unto', [ 'unto', [ 'f1', 'a1' ], [ '\\', 'f2', 'a2' ] ], [ '\\', 'f3', 'a3' ] ]
    )
))

test('can interpret string', t=> (
  t.equals(blockhead.interpret('add 3 6'), 9)
, t.equals(blockhead.interpret('add 4 5_number_of_horses'), 9)
, t.equals(blockhead.interpret('add 4 5_the_bananas'), 9)
, t.equals(blockhead.interpret('add 1 3 : add 5'), 9)
, t.equals(blockhead.interpret('add 1 3 : add 5 : add 20'), 29)
, t.equals(blockhead.interpret('add 1 3 : add 5 : add 20 : add 10'), 39)
, t.equals(blockhead.interpret('add 1 3 : add 5 : add 20 : add 10 : add 50'), 89)
, t.ok( isNaN( blockhead.interpret('add 1 3 :: add 5') ) )
, t.equals(blockhead.interpret('add 1 (add 1 1) : add 1'), 4)
, t.equals(blockhead.interpret('add 1 (add 1 1) : add (add 1 1)'), 5)
, t.equals(blockhead.interpret('add 1 (add 1 1) : add (add 1 1 : add 1)'), 6)
, t.equals(blockhead.interpret('add 1 (add 1 1) : add (add 1 1 : add 1) : add 1'), 7)
, t.equals(blockhead.interpret('add 1 (add 1 1) : sum (add 1 1 : add 1) 1 1 1 : add 1'), 10)
, t.equals(blockhead.interpret(
      [ 'add 1 (add 1 1)'
      , '	: add (add 1 (add 1 1 : add 1) : add 1)'
      , ': add 	      		1'
      ].join('\n')
    )
  , 9)
))

test('can resolve token', t=> (
  t.equals(
    blockhead.resolveToken('hat', { hat: 'blue hat' })
  , 'blue hat'
  )
, t.equals(
    blockhead.resolveToken(['hat'], { hat: () => 'blue hat' })
  , 'blue hat'
  )
, t.equals(
    blockhead.resolveToken(
      ['add', 'fart', 'brains']
    , { add: (a,b) => a+b, fart: 4, brains: 7 })
  , 11
  )
, t.equals(
    blockhead.resolveToken(
      ['add', 'fart', ['add', 'fart', 'brains']]
    , { add: (a,b) => a+b, fart: 4, brains: 7 })
  , 15
  )
))

test('parens nest', t => (
  t.deepEqual(
    blockhead.buildStructure('f1 ( f2 a2 ) a1')
  , ['f1', ['f2', 'a2'], 'a1']
  )
, t.deepEqual(
    blockhead.buildStructure('f1 ( f2 a2 ) a1 (add (add 1 2) 3)')
  , ['f1', ['f2', 'a2'], 'a1', [ 'add', [ 'add', '1', '2' ], '3']]
  )
))


test('tokenize everything', t =>
  t.deepEqual(
    blockhead.tokenize('f1 ( f2 a2 : ok hi) a1 asdf:f3 a:(add 1 2): print')
  , ['f1', '(', 'f2', 'a2', ':', 'ok', 'hi', ')', 'a1', 'asdf', ':', 'f3', 'a', ':', '(', 'add', '1', '2', ')', ':', 'print']
  )
)

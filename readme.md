# blockhead

lisp-like chain based language and interpreter for drop-in use with javascript

intended for clean flow based transforms on data

![The Ducks, which he had once saved, dived and brought up the key from the depths.](http://www.gutenberg.org/files/37381/37381-h/images/pl07.jpg)

([photo credit gutenberg](http://www.gutenberg.org/files/37381/37381-h/37381-h.htm#Page_46))

The interpreter makes use of native JavaScript objects, so you can both interpret blockhead scripts from JavaScript, and require .js modules from .bh scripts.

It is lisp-_like_, so in blockhead uses `(` parens `)` to hold scope and nest functions. But it also makes use of `:` colons `:` to separate and reduce blocks into eachother.

## installation

```
npm install blockhead
```

## examples and usage

- `<>` references arguments, as an array
- `.` references the first argument
- `:` forward return to method queue
- `(` open a new level of lexical scope
- `)` close current level of lexical scope
- `;` comment

The command
```
(add 5 10) : as fifteen .
```

will add 5 and 10, forward it to the next block use the `.` operator to reference first argument and associate it within the current (and inner-more) levels of scope


A single line break does nothing
```
add
5
10
; => 15
```

Two line breaks are replaced with a full stop, or `::`.

```
add 5

10
; => 10
```

is the same as

```
add 5 :: 10
```

## license

MIT

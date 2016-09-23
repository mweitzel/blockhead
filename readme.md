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
- `:` forward return [unto](https://github.com/mweitzel/unto) to next block
- `(` open a new level of lexical scope
- `)` close current level of lexical scope
- `;` comment
- `*` apply
- `\` as anonymous function

In the following command, add 5 and 10, forward to the next block where we use the `.` operator to reference first argument. `as` associates it to `fifteen` within the current (and inner-more) levels of scope
```lisp
(add 5 10) : as fifteen .

fifteen
; => 15
```

Parens create scope, so here the token `fifteen` doees not escape the scope

```lisp
(add 5 10 : as fifteen .)

fifteen
; => fifteen
```


A single line break does nothing
```lisp
add
5
10
; => 15
```

Two line breaks are replaced with a full stop, or `::`.

```lisp
add 5

10
; => 10
```

is the same as

```lisp
add 5 :: 10
```

#### hello-https

this is a port of node's [hello-https](https://howtonode.org/hello-node)

```lisp
import http : get . createServer : as new_serv .

\(as (' req res) <>
  : ctx_get res end
    : . web_serverrrrrrrrrrs!!!)
: as respond_ .

\(new_serv respond_
    : as server .
      : ctx_get server listen
         : . (get process env : get . PORT))
:as serv_port_message .

\ * serv_port_message <>
```

you can run it yourself with

```sh
$ (export PORT=8003 ; ./bh hello-https.bh)
```

visit [localhost:8003](http://127.0.0.1:8003) to see try it out


## license

MIT

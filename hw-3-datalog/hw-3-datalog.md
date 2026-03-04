# №1

Let the extensional relations be:
- `u(V,W)` (binary)
- `v(A,B)` (binary, attributes first and second)
- `t(Y)` (unary)

**Relational algebra for `s(X,Y)`:**

First, rename two copies of `v`:
- `v1 = ρ_{W,X}(v)`   (first column → W, second → X)
- `v2 = ρ_{W,Y}(v)`   (first column → W, second → Y)

Then
```
s = π_{X,Y}( σ_{X ≠ Y}( u ⋈ v1 ⋈ v2 ) )
```
where the joins are natural on W.

**Relational algebra for `r(X,Y)`:**

First compute the diagonal of `s`:
```
s_diag = π_X( σ_{X = Y}(s) )
```

Then
```
r = s_diag × ( t - ρ_{Y←X}(s_diag) )
```
Equivalently,
```
r = ( s_diag × t )  -  ( s_diag × ρ_{Y←X}(s_diag) )
```

# №2

Given `g = {(a,b), (b,c), (c,d), (d,e), (e,f), (f,g)}`.

First compute the symmetric closure `bi`:
```
bi = g ∪ ρ_{Y,X}(g)
   = {(a,b), (b,a), (b,c), (c,b), (c,d), (d,c),
      (d,e), (e,d), (e,f), (f,e), (f,g), (g,f)}
```

## (a) Naive recursion for `even`

- **Initial:** `even0 = ∅`
- **Iteration 1:** Apply rule `even(X,Y) :- bi(X,Z), bi(Z,Y)`.
  ```
  even1 = {
    (a,a), (b,b), (c,c), (d,d), (e,e), (f,f), (g,g),
    (a,c), (c,a), (b,d), (d,b), (c,e), (e,c),
    (d,f), (f,d), (e,g), (g,e)
  }
  ```
- **Iteration 2:** Apply recursive rule using `even1`. New tuples from
  `bi(X,U), bi(U,V), even1(V,Y)`:
  ```
  even2 = even1 ∪ {
    (a,e), (e,a), (c,g), (g,c), (b,f), (f,b)
  }
  ```
- **Iteration 3:** Apply recursive rule using `even2`. New tuples:
  ```
  even3 = even2 ∪ { (a,g), (g,a) }
  ```
- **Iteration 4:** No new tuples; fixpoint reached.

## (b) Semi-naive implementation

Let `bi` be as above.

**Step 1:**
```
Δ1 = π_{X,Y}( ρ_{X,Z}(bi) ⋈ ρ_{Z,Y}(bi) )
even1 = Δ1
```

**For i ≥ 1:**
```
Δ^{i+1} = π_{X,Y}( ρ_{X,U}(bi) ⋈ ρ_{U,V}(bi) ⋈ ρ_{V,Y}(Δ^i) )  -  even^i
even^{i+1} = even^i ∪ Δ^{i+1}
```
Iterate until `Δ^{i+1} = ∅`.

# №3

Given `g = {(a,b), (b,c), (c,d), (d,e), (f,g), (g,h), (h,i), (b,i)}`.

## (a) Inefficiency of semi-naive for query `reach(c,Y)`

Semi-naive computes the full transitive closure of `g`, i.e., all reachable pairs from any node. For this graph it would compute many irrelevant facts (e.g., paths from `a`, `b`, `f`), while only paths starting at `c` are needed. This wastes time and space.

## (b) Top-down evaluation of `reach(c,Y)`

- Query: `reach(c,Y)`
- Rule 1: `g(c,Y)` gives `Y = d`.
- Rule 2: `g(c,Z)` gives `Z = d`; then query `reach(d,Y)`.
  - `reach(d,Y)`: `g(d,Y)` gives `Y = e`.
  - `g(d,Z)` gives `Z = e`; then `reach(e,Y)` yields none.
- Answers: `Y = d` and `Y = e`.

## (c) Magic set evaluation for `reach(c,Y)`

Magic program:
```
m(c).
m(Z) :- m(X), g(X,Z).
```
Compute `m` bottom-up:
- `m(c)`
- from `g(c,d)`: `m(d)`
- from `g(d,e)`: `m(e)`
Thus `m = {c, d, e}`.

Now compute `reach`:
```
reach(X,Y) :- m(X), g(X,Y).        // gives (c,d), (d,e)
reach(X,Y) :- m(X), g(X,Z), reach(Z,Y). // using reach(d,e) and g(c,d) gives (c,e)
```
So `reach(c,Y)` yields `{d, e}`.

## (d) Rewrite for query `?reach(c,e)`

Introduce magic predicate for the first argument (bound to `c`):
```
m(c).
m(Z) :- m(X), g(X,Z).
```
Then:
```
reach(X,e) :- m(X), g(X,e).
reach(X,e) :- m(X), g(X,Z), reach(Z,e).
```
Evaluating gives `reach(c,e)` true.

## (e) Rewrite for query `?reach(X,e)`

Introduce magic predicate for the second argument (bound to `e`):
```
m(e).   // no propagation needed because bound argument stays the same
```
Then:
```
reach(X,Y) :- m(Y), g(X,Y).        // gives (d,e) from g(d,e)
reach(X,Y) :- m(Y), g(X,Z), reach(Z,Y). // with Y=e: need reach(Z,e) and g(X,Z)
```
Starting from `reach(d,e)` (base), we get:
- from `g(c,d)` and `reach(d,e)`: `reach(c,e)`
- from `g(b,c)` and `reach(c,e)`: `reach(b,e)`
- from `g(a,b)` and `reach(b,e)`: `reach(a,e)`
Thus all `X` that can reach `e` are `{a, b, c, d}`.

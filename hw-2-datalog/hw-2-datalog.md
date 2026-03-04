# №1

```
sister(X,Y) :- parent(Z,X), parent(Z,Y), person(X,'female'), X != Y.
brother(X,Y) :- parent(Z,X), parent(Z,Y), person(X,'male'), X != Y.

aunt(X,Y)   :- parent(Z,Y), sister(X,Z).
uncle(X,Y)   :- parent(Z,Y), brother(X,Z).

ancestor(X,Y) :- parent(X,Y).
ancestor(X,Y) :- parent(X,Z), ancestor(Z,Y).
```

# №2

## Program 1

```
sister(X,Y) :- parent(Z,X), parent(Z,Y), female(X), not(X=Y).
aunt(X,Y)   :- parent(Z,Y), sister(X,Z).
```

Safe: all variables appear in positive relational atoms.

Stratified: no negation on IDB predicates; all IDB predicates can be in the same stratum (e.g., stratum 0: parent, female; stratum 1: sister, aunt).

## Program 2

```
root(X) :- not(parent(Y,X)).
same_generation(X,Y) :- root(X), root(Y).
same_generation(X,Y) :- parent(V,X), parent(W,Y), same_generation(V,W).
```

Unsafe: in the first rule, variable X appears only in the head and in a negated literal, with no positive binding.

Because it is unsafe, stratification is not considered (though the dependency graph would be acyclic).

## Program 3

```
friend(X,Y) :- friend(Y,X).
friend(X,Y) :- friend(X,Z), friend(Z,Y).
enemy(X,Y) :- enemy(Y,X).
enemy(X,Y) :- friend(X,Z), enemy(Z,Y), not(friend(X,Y)).
connected_after(X,Y,U,V) :- friend(X,U), friend(Y,V).
connected_after(X,Y,U,V) :- friend(X,V), friend(Y,U).
connects_new_enemies(X,Y) :- connected_after(X,Y,U,V), enemy(U,V), not(friend(U,V)).
potential_friend(X,Y) :- person(X), person(Y), not(enemy(X,Y)), not(connects_new_enemies(X,Y)).
```

Safe: every head variable appears in a positive relational atom.

Stratified: the dependency graph has no cycle involving negation. One possible stratification:
- Stratum 0: person (EDB)
- Stratum 1: friend, connected_after
- Stratum 2: enemy, connects_new_enemies
- Stratum 3: potential_friend

# №3

Facts in `g: {(a,b), (b,c), (c,d)}`.

Rules:

```
bi(X,Y) :- g(X,Y).
bi(Y,X) :- g(X,Y).
even(X,Y) :- bi(X,Z), bi(Z,Y).
even(X,Y) :- bi(X,U), bi(U,V), even(V,Y).
Minimal model (least fixed point):
```

`bi` is the symmetric closure of `g: {(a,b), (b,a), (b,c), (c,b), (c,d), (d,c)}`.

`even` contains all pairs reachable by an even-length path in the undirected graph `(a–b–c–d): {(a,a), (a,c), (b,b), (b,d), (c,a), (c,c), (d,b), (d,d)}`.

Adding the rule:

```
onlyodd(X,Y) :- not(even(X,Y)).
Under the active domain {a,b,c,d}, onlyodd contains all pairs not in even:
{(a,b), (a,d), (b,a), (b,c), (c,b), (c,d), (d,a), (d,c)}.
```

# №4

Extensional relations: `u = {(a), (b), (c)}, v = {(b), (c), (d)}`.

Rules:

```
t(X,Y)   :- u(X), u(Y), not(v(X)).
r(X)     :- u(X), v(Y), not(t(X,Y)).
s(X)     :- r(Y), t(Y,X), not(r(X)).
```

(a) Safety and stratification

All rules are safe because every variable appears in a positive relational atom.

Stratified: dependencies are acyclic.
- Stratum 0: `u, v (EDB)`
- Stratum 1: `t`
- Stratum 2: `r`
- Stratum 3: `s`

(b) Stratified model
Compute stratum by stratum:

Stratum 1 `(t): t(X,Y) is true for all X in u with not(v(X)) (i.e., X = a) and Y in u`. `t = {(a,a), (a,b), (a,c)}`.

Stratum 2 `(r): r(X) is true if there exists Y in v such that t(X,Y) is false`.

`For X = a: v contains b,c,d; t(a,d) is false ⇒ r(a) true`.

`For X = b: all Y in v give false t (since t(b,Y) never holds) ⇒ r(b) true`.

`For X = c: similarly ⇒ r(c) true`.

`r = {a, b, c}`.

Stratum 3 `(s): s(X) requires some Y with r(Y), t(Y,X), and not(r(X))`.
`t(Y,X) only holds for Y = a and X ∈ {a,b,c}, but all those X are in r, so not(r(X)) fails`.
`s = ∅`.

(c) Another minimal model
Consider adding extra tuples to t to make r(b) false, then s(b) becomes true.

Set:

`t = {(a,a), (a,b), (a,c), (b,b), (b,c), (b,d)}`
(the forced tuples for `a`, plus all three needed to cover `v` for `b`)

Then `r becomes {a, c}` because:

For `a: t(a,d) false ⇒ r(a) true`.

For `b: all Y in v (b,c,d) have t(b,Y) true ⇒ r(b) false`.

For `c: no t(c,*) ⇒ r(c) true`.

Now `s(b)` is true because: `Y = a with r(a) true, t(a,b) true, and r(b) false`.
No other s tuples arise.

This model is minimal: removing any tuple would either violate a rule or force a different truth value (e.g., removing one of the added t(b,*) would make r(b) true and then s(b) would no longer be forced).

# №5

A program is domain‑independent if its meaning does not change when the underlying domain of constants is enlarged (as long as the EDB facts stay the same). Safety is a syntactic sufficient condition, but not necessary.

Example:
```
p(X) :- q(Y), not(q(Y)).
```

The body is a contradiction (q(Y) and not q(Y) can never be true), so p is always empty regardless of the domain. The rule is unsafe because variable X appears only in the head and not in any positive relational atom. Yet the program is domain‑independent (its only intensional relation is always empty).

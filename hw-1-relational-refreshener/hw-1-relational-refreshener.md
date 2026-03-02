# Queries

## (a) Give all types of planes that are used on a connection from BRU.

```sql
SELECT DISTINCT
    type.type
FROM flight
JOIN plane ON
    flight.flight_nr = plane.flight_nr
JOIN type ON
    plane.plane_nr = type.plane_nr
WHERE flight.dept = 'BRU';
```

## (b) Give all planes that are not involved in any flight.

```sql
SELECT
    plane.plane_nr
FROM plane
LEFT JOIN flight ON
    plane.flight_nr = flight.flight_nr
WHERE flight.flight_nr IS NULL;
```

## (c) Give all types of planes that are involved in all flights.

```sql
SELECT
    type.type
FROM type
JOIN plane ON type.plane_nr = plane.plane_nr
GROUP BY type.type
HAVING COUNT(DISTINCT plane.flight_nr) = (SELECT COUNT(*) FROM flight);
```

## (d) Give all connections (i.e. departure-destination pairs) for which not all plane types are used.

```sql
SELECT f.dept, f.dest
FROM flight f
WHERE (f.dept, f.dest) NOT IN (
    SELECT f2.dept, f2.dest
    FROM flight f2
    WHERE NOT EXISTS (
        SELECT t.type
        FROM type t
        WHERE NOT EXISTS (
            SELECT 1
            FROM plane p
            WHERE p.flight_nr = f2.flight_nr
              AND p.plane_nr = t.plane_nr
        )
    )
);
```

## (e) Give all flight numbers that are used multiple times.

```sql
SELECT
    flight.flight_nr
FROM flight
GROUP BY flight_nr
HAVING COUNT(*) > 1;
```

## (f) Give all pairs of different flight numbers that are used on the same connection.

```sql
SELECT DISTINCT
    f1.flight_nr,
    f2.flight_nr
FROM flight f1
JOIN flight f2 ON
    f1.dept = f2.dept
        AND f1.dest = f2.dest
WHERE f1.flight_nr < f2.flight_nr;
```

## (g) Give all planes that have a plane type that is used at least once for every connection.

```sql
SELECT p.plane_nr
FROM plane p
WHERE p.plane_nr IN (
    SELECT p2.plane_nr
    FROM plane p2
    WHERE p2.plane_nr IN (
        SELECT t.plane_nr
        FROM type t
        WHERE NOT EXISTS (
            SELECT f.dept, f.dest
            FROM flight f
            WHERE (f.dept, f.dest) NOT IN (
                SELECT DISTINCT f2.dept, f2.dest
                FROM flight f2
                JOIN plane p3 ON
                    f2.flight_nr = p3.flight_nr
                WHERE p3.plane_nr = t.plane_nr
            )
        )
    )
);
```

# True or False

## (a)  Every relational algebra expression that does not use negation is monotone; i.e.: if tuples are added to the input, the output can never become smaller.

true

## (b)  The operators ∩ and ∪ are redundant; i.e., every relational expression can be rewritten into an equivalent one without ∩ and ∪.

true for ∩
false for ∪

# Graph Queries

## (a) Give all nodes that do not have any incoming edges

```sql
SELECT DISTINCT
    A AS node
FROM G
WHERE A NOT IN (
    SELECT DISTINCT B
    FROM G
);
```

## (b) Give all pairs of nodes (x, y) such that together they point to all other nodes.

```sql
SELECT DISTINCT
    g1.A AS x,
    g2.A AS y
FROM
    G g1,
    G g2
WHERE g1.A < g2.A
  AND NOT EXISTS (
      SELECT
          n.B
      FROM G n
      WHERE n.B NOT IN (
          SELECT 
          x.B
          FROM G gx
          WHERE gx.A = g1.A
              UNION
          SELECT gy.B
          FROM G gy
          WHERE gy.A = g2.A
      )
  );
```

## (c) Give all nodes (x,y) such that the distance from x to y is at most 4.

```sql
WITH RECURSIVE Paths AS (
    SELECT
        A AS start,
        B AS end,
        1 AS distance
    FROM G

    UNION ALL

    SELECT
        p.start,
        g.B AS end,
        p.distance + 1
    FROM Paths p
    JOIN G g ON
        p.end = g.A
    WHERE p.distance < 4 -- Stop recursion at 4 to prevent infinite loops
)
SELECT DISTINCT
    start AS x,
    end AS y
FROM Paths
WHERE distance <= 4;
```

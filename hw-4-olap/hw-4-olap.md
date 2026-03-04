# №1

## Relational Schema
We design a star schema with a fact table and three dimension tables to support the required hierarchies.

- **Fact table**: `SalesFact`  
  - `product_id` (FK to ProductDim)  
  - `store_id` (FK to StoreDim)  
  - `date_id` (FK to DateDim)  
  - `amount` (numeric) – sales amount for a single transaction or daily aggregate  

- **Dimension table**: `ProductDim`  
  - `product_id` (PK)  
  - `product_name`  
  - `brand`  

- **Dimension table**: `StoreDim`  
  - `store_id` (PK)  
  - `store_name`  
  - `province`  
  - `country`  

- **Dimension table**: `DateDim`  
  - `date_id` (PK)  
  - `date` (actual date)  
  - `day_of_week`  
  - `month`  
  - `quarter`  
  - `semester`  
  - `year`  

## SQL:1999 Expression for the Data Cube
We use `GROUP BY CUBE` to generate all possible combinations of hierarchy levels.  
NULL values represent aggregation over the corresponding dimension.

```sql
SELECT
    p.product_name,
    p.brand,
    s.store_name,
    s.province,
    s.country,
    d.year,
    d.semester,
    d.quarter,
    d.month,
    d.day_of_week,
    SUM(f.amount) AS total_sales,
    AVG(f.amount) AS average_sales
FROM SalesFact f
JOIN ProductDim p ON f.product_id = p.product_id
JOIN StoreDim s ON f.store_id = s.store_id
JOIN DateDim d ON f.date_id = d.date_id
GROUP BY CUBE (
    p.product_name, p.brand,
    s.store_name, s.province, s.country,
    d.year, d.semester, d.quarter, d.month, d.day_of_week
);
```

## Handling Multiple Measures and Hierarchies
- **Multiple measures**: Both `SUM(amount)` and `AVG(amount)` are computed directly in the query. The average at any level is the average of the base amounts, which is correct because we are aggregating the raw sales figures.
- **Hierarchies**: All levels of each dimension are included in the `CUBE` clause. This produces every combination of attributes, with NULLs indicating rolled-up values. The relationships between levels (e.g., product → brand) are implicitly handled because brand is a separate attribute; grouping by brand alone gives brand-level aggregates.

# №2

## (a) Dense Setting
- **i. Number of tuples in base relation**  
  5 products × 12 months × 3 stores = 180 tuples.

- **ii. Number of tuples in the data cube**  
  The cube includes all combinations of grouping sets. For three dimensions, the number of cells is  
  (product count + 1) × (month count + 1) × (store count + 1)  
  = (5+1) × (12+1) × (3+1) = 6 × 13 × 4 = 312 tuples.

## (b) Sparse Setting
Given the relation:

| Product | Month | Store | Amount |
|---------|-------|-------|--------|
| P1      | Jan   | S1    | a1     |
| P1      | Jan   | S2    | a2     |
| P2      | Feb   | S2    | a3     |
| P2      | Feb   | S3    | a4     |
| P3      | Jan   | S1    | a5     |
| P3      | Feb   | S1    | a6     |
| P4      | Feb   | S1    | a7     |
| P5      | Jan   | S3    | a8     |

We count non‑empty cells for each grouping set:

- **Product only**: P1, P2, P3, P4, P5 → 5
- **Month only**: Jan, Feb → 2
- **Store only**: S1, S2, S3 → 3
- **Product, Month**: (P1,Jan), (P2,Feb), (P3,Jan), (P3,Feb), (P4,Feb), (P5,Jan) → 6
- **Product, Store**: (P1,S1), (P1,S2), (P2,S2), (P2,S3), (P3,S1), (P4,S1), (P5,S3) → 7
- **Month, Store**: (Jan,S1), (Jan,S2), (Jan,S3), (Feb,S1), (Feb,S2), (Feb,S3) → 6
- **Product, Month, Store**: the 8 base tuples → 8
- **Grand total**: 1

Total non‑empty cells = 5 + 2 + 3 + 6 + 7 + 6 + 8 + 1 = 38.

# №3

## Given
- 100 products
- 3 years = 1095 days, 157 weeks, 36 months, 12 quarters, 3 years
- Dense: every product–day combination exists

## (a) Sizes of Different Views
Views are all combinations of product (present or absent) and date levels (day, week, month, quarter, year). Sizes:

- (Product, Day): 100 × 1095 = 109,500
- (Product, Week): 100 × 157 = 15,700
- (Product, Month): 100 × 36 = 3,600
- (Product, Quarter): 100 × 12 = 1,200
- (Product, Year): 100 × 3 = 300
- (Product only): 100
- (Day): 1,095
- (Week): 157
- (Month): 36
- (Quarter): 12
- (Year): 3
- (All – grand total): 1

## (b) Greedy Algorithm to Select 2 Views
We assume the base view (Product, Day) is already materialized. The greedy algorithm selects views to maximize the reduction in total query cost (sum of sizes of the smallest materialized descendant for each view). Initially, all queries cost 109,500 (size of base). We compute benefits for each candidate view (number of ancestors × (current cost – size of candidate)). After the first selection, costs are updated.

**Step 1 – Benefits before any addition**  
Using ancestor counts (derived from the date hierarchy: day → week and month; week → year; month → quarter → year), we get:

- (P,Week): 6 ancestors × (109500−15700=93800) = 562,800
- (P,Month): 8 × 105,900 = 847,200
- (P,Quarter): 6 × 108,300 = 649,800
- (P,Year): 4 × 109,200 = 436,800
- (P): 2 × 109,400 = 218,800
- (Day): 6 × 108,405 = 650,430
- (Week): 3 × 109,343 = 328,029
- (Month): 4 × 109,464 = 437,856
- (Quarter): 3 × 109,488 = 328,464
- (Year): 2 × 109,497 = 218,994
- (All): 1 × 109,499 = 109,499

Highest benefit: **(P,Month)** with 847,200. Materialize it.

**Step 2 – After materializing (P,Month)**  
Now costs for views that are ancestors of (P,Month) drop to 3,600. Recompute benefits for remaining candidates:

- (P,Week): ancestors with cost 109500 (P,Week and Week) and 3600 (P,Year, P, Year, All) → size 15700 gives benefit 2×93800 = 187,600
- (P,Quarter): all 6 ancestors now cost 3600, size 1200 → benefit 6×(3600−1200)=14,400
- (P,Year): all 4 ancestors cost 3600, size 300 → 4×3300=13,200
- (P): 2 ancestors cost 3600, size 100 → 2×3500=7,000
- (Day): ancestors D(109500), W(109500), M(3600), Q(3600), Y(3600), All(3600) → 2×108405 + 4×2505 = 226,830
- (Week): 1×109343 + 2×3443 = 116,229
- (Month): all 4 ancestors cost 3600, size 36 → 4×3564 = 14,256
- (Quarter): 3×3588 = 10,764
- (Year): 2×3597 = 7,194
- (All): 1×3599 = 3,599

Highest now: **(Day)** with 226,830.

Thus the greedy algorithm selects **(P,Month)** first, then **(Day)**.

## (c) Total Benefit
Total benefit = benefit of first view + benefit of second view = 847,200 + 226,830 = **1,074,030**.

This equals the sum over all views of (initial cost – final cost) after materializing these two views (checked by enumeration).

# №4

The theorem states that for any lattice, the benefit of the k views chosen by the greedy algorithm, B_greedy, satisfies  
B_greedy / B_opt >= 1 - ((k-1)/k)^k  
and this bound is tight: there exist lattices for which the ratio can be made arbitrarily close to 1 - ((k-1)/k)^k.

The bound (e - 1)/e then follows from the fact that the limit as k approaches infinity of ((k-1)/k)^k equals 1/e.

To show tightness for arbitrary k, one constructs a family of lattices where the optimal set of k views achieves a certain benefit, while the greedy algorithm, misled by locally optimal choices, achieves exactly the lower bound. A classic construction (from Harinarayan et al., SIGMOD 1996) uses a lattice with a root view (the most detailed) and a set of child views whose sizes are chosen in a geometric progression. For any k, the greedy algorithm picks views that yield a benefit of 1 - ((k-1)/k)^k times the optimal benefit. As k grows, this ratio approaches (e-1)/e. The construction demonstrates that the bound cannot be improved.

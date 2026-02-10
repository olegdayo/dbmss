// TechCorp brand
db.getSiblingDB('shop').products.find({"brand": "TechCorp"})

// Price <= 100
db.getSiblingDB('shop').products.find({"price": {$lte: 100}})

// Not in stock
db.getSiblingDB('shop').products.find({"in_stock": false}, {"name": 1, "brand": 1})

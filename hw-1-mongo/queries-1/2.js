// TechCorp brand
db.getSiblingDB('shop').products.find({"brand": "TechCorp"})

// Price <= 100
db.getSiblingDB('shop').products.find({"price": {$lte: 100}})

// Not in stock
db.getSiblingDB('shop').products.find({"category": "peripherals", "in_stock": false}, {"_id": 0, "name": 1, "brand": 1})

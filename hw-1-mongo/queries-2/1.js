// Not TechCorp brand, 70 <= price <= 500
db.getSiblingDB('shop').products.find({$and: [{"brand": {$not: {"$eq": "TechCorp"}}}, {"price": {$gte: 70}}, {"price": {$lte: 500}}]})

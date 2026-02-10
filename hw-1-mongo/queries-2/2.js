// Add a tag for all best products
db.getSiblingDB('shop').products.updateMany({"stock_count": {$gt: 100}}, {$push: {"tags": "best-seller"}})

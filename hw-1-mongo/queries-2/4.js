// Create bew collection
db.getSiblingDB('shop').createCollection('test_delete')

// Insert first 5 entries of products collection
db.getSiblingDB('shop').test_delete.insertMany(db.getSiblingDB('shop').products.find().limit(5).toArray())

// Delete everything
db.getSiblingDB('shop').test_delete.deleteMany({})

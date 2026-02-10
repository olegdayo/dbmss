// Update gamer gears brand
db.getSiblingDB('shop').products.updateMany({"brand": "GamerGear"}, {$set: {"brand": "GamerPro"}})

// Update laptop price
db.getSiblingDB('shop').products.updateOne({"name": "Laptop Pro"}, {$inc: {"price": -100}})

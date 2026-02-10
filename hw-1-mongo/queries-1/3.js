// Update gamer gears brand
db.getSiblingDB('shop').products.update({"brand": "GamerGear"}, {$set: {"brand": "GamerPro"}}, {multi: true})

// Update laptop price
db.getSiblingDB('shop').products.update({"name": "Laptop Pro"}, {$inc: {"price": -100}}, {multi: true})

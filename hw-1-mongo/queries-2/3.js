// Find a monitor
db.getSiblingDB('shop').products.find({ name: "4K Monitor" })

// Update a monitor that does not exist
db.getSiblingDB('shop').products.updateOne({ name: "8K Monitor" }, { $set: { price: 2000, brand: "ViewSonic" } }, { upsert: true })

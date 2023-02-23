const mongoose = require('mongoose')

const Schema = mongoose.Schema

const BookInstanceSchema = new Schema({
  book: { type: Schema.Types.ObjectId, ref: "Book", require: true },
  imprints: { type: String, required: true },
  status: {
    type: String, require: true, enum: [
      "Available", "Maintenance", "Loaned", "Reserved"
    ], default: "Maintenance"
  }
  ,
  due_back: { type: Date, default: Date.now }
})


BookInstanceSchema.virtual(url).get(function() {
  return `/catalog/bookinstance/${this._id}`
})

module.exports = mongoose.model("BookInstance",BookInstanceSchema)

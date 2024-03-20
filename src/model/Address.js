import mongoose from "mongoose"
const { Schema } = mongoose;

const addressSchema = new Schema({
  userId:{type:Schema.Types.ObjectId, required:true, ref:"User"},
  name: { type: String, required: true,
    minlength: [2, "Invalid Name"],
    match: [
      /^[a-zA-Z\s]+$/,
      "Name must contain only alphabetic characters and space",
    ], required: true},
  phone: { type: Number, min: [1000000000, "Invalid phone number"], max:[9999999999, "Invalid phone number"] ,required: true},
  area:{type: String, required: true},
  city:{ type: String, required: true},
  state:{ type: String, required: true},
  pin:{ type: Number, required: true, min: [100000, "Invalid pin code"], max:[999999, "Invalid pin code"]},
  country:{ type: String, default:"India"},
})

addressSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

addressSchema.set('toJSON', {
    virtuals: true,
    versionKey:false,
    transform: function (doc, ret){delete ret._id}
})


export const Address = mongoose.model('Address', addressSchema);
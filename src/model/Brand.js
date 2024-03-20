import mongoose from "mongoose"
const { Schema } = mongoose;

const brandSchema = new Schema({
  label: { type: String, required: true, unique: true },
  value: { type: String, required: true, unique: true },
});

brandSchema.virtual('id').get(function() {
    return this._id.toHexString();
});


brandSchema.set('toJSON', {
    virtuals: true,
    versionKey:false,
    transform: function (doc, ret){delete ret._id}
})


export const Brand = mongoose.model('Brand', brandSchema);
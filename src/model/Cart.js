import mongoose from "mongoose"
const {Schema} = mongoose

const cartSchema = new mongoose.Schema({
    quantity: { type : Number, default:1},
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true},
    user:{ type: Schema.Types.ObjectId, ref: 'User', required: true},
})

cartSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

cartSchema.set('toJSON', {
    virtuals: true,
    versionKey:false,
    transform: function (doc, ret){delete ret._id}
})

export const Cart = mongoose.model('Cart',cartSchema)
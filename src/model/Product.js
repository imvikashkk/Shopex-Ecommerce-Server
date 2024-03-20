import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    title:{type:String, required:true, unique:true},
    description:{type:String, required:true},
    price:{type:Number, min:[1, "Wrong minimum price"]},
    discountPercentage:{type:Number, min:[1, 'Wrong Minimum Discount Percentage'], max:[100, "Wrong Minimum Discount Percentage"]},
    rating:{type:Number, min:[0, "Wrong Min Rating"], max:[5, "Wrong Max Rating"], default:0},
    stock:{type:Number, min:[0, "Wrong Min Stock"], default:0},
    brand:{type:String, required:true},
    category:{type:String, required:true},
    thumbnail:{type:String, required:true},
    images:{type: [String], required: true},
    deleted:{type: Boolean, default: false}
})


productSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

productSchema.set('toJSON', {
    virtuals: true,
    versionKey:false,
    transform: function (doc, ret){delete ret._id}
})


export const Product = mongoose.model('Product', productSchema);
import mongoose from "mongoose"
const { Schema } = mongoose;

const paymentMethods = {
    values: ['online', 'cod'],
    message: 'paymentMethods should be online or cod'
}

const orderSchema = new Schema(
    {
      items: { type: [Schema.Types.Mixed], required: true },
      totalAmount: { type: Number },
      totalItems: { type: Number },
      user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      paymentMethod: { type: String, required: true, enum: paymentMethods },
      paymentStatus: { type: String, default: 'pending' },
      status: { type: String, default: 'pending' },
      selectedAddress: { type: Schema.Types.Mixed, required: true },
    },
    { timestamps: true }
  );


  orderSchema.virtual('id').get(function() {
    return this._id.toHexString();
});


orderSchema.set('toJSON', {
    virtuals: true,
    versionKey:false,
    transform: function (doc, ret){delete ret._id}
})

export const Order = mongoose.model('Order', orderSchema);
import mongoose from "mongoose";
const { Schema } = mongoose;

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: [ true, "email should be unique"],
      lowercase: true,
      trim: true,
      validate: [validateEmail, "Please fill a valid email address"],
    },
    phone:{type:Number},
    password: { type: Buffer, required: true, trim: true},
    role: { type: String, default: "user" },
    addresses: { type: [Schema.Types.ObjectId], ref:"Address" },
    name: {
      type: String,
      required: true,
      minlength: [2, "Invalid Name"],
      match: [
        /^[a-zA-Z\s]+$/,
        "Name must contain only alphabetic characters and space",
      ],
    },
    salt: Buffer,
    resetPasswordToken: { type: String },
    resetPasswordTokenTime:{type: Date},
    phone:{ type: Number, min: [1000000000, "Invalid phone number"], max:[9999999999, "Invalid phone number"]
  }},
  { timestamps: true }
);

userSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

userSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

export const User = mongoose.model("User", userSchema);

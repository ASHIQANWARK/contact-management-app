const mongoose = require("mongoose");
const Joi = require("joi");

// Mongoose Schema
const ContactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      postalCode: { type: String },
    },
    notes: { type: String },
    birthday: { type: Date },
    tags: [String],
    favorite: { type: Boolean, default: false },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Ensure this is correct
  },
  { timestamps: true }
);

const Contact = mongoose.model("Contact", ContactSchema);

// Joi Validation Schema
const validateContact = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(4).max(50).required(),
    phone: Joi.string()
      .pattern(/^[0-9+()-]+$/)
      .min(7)
      .max(15)
      .required(),
    email: Joi.string().email().required(),
    address: Joi.object({
      street: Joi.string().min(4).max(100).allow(""),
      city: Joi.string().min(2).max(50).allow(""),
      state: Joi.string().min(2).max(50).allow(""),
      postalCode: Joi.string().min(4).max(20).allow(""),
    }),
    notes: Joi.string().max(500).allow(""),
    birthday: Joi.date().allow(null),
    tags: Joi.array().items(Joi.string().min(1).max(50)),
    favorite: Joi.boolean(),
  });

  return schema.validate(data);
};

module.exports = {
  validateContact,
  Contact,
};

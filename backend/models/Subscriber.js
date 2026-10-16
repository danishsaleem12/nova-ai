// backend/models/Subscriber.js
//
// Newsletter subscribers (visitors never need an account).
// Double opt-in: a new address is "pending" until they click the link in the confirmation email.

const mongoose = require("mongoose");

const subscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },
    status: {
      type: String,
      enum: ["pending", "subscribed", "unsubscribed"],
      default: "pending",
      index: true,
    },
    // Random secret in the confirm / unsubscribe links. It can only confirm or unsubscribe
    // this one address, so it is safe to keep and to put in every future newsletter email.
    token: { type: String, required: true, unique: true },
    // Where the form was (e.g. "ai-blog"), for knowing which pages bring signups
    source: { type: String, default: "website", maxlength: 40 },
    confirmedAt: Date,
    unsubscribedAt: Date,
    // When the last confirmation email went out (resend cooldown)
    lastEmailAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.models.Subscriber || mongoose.model("Subscriber", subscriberSchema);

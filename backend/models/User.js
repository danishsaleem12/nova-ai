// backend/models/User.js

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [60, "Name must be under 60 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },

    // Only required for email/password accounts. Google accounts have no password.
    password: {
      type: String,
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // never returned by default; use .select("+password") on login
      required: [
        function () {
          return this.provider === "local";
        },
        "Password is required",
      ],
    },

    // "local" = email + password, "google" = signed in with Google
    provider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },

    googleId: {
      type: String,
      unique: true,
      sparse: true, // allows many users with no googleId
    },

    avatar: {
      type: String,
      default: "",
    },

    lastLoginAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Hash the password before saving (only when it was set or changed)
userSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Compare a plain password with the stored hash
userSchema.methods.comparePassword = async function (candidate) {
  if (!this.password) return false; // Google-only account
  return bcrypt.compare(candidate, this.password);
};

// Strip sensitive/internal fields whenever a user is sent as JSON
userSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
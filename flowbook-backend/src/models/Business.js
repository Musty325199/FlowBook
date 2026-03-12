import mongoose from "mongoose";

const businessSchema = new mongoose.Schema(
  {
    name: String,

    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true
    },

    description: {
      type: String,
      default: "",
      maxlength: 300
    },

    about: {
      type: String,
      default: "",
      maxlength: 1000
    },

    yearsOfExperience: {
      type: Number,
      default: 0,
      min: 0
    },

    specialties: {
      type: [String],
      default: []
    },

    avatar: {
      type: String,
      default: ""
    },

    coverImage: {
      type: String,
      default: ""
    },

    location: {
      type: String,
      default: "",
      trim: true
    },

    phone: {
      type: String,
      default: "",
      trim: true
    },

    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    workingHours: {
      Monday: {
        open: { type: String, default: "" },
        close: { type: String, default: "" },
        closed: { type: Boolean, default: false }
      },
      Tuesday: {
        open: { type: String, default: "" },
        close: { type: String, default: "" },
        closed: { type: Boolean, default: false }
      },
      Wednesday: {
        open: { type: String, default: "" },
        close: { type: String, default: "" },
        closed: { type: Boolean, default: false }
      },
      Thursday: {
        open: { type: String, default: "" },
        close: { type: String, default: "" },
        closed: { type: Boolean, default: false }
      },
      Friday: {
        open: { type: String, default: "" },
        close: { type: String, default: "" },
        closed: { type: Boolean, default: false }
      },
      Saturday: {
        open: { type: String, default: "" },
        close: { type: String, default: "" },
        closed: { type: Boolean, default: false }
      },
      Sunday: {
        open: { type: String, default: "" },
        close: { type: String, default: "" },
        closed: { type: Boolean, default: true }
      }
    },

    subscriptionStatus: {
      type: String,
      enum: ["free", "active", "expired"],
      default: "free",
      index: true
    },

    subscriptionPlan: {
      type: String,
      enum: ["monthly", "yearly", null],
      default: null
    },

    subscriptionExpiresAt: {
      type: Date,
      default: null,
      index: true
    },

    availableBalance: {
      type: Number,
      default: 0,
      min: 0
    },

    totalRevenue: {
      type: Number,
      default: 0,
      min: 0
    },

    paystackRecipientCode: {
      type: String,
      default: null
    },

    payoutLocked: {
      type: Boolean,
      default: false
    },

    autoConfirmBookings: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

businessSchema.methods.isSubscriptionActive = function () {
  if (this.subscriptionStatus !== "active") return false;
  if (!this.subscriptionExpiresAt) return false;
  return this.subscriptionExpiresAt > new Date();
};

export default mongoose.model("Business", businessSchema);
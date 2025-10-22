const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Project title is required"],
      trim: true,
      minlength: 3,
      maxlength: 100,
    },
    description: {
      type: String,
      required: [true, "Project description is required"],
      trim: true,
      minlength: 10,
      maxlength: 2000,
    },
    tags: [{ type: String, trim: true }],
    category: {
      type: String,
      enum: [
        "web",
        "mobile",
        "desktop",
        "cyber-security",
        "ai",
        "ml",
        "data-science",
        "api",
        "automation",
        "devops",
        "blockchain",
        "iot",
        "game-dev",
        "cloud",
        "python",
        "javascript",
        "java",
        "c++",
        "other",
      ],
      required: [true, "Project category is required"],
      default: "other",
    },

    status: {
      type: String,
      enum: ["planning", "in-progress", "completed", "on-hold", "cancelled"],
      default: "planning",
    },
    imageUrl: {
      type: String,
      validate: {
        validator: (v) => !v || /^https?:\/\/.+/.test(v),
        message: "Please provide a valid image URL",
      },
      default: null,
    },
    codeUrl: {
      type: String,
      validate: {
        validator: (v) => !v || /^https?:\/\/.+/.test(v),
        message: "Please provide a valid code URL",
      },
      default: null,
    },
    liveUrl: {
      type: String,
      validate: {
        validator: (v) => !v || /^https?:\/\/.+/.test(v),
        message: "Please provide a valid live URL",
      },
      default: null,
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    visibility: {
      type: String,
      enum: ["public", "private", "unlisted"],
      default: "public",
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
    startDate: Date,
    endDate: Date,
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
projectSchema.index({ title: "text", description: "text", tags: "text" });
projectSchema.index({ likesCount: -1 });

module.exports = mongoose.model("Project", projectSchema);

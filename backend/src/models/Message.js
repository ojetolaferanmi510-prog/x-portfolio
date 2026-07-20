const mongoose = require('mongoose');

const STATUSES = ['new', 'in_review', 'accepted', 'declined'];

const messageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      maxlength: 200,
    },
    projectType: {
      type: String,
      required: [true, 'Project type is required'],
      trim: true,
      maxlength: 100,
    },
    budget: {
      type: String,
      default: '',
      trim: true,
      maxlength: 100,
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: 5000,
    },
    status: {
      type: String,
      enum: STATUSES,
      default: 'new',
    },
    archived: {
      type: Boolean,
      default: false,
    },
    adminNote: {
      type: String,
      default: '',
      trim: true,
      maxlength: 2000,
    },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

messageSchema.index({ status: 1, createdAt: -1 });
messageSchema.index({ archived: 1 });

module.exports = mongoose.model('Message', messageSchema);
module.exports.STATUSES = STATUSES;

import mongoose from 'mongoose';
import { ACCESS_ROLES } from './access.js';
const { Schema } = mongoose;

// Every account owner creates a workspace (workspace = owner's _id).
// People added by the owner share that workspace.
const userSchema = new Schema(
  {
    workspace: { type: Schema.Types.ObjectId, required: true, index: true },
    isOwner: { type: Boolean, default: false },
    accessRole: { type: String, enum: ACCESS_ROLES },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, lowercase: true, trim: true, unique: true, sparse: true },
    passwordHash: { type: String },
    role: { type: String, trim: true, maxlength: 60, default: '' },
    company: { type: String, trim: true, maxlength: 100, default: '' },
    phone: { type: String, trim: true, maxlength: 30, default: '' },
    photo: { type: String, default: '' },
  },
  { timestamps: true },
);

export const KINDS = [
  'machines', 'spares', 'suppliers', 'warranties', 'services', 'schedules', 'inspections',
  'supplyOrders', 'partWarranties', 'partServices',
];

const recordSchema = new Schema(
  {
    workspace: { type: Schema.Types.ObjectId, required: true },
    kind: { type: String, enum: KINDS, required: true },
    data: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);
recordSchema.index({ workspace: 1, kind: 1 });

const messageSchema = new Schema(
  {
    workspace: { type: Schema.Types.ObjectId, required: true, index: true },
    from: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    toType: { type: String, enum: ['all', 'role', 'user'], required: true },
    toUser: { type: Schema.Types.ObjectId, ref: 'User' },
    toRole: { type: String, default: '' }, // lowercase key
    toRoleLabel: { type: String, default: '' },
    subject: { type: String, trim: true, maxlength: 120, default: '' },
    body: { type: String, required: true, trim: true, maxlength: 2000 },
    readBy: [{ type: Schema.Types.ObjectId }],
    hiddenBy: [{ type: Schema.Types.ObjectId }], // people who deleted it from their own view
  },
  { timestamps: true },
);

export const User = mongoose.model('User', userSchema);
export const Record = mongoose.model('Record', recordSchema);
export const Message = mongoose.model('Message', messageSchema);

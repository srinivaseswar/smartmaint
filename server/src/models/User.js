import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ["superadmin", "factory", "maintmgr", "mainteng", "inventory", "procurement", "supplier"], required: true },
  initials: { type: String, required: true, maxlength: 3 },
  active: { type: Boolean, default: true }
}, { timestamps: true });

userSchema.methods.checkPassword = function checkPassword(password) {
  return bcrypt.compare(password, this.passwordHash);
};

userSchema.statics.createWithPassword = async function createWithPassword(data) {
  const passwordHash = await bcrypt.hash(data.password, 12);
  return this.create({ ...data, passwordHash });
};

export default mongoose.model("User", userSchema);

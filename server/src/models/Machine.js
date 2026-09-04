import mongoose from "mongoose";

const machineSchema = new mongoose.Schema({
  assetTag: { type: String, required: true, unique: true, trim: true },
  name: { type: String, required: true, trim: true },
  line: { type: String, required: true, trim: true },
  criticality: { type: String, enum: ["Low", "Medium", "High", "Critical"], required: true },
  status: { type: String, enum: ["Running", "Idle", "Down", "Maintenance"], default: "Idle" },
  manufacturer: String,
  model: String,
  installationDate: Date
}, { timestamps: true });

export default mongoose.model("Machine", machineSchema);

import mongoose from "mongoose";

const charityStatsSchema = new mongoose.Schema({
  helpedCases: { type: Number, default: 0 },
  activeVolunteers: { type: Number, default: 0 },
  completedInitiatives: { type: Number, default: 0 },
  sponsoredFamilies: { type: Number, default: 0 },
  quranRegistration: { type: Boolean, default: false },
  footballRegistration: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model("CharityStats", charityStatsSchema);
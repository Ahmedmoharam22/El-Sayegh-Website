import mongoose from "mongoose";
const footballSchema = new mongoose.Schema({
  teamName: { type: String, required: true, trim: true },
  leaderName: { type: String, required: true },
  phone: { type: String, required: true },
  players: [
    {
      name: { type: String, required: true },
    }
  ],
  paymentStatus: { 
    type: String, 
    enum: ['لم يتم الدفع', 'تم الدفع'], 
    default: 'لم يتم الدفع' 
  },
  status: { 
    type: String, 
    enum: ['قيد المراجعة', 'مقبول', 'مرفوض'], 
    default: 'قيد المراجعة' 
  },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Football', footballSchema);

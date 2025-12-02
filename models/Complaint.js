const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String,
  status: { 
    type: String, 
    enum: ["Pending", "In Progress", "Resolved", "Rejected"], 
    default: "Pending" 
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User" ,// 👈 reference to the User who submitted the complaint
    required:true,
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Complaint", complaintSchema);





// const mongoose = require("mongoose");

// const complaintSchema = new mongoose.Schema({
//   studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//   category: String,
//   description: String,
//   status: { type: String, default: "Pending" },
//   date: { type: Date, default: Date.now },
// });

// module.exports = mongoose.model("Complaint", complaintSchema);

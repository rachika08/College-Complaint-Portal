const express = require("express");
const bcrypt = require("bcrypt");
const Admin = require("../models/Admin");
const Complaint = require("../models/Complaint");
const router = express.Router();

// Admin Login Page
router.get("/login", (req, res) => {
  res.render("admin/login", { error: null });
});

// Handle Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  console.log("Login Attempt:", email, password); 

  const admin = await Admin.findOne({ email });
  if (!admin) {
    console.log("No admin found");
    return res.render("admin/login", { error: "Invalid credentials" });
  }

  const valid = await bcrypt.compare(password, admin.password);
  console.log("Password match:", valid);

  if (!valid) {
    console.log("Incorrect password");
    return res.render("admin/login", { error: "Invalid credentials" });
  }

  req.session.adminId = admin._id;
  console.log("Admin logged in:", admin.email);
  res.redirect("/admin/dashboard");
});

// Protect Dashboard Route
function isAdminLoggedIn(req, res, next) {
  if (!req.session.adminId) {
    return res.redirect("/admin/login");
  }
  next();
}

// Admin Dashboard (Protected)
router.get("/dashboard", async (req, res) => {
  try {
    const complaints = await Complaint.find().populate("student", "name email");
    res.render("admin/dashboard", { complaints });
  } catch (err) {
    console.error("Error fetching complaints:", err);
    res.status(500).send("Error loading dashboard");
  }
});

// Update Complaint Status
router.post("/complaints/:id/status", isAdminLoggedIn, async (req, res) => {
  const { status, remark } = req.body;

  try {
    await Complaint.findByIdAndUpdate(req.params.id, {
      status,
      adminRemark: remark
    });

    req.flash("success", "Complaint status updated successfully!");
    res.redirect("/admin/dashboard");
  } catch (err) {
    console.error("Error updating status:", err);
    req.flash("error", "Something went wrong while updating status!");
    res.redirect("/admin/dashboard");
  }
});

// Logout
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/admin/login");
  });
});

module.exports = router;


























































// const express = require("express");
// const Complaint = require("../models/Complaint");
// const router = express.Router();

// // Admin Dashboard
// router.get("/dashboard", async (req, res) => {
//   const complaints = await Complaint.find().populate("studentId");
//   res.render("admin/dashboard", { complaints });
// });

// // Update status
// router.post("/update/:id", async (req, res) => {
//   const { status } = req.body;
//   await Complaint.findByIdAndUpdate(req.params.id, { status });
//   res.redirect("/admin/dashboard");
// });

// // Delete complaint
// router.post("/delete/:id", async (req, res) => {
//   await Complaint.findByIdAndDelete(req.params.id);
//   res.redirect("/admin/dashboard");
// });

// module.exports = router;

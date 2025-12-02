const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const Complaint = require("../models/Complaint");

const router = express.Router();

// Home page
router.get("/", (req, res) => res.render("index"));

// Register
router.get("/register", (req, res) => res.render("register"));
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  const newUser = new User({ name, email, password });
  await newUser.save();
  res.redirect("/login");
});

// Login
router.get("/login", (req, res) => res.render("login"));
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && (await bcrypt.compare(password, user.password))) {
    req.session.user = user;
    return user.role === "admin"
      ? res.redirect("/admin/dashboard")
      : res.redirect("/dashboard");
  }
  res.send("Invalid login details");
});

// Student Dashboard
router.get("/dashboard", async (req, res) => {
  if (!req.session.user) return res.redirect("/login");
  const complaints = await Complaint.find({ student: req.session.user._id });
  res.render("student/dashboard", { user: req.session.user, complaints });
});

// Add new complaint
router.get("/newComplaint", (req, res) => res.render("student/newComplaint"));
router.post("/newComplaint", async (req, res) => {
  const { category, description } = req.body;
  const newComplaint = new Complaint({
    student: req.session.user._id,
    category,
    description,
  });
  await newComplaint.save();
  res.redirect("/dashboard");
});

router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

module.exports = router;

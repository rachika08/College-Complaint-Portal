const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");
const Admin = require("./models/Admin");
const bcrypt = require("bcrypt");
const flash = require("connect-flash");


const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

app.use(flash());

app.use(
  session({
    secret: "complaintportal",
    resave: false,
    saveUninitialized: false,
  })
);

// Pass flash messages to all EJS templates
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// MongoDB connection
mongoose
  .connect("mongodb://127.0.0.1:27017/collegeComplaintDB")
  .then(async () => {
    console.log("✅ MongoDB Connected");
    await createDefaultAdmin(); // ✅ Create default admin after connection
  })
  .catch((err) => console.log(err));


app.use((req, res, next) => {
res.locals.user = req.session.user || null;
next();
});


// Routes
app.use("/", userRoutes);
app.use("/admin", adminRoutes);


// ===== Temporary Admin Creation Script =====
async function createDefaultAdmin() {
  try {
    const existing = await Admin.findOne({ email: "admin@college.com" });
    if (!existing) {
      await Admin.create({
        email: "admin@college.com",
        password: "admin123" // will be auto-hashed by the schema
      });
      console.log("✅ Default Admin Created Successfully!");
      console.log("👉 Email: admin@college.com");
      console.log("👉 Password: admin123");
    } else {
      console.log("ℹ️ Admin already exists. Skipping creation.");
    }
  } catch (err) {
    console.error("❌ Error creating default admin:", err);
  }
}

// app.get("/addUser", async (req, res) => {
//   const newUser = new User({
//     name: "Test User",
//     email: "test@example.com",
//     password: "12345",
//   });
//   await newUser.save();
//   res.send("✅ User added!");
// });
// Start server
app.listen(3000, () =>
  console.log("🚀 Server running on http://localhost:3000")
);

require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore=require("connect-mongo").default;
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
    secret: process.env.SESS_PSWD,
    resave: false,
    saveUninitialized: false,
    store:MongoStore.create({
      mongoUrl:process.env.MONGO_ATLAS_URL,
    }),
    cookie:{
      maxAge:1000*60*60*24,
    }
  })
);

// Pass flash messages to all EJS templates
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});


mongoose
  .connect(process.env.MONGO_ATLAS_URL)
  .then(async () => {
    console.log("MongoDB Connected");
    await createDefaultAdmin(); 
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
       
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PSWD
      });
      console.log("Default Admin Created Successfully!");
      
    } else {
      console.log("Admin already exists. Skipping creation.");
    }
  } catch (err) {
    console.error("Error creating default admin:", err);
  }
}


app.listen(process.env.PORT, () =>
  console.log("Server running")
);

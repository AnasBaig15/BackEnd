const express = require("express");
const app = express();
const path = require("path");
const cookieParser = require("cookie-parser");
const expressSession = require("express-session");
const flash = require("connect-flash");

require("dotenv").config();
const db = require("./config/mongoose-connection");

const deleteRouter = require("./routes/delete");
const transactionRouter = require("./routes/Debit_Credit");
const userRouter = require("./routes/userRouter");
const adminRouter = require("./routes/admin");
const profitRouter = require("./routes/profit");
const editRouter = require("./routes/edit");
const allRouter = require("./routes/all");

const adminRouters = require('./routes/admin');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  expressSession({
    resave: false,
    saveUninitialized: false,
    secret: process.env.JWT_KEY,
  })
);
app.use(flash());
app.use(express.static(path.join(__dirname, "public")));

app.use("/transactions", transactionRouter);
app.use("/delete", deleteRouter);
app.use("/users", userRouter);
app.use("/profit", profitRouter);
app.use("/edit", editRouter);
app.use("/admin", adminRouter);
app.use("/all", allRouter);
app.use("/",adminRouters)


const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

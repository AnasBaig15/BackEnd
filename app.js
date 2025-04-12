const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const expressSession = require("express-session");
const flash = require("connect-flash");
const cors = require("cors");
const compression = require("compression");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const MongoStore = require("connect-mongo");
require("dotenv").config();
const db = require("./config/mongoose-connection");

const app = express();

app.use(helmet());
app.use(compression());
app.set('trust proxy', 1);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later.',
  skip: (req) => req.path === '/api/v1/health'
});
app.use(limiter);

const allowedOrigins = [
  "http://localhost:5173",                     
  "https://khata.martendigitals.com",          
  "https://khata-system.vercel.app"            
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Blocked by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"]
}));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

app.use(
  expressSession({
    name: "session",
    resave: false,
    saveUninitialized: false,
    secret: process.env.JWT_KEY,
    store: MongoStore.create({
      client: db.getClient(),
      ttl: 24 * 60 * 60
    }),
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      domain: process.env.NODE_ENV === 'production' ? '.martendigitals.com' : undefined,
    }
  })
);

app.use(flash());

const apiBase = "/api/v1";
const routers = [
  require("./routes/delete"),
  require("./routes/Debit_Credit"),
  require("./routes/userRouter"),
  require("./routes/admin"),
  require("./routes/profit"),
  require("./routes/edit"),
  require("./routes/all")
];

app.use(`${apiBase}/transactions`, routers[1]);
app.use(`${apiBase}/delete`, routers[0]);
app.use(`${apiBase}/users`, routers[2]);
app.use(`${apiBase}/profit`, routers[4]);
app.use(`${apiBase}/edit`, routers[5]);
app.use(`${apiBase}/admin`, routers[3]);
app.use(`${apiBase}/all`, routers[6]);

// ========== Health Check Endpoint ========== //
// app.get(`${apiBase}/health`, (req, res) => {
//   res.status(200).json({ 
//     status: 'healthy',
//     environment: process.env.NODE_ENV,
//     timestamp: new Date().toISOString()
//   });
// });

app.use((err, req, res, next) => {
  if (err.message.includes('CORS')) {
    return res.status(403).json({ error: "Origin not allowed" });
  }
  res.status(500).json({ error: "Server error" });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`✅ Pure API backend running on port ${PORT}`);
});
module.exports = app;
// DB CREDENTIAL
// baiganas674
// x2PV5s5kG2Evnwc4
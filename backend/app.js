import express from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import db from './config/db.js';
import './config/passport.js';
import listingRoutes from './routes/listings.js';
import reviewRoutes from './routes/reviews.js';
import userRoutes from './routes/users.js';
import path from 'path';
import expressMysqlSession from 'express-mysql-session';

db.query("SELECT 1")
  .then(() => console.log("✅ Connected to remote MySQL database"))
  .catch((err) => console.error("❌ DB connection failed:", err));






const MySQLStore = expressMysqlSession(session);
const __dirname = path.resolve();
const app = express();

dotenv.config();

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads', express.static('uploads'));


// Enable CORS for frontend with credentials
app.use(cors({
  origin: 'https://staynest-chi.vercel.app', 
  credentials: true, // allow cookies
}));

// Parsing middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Session store configuration
let sessionStore;

try {
  sessionStore = new MySQLStore({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  sessionStore.on('error', function (error) {
    console.error('MySQLStore error:', error);
  });

} catch (err) {
  console.error('Failed to create MySQL session store:', err);
}


app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});


// Setup express-session
app.use(session({
  key: 'staynest_session_id',
  secret: 'yourSecretKey',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false, // set to true if using HTTPS
    sameSite: 'lax', // allows cross-site cookies on navigation
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  }
}));

// Passport setup
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/users', userRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

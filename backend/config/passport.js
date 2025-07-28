import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcryptjs';
import db from './db.js';

passport.use(new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) return done(err);
    if (results.length === 0) return done(null, false, { message: 'User not found.' });

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return done(null, false, { message: 'Invalid credentials.' });

    return done(null, user);
  });
}));

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser((id, done) => {
  db.query('SELECT * FROM users WHERE id = ?', [id], (err, results) => {
    if (err) return done(err);
    done(null, results[0]);
  });
});

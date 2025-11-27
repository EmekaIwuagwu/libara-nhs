const User = require('../models/User');
const { sendEmail } = require('../config/email');

exports.showLogin = (req, res) => {
  // Store messages in local variables
  const errors = req.session.errors || [];
  const oldInput = req.session.oldInput || {};
  const errorMessage = req.session.errorMessage || null;
  const successMessage = req.session.successMessage || null;

  // Clear session messages immediately
  delete req.session.errors;
  delete req.session.oldInput;
  delete req.session.errorMessage;
  delete req.session.successMessage;

  // Render with stored values
  res.render('auth/login', {
    title: 'Login - LibaraNHS',
    errors,
    oldInput,
    errorMessage,
    successMessage
  });
};

exports.login = async (req, res) => {
  const { username, password, remember } = req.body;

  try {
    console.log('✓ Login attempt for:', username);

    // Find user by username or email
    const user = await User.findByUsernameOrEmail(username);

    if (!user) {
      console.log('✗ User not found:', username);
      req.session.errorMessage = 'Invalid username or password';
      req.session.oldInput = { username };
      return res.redirect('/login');
    }

    console.log('✓ User found. ID:', user.id);

    // Verify password
    const isValidPassword = await User.verifyPassword(password, user.password);

    if (!isValidPassword) {
      console.log('[LOGIN] Invalid password for user:', username);
      req.session.errorMessage = 'Invalid username or password';
      req.session.oldInput = { username };
      return res.redirect('/login');
    }

    console.log('[LOGIN] Password valid, user ID:', user.id);

    // Regenerate session ID for security before setting user data
    req.session.regenerate((err) => {
      if (err) {
        console.error('Session regeneration error:', err);
        req.session.errorMessage = 'Login failed due to session error. Please try again.';
        return res.redirect('/login');
      }

      // Set user data in the new session
      req.session.userId = user.id;
      req.session.userEmail = user.email;

      // Extend session if remember me is checked
      if (remember) {
        req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
      }

      // Get return URL before saving
      const returnTo = req.session.returnTo || '/dashboard';
      delete req.session.returnTo;

      // Explicitly save session before redirecting
      req.session.save((saveErr) => {
        if (saveErr) {
          console.error('Session save error:', saveErr);
          req.session.errorMessage = 'Login failed due to session error. Please try again.';
          return res.redirect('/login');
        }
        res.redirect(returnTo);
      });
    });
  } catch (error) {
    console.error('✗ Login error:', error);
    req.session.errorMessage = 'An error occurred during login. Please try again.';
    res.redirect('/login');
  }
};

exports.showRegister = (req, res) => {
  // Store messages in local variables
  const errors = req.session.errors || [];
  const oldInput = req.session.oldInput || {};
  const errorMessage = req.session.errorMessage || null;

  // Clear session data immediately
  delete req.session.errors;
  delete req.session.oldInput;
  delete req.session.errorMessage;

  // Render with stored values
  res.render('auth/register', {
    title: 'Register - LibaraNHS',
    errors,
    oldInput,
    errorMessage
  });
};

exports.register = async (req, res) => {
  const { first_name, last_name, email, username, password, phone } = req.body;

  try {
    console.log('[REGISTER] Starting registration for username:', username);

    // Check if email already exists
    const existingEmail = await User.findByEmail(email);
    if (existingEmail) {
      console.log('[REGISTER] Email already exists:', email);
      req.session.errorMessage = 'Email address is already registered';
      req.session.oldInput = req.body;
      return res.redirect('/register');
    }

    // Check if username already exists
    const existingUsername = await User.findByUsername(username);
    if (existingUsername) {
      console.log('[REGISTER] Username already exists:', username);
      req.session.errorMessage = 'Username is already taken';
      req.session.oldInput = req.body;
      return res.redirect('/register');
    }

    // Create user
    console.log('[REGISTER] Creating user...');
    const userId = await User.create({
      first_name,
      last_name,
      email,
      username,
      password,
      phone
    });
    console.log('[REGISTER] User created successfully with ID:', userId);

    // Send welcome email
    await sendEmail(email, 'welcome', {
      firstName: first_name
    });

    // Regenerate session ID for security before setting user data
    console.log('[REGISTER] Regenerating session...');
    req.session.regenerate((err) => {
      if (err) {
        console.error('[REGISTER] Session regeneration error:', err);
        // Can't use session here as it may be destroyed, redirect to login page
        return res.redirect('/login?message=registration_complete');
      }

      console.log('[REGISTER] Session regenerated, setting user data...');
      // Set user data in the new session
      req.session.userId = userId;
      req.session.userEmail = email;
      req.session.successMessage = 'Registration successful! Welcome to LibaraNHS.';

      // Explicitly save session before redirecting
      console.log('[REGISTER] Saving session...');
      req.session.save((saveErr) => {
        if (saveErr) {
          console.error('[REGISTER] Session save error:', saveErr);
          return res.redirect('/login?message=registration_complete');
        }
        console.log('[REGISTER] Session saved, redirecting to dashboard. UserID:', userId);
        res.redirect('/dashboard');
      });
    });
  } catch (error) {
    console.error('✗ Registration error:', error);
    req.session.errorMessage = `Registration failed: ${error.message}`;
    req.session.oldInput = req.body;
    res.redirect('/register');
  }
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect('/');
  });
};

module.exports = exports;

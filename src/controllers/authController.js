const User = require('../models/User');
const { sendEmail } = require('../config/email');

exports.showLogin = (req, res) => {
  res.render('auth/login', {
    title: 'Login - LibaraNHS',
    errors: req.session.errors || [],
    oldInput: req.session.oldInput || {},
    errorMessage: req.session.errorMessage || null,
    successMessage: req.session.successMessage || null
  });

  // Clear session messages
  delete req.session.errors;
  delete req.session.oldInput;
  delete req.session.errorMessage;
  delete req.session.successMessage;
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
      console.log('✗ Invalid password for:', username);
      req.session.errorMessage = 'Invalid username or password';
      req.session.oldInput = { username };
      return res.redirect('/login');
    }

    console.log('✓ Password verified');

    // Set session
    req.session.userId = user.id;
    req.session.userEmail = user.email;

    // Extend session if remember me is checked
    if (remember) {
      req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
    }

    console.log('✓ Session set. UserID:', user.id, 'SessionID:', req.sessionID);

    // Regenerate session ID for security
    req.session.regenerate((err) => {
      if (err) {
        console.error('✗ Session regeneration error:', err);
      }

      // Restore user data after regeneration
      req.session.userId = user.id;
      req.session.userEmail = user.email;

      // Redirect to intended page or dashboard
      const returnTo = req.session.returnTo || '/dashboard';
      delete req.session.returnTo;
      console.log('✓ Redirecting to:', returnTo);
      res.redirect(returnTo);
    });
  } catch (error) {
    console.error('✗ Login error:', error);
    req.session.errorMessage = 'An error occurred during login. Please try again.';
    res.redirect('/login');
  }
};

exports.showRegister = (req, res) => {
  res.render('auth/register', {
    title: 'Register - LibaraNHS',
    errors: req.session.errors || [],
    oldInput: req.session.oldInput || {}
  });

  // Clear session data
  delete req.session.errors;
  delete req.session.oldInput;
};

exports.register = async (req, res) => {
  const { first_name, last_name, email, username, password, phone } = req.body;

  try {
    console.log('✓ Registration attempt for:', { email, username });

    // Check if email already exists
    const existingEmail = await User.findByEmail(email);
    if (existingEmail) {
      console.log('✗ Email already exists:', email);
      req.session.errorMessage = 'Email address is already registered';
      req.session.oldInput = req.body;
      return res.redirect('/register');
    }

    // Check if username already exists
    const existingUsername = await User.findByUsername(username);
    if (existingUsername) {
      console.log('✗ Username already exists:', username);
      req.session.errorMessage = 'Username is already taken';
      req.session.oldInput = req.body;
      return res.redirect('/register');
    }

    // Create user
    console.log('✓ Creating user...');
    const userId = await User.create({
      first_name,
      last_name,
      email,
      username,
      password,
      phone
    });
    console.log('✓ User created with ID:', userId);

    // Try to send welcome email (don't fail registration if email fails)
    try {
      await sendEmail(email, 'welcome', {
        firstName: first_name
      });
      console.log('✓ Welcome email sent');
    } catch (emailError) {
      console.error('✗ Email failed (continuing anyway):', emailError.message);
    }

    // Auto-login the user - regenerate session for security
    req.session.regenerate((err) => {
      if (err) {
        console.error('✗ Session regeneration error:', err);
        req.session.errorMessage = 'Registration successful but login failed. Please login manually.';
        return res.redirect('/login');
      }

      // Set user data after regeneration
      req.session.userId = userId;
      req.session.userEmail = email;
      req.session.successMessage = 'Registration successful! Welcome to LibaraNHS.';

      console.log('✓ Session set. UserID:', userId, 'SessionID:', req.sessionID);
      console.log('✓ Redirecting to /dashboard');
      res.redirect('/dashboard');
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

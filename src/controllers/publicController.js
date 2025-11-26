// Public website controller

exports.home = (req, res) => {
  res.render('public/home', {
    title: 'LibaraNHS - Automate Your NHS Job Applications',
    page: 'home'
  });
};

exports.about = (req, res) => {
  res.render('public/about', {
    title: 'About Us - LibaraNHS',
    page: 'about'
  });
};

exports.services = (req, res) => {
  res.render('public/services', {
    title: 'Our Services - LibaraNHS',
    page: 'services'
  });
};

exports.contact = (req, res) => {
  res.render('public/contact', {
    title: 'Contact Us - LibaraNHS',
    page: 'contact',
    errors: req.session.errors || [],
    oldInput: req.session.oldInput || {}
  });

  // Clear session errors and old input
  delete req.session.errors;
  delete req.session.oldInput;
};

exports.submitContact = async (req, res) => {
  const { name, email, subject, message } = req.body;

  try {
    // Here you would typically send an email or save to database
    console.log('Contact form submission:', { name, email, subject, message });

    // For now, just redirect with success message
    req.session.successMessage = 'Thank you for your message! We\'ll get back to you soon.';
    res.redirect('/contact');
  } catch (error) {
    console.error('Contact form error:', error);
    req.session.errorMessage = 'An error occurred. Please try again.';
    res.redirect('/contact');
  }
};

module.exports = exports;

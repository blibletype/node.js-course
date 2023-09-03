const User = require('../models/user');
const bcrypt = require('bcryptjs');

exports.getSignIn = (req, res) => {
  res.render('auth/sign-in', {
    docTitle: 'Sign In',
    path: '/signin',
  });
};

exports.postSignIn = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email });
    if (!user) return res.redirect('/');
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) return res.redirect('/');
    req.session.user = user;
    req.session.save(() => {
      res.redirect('/products');
    });
  } catch (err) {
    console.log(err);
  }
};

exports.postSignOut = async (req, res) => {
  req.session.destroy((err) => {
    if (err) console.log(err);
    res.redirect('/');
  });
};

exports.getSignUp = async (req, res) => {
  res.render('auth/sign-up', {
    docTitle: 'Sign Up',
    path: '/signup',
  });
};

exports.postSignUp = async (req, res) => {
  const { email, password, passwordConfirmation } = req.body;
  try {
    const user = await User.findOne({ email: email });
    if (user) return res.redirect('/signup');

    const hashedPassword = await bcrypt.hash(password, 12);
    await User.create({
      email: email,
      password: hashedPassword,
      cart: { items: [] },
    });
    res.redirect('/signin');
  } catch (err) {
    console.log(err);
  }
};

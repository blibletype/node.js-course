require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const path = require('path');
const csrf = require('csurf')();
const flash = require('connect-flash');

const PORT = process.env.PORT || 3000;
const app = express();

const store = new MongoDBStore({
  uri: process.env.DB_URI,
  collection: 'sessions',
});

app.set('view engine', 'pug');
app.set('views', './src/views');

const mongoose = require('mongoose');
const User = require('./models/user');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
const errorController = require('./controllers/errorController');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  session({
    secret: 'kUngiMh4#ng.bH4Ngl',
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);
app.use(csrf);
app.use(flash());

app.use(async (req, res, next) => {
  try {
    if (!req.session.user) return next();
    const user = await User.findById(req.session.user._id);
    req.user = user;
    next();
  } catch (err) {
    console.log(err);
  }
});

app.use((req, res, next) => {
  res.locals.isAuth = req.session.user;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.pageNotFound);

mongoose.connect(process.env.DB_URI).then(() => {
  app.listen(PORT);
  console.log(`app listening at http://localhost:${PORT}`);
});

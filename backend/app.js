require("dotenv").config();
var createError = require('http-errors');
var express = require('express');
var { randomUUID } = require('crypto');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
let mongoose = require('mongoose');
let db = process.env.MONGODB_URI;
let cors = require('cors');


const uploadRoutes = require('./routes/uploadImages');
var indexRouter = require('./routes/index');
let usersRouter = require('./routes/user');
let productsRouter = require('./routes/products');
let cartRouter = require('./routes/cart');
let wishListRouter = require('./routes/wishList');
let orderRouter = require('./routes/order');
let { verify } = require('./middlewares/auth');
let reviewRouter = require('./routes/review');
let adminRouter = require('./routes/adminDashboard');
let brandRouter = require('./routes/brand');
let newsletterRouter = require('./routes/newsletter');
let mmpayRouter = require('./MMpay/MMpay');


var app = express();

console.info('[CART_DIAG] MongoDB connection attempt');
mongoose.connect(db)
  .then(() => console.info('[CART_DIAG] MongoDB connection succeeded'))
  .catch((err) => console.error('[CART_DIAG] MongoDB connection failed', {
    name: err.name,
    code: err.code,
  }));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use((req, res, next) => {
  req.requestId = randomUUID();
  next();
});
app.use(cors());
app.use(logger('dev'));
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/upload', uploadRoutes);
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/products', productsRouter);
app.use('/carts', verify, cartRouter);
app.use('/wishLists', verify, wishListRouter);
app.use('/orders', verify, orderRouter);
app.use('/reviews', reviewRouter);
app.use('/admin', adminRouter);
app.use('/brands', brandRouter);
app.use('/newsletter', newsletterRouter);
app.use('/', mmpayRouter);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler

app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  if (err instanceof mongoose.Error.ValidationError) {
    console.log('This is a Mongoose validation error!');

    // You can loop through the individual field errors
    Object.keys(err.errors).forEach((key) => {
      console.log(`${key}: ${err.errors[key].message}`);
    })
  }
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

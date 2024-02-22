const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const path = require('path');
const compression = require('compression');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

/*
app.use((req, res, next) => {
    next();
});
*/

//  serving static files
// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public')));

// 1)Global  Middlewares

app.use(helmet());

app.use(compression());

// Enable CORS for all routes
app.use(cors());

// Development logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Limit requests from same API
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, Please try again in an hour!',
});

app.use('/api', limiter);

// Body parser, reading data from body into req.body and limit body parser data limit
app.use(
    express.json({
        limit: '10kb',
    }),
);
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

//  Data Sanitization against NoSQL  query injection
app.use(mongoSanitize());
// Data Sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
    hpp({
        whitelist: [
            'duration',
            'ratingsAverage',
            'ratingsQuality',
            'maxGroupSize',
            'difficulty',
            'price',
        ],
    }),
);

// 3) Routes

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
    // console.log(req.url);
    return next(
        new AppError(`Can\'t find ${req.originalUrl} on this server`, 404),
    );
});

app.use(globalErrorHandler);

module.exports = app;

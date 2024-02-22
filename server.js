const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

// Safety Net
process.on('uncaughtException', (error) => {
    console.log('UNCAUGHT EXCEPTION! 💣 App Shutting down...');
    console.log(error.message);
    process.exit(1);
});

const app = require('./app');
const DB = process.env.DATABASE.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD,
);

// Connecting Local Database
/*mongoose.connect(process.env.DATABASE_LOCAL, {
    useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
}).then(con =>{});*/

// ***************************************   Remote Database ******************************************************************
/*mongoose
    .connect(process.env.DATABASE_LOCAL)
    .then((con) => console.log('DB Connected Successfully'));*/

// ***************************************   Remote Database ******************************************************************
mongoose
    .connect(DB)
    .then((con) => {
        console.log('Database Connected Successful');
    })
    .catch((err) => console.log(err));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`App running on port ${port}`);
});

process.on('unhandledRejection', (err) => {
    console.log('UNHANDLED REJECTION! 💣 Shutting down...');
    console.log(err);
    server.close(() => {
        process.exit(1);
    });
});

const Tour = require('./../models/tourModel');

exports.aliasTopTours = (req, res, next) => {
    req.query.imit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';

    next();
};

exports.getAllTours = async (req, res) => {
    try {
        // Build Query
        // 1A) Filtering
        const filterQuery = { ...req.query }; // creating hard copy of object
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach((el) => delete filterQuery[el]); // using delete operator we delete fields from object

        // 1B) Advanced Filtering
        let queryStr = JSON.stringify(filterQuery);
        queryStr = queryStr.replace(
            /\b(gte|gt|lte|lt)\b/g,
            (match) => `$${match}`,
        );
        let query = Tour.find(JSON.parse(queryStr)); // building query

        // 2) Sorting
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join();
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createdAt'); // sorting by newest ones first
        }

        // 3) Limiting Fields
        if (req.query.fields) {
            const fields = req.query.fields.split(',').join(' ');
            query = query.select(fields);
        } else {
            query = query.select('-__v');
        }

        // 4) Pagination
        const page = req.query.page * 1 || 1;
        const limit = req.query.limit * 1 || 10;
        const skip = (page - 1) * limit;
        query = query.skip(skip).limit(limit);

        if (req.query.page) {
            const numTours = await Tour.countDocuments();
            if (skip >= numTours) throw new Error('This page does not exist');
        }

        // EXECUTE QUERY
        const tours = await query; // executing query

        // or this way to write query
        // const tours = await Tour.find().where('duration').equals(5).where('difficulty').equals('easy');
        //sending response
        res.status(200).json({
            status: 'success',
            results: tours.length,
            data: {
                tours,
            },
        });
    } catch (err) {
        res.status(400).json({
            status: 'Fail',
            message: 'Invalid data sent',
        });
    }
};

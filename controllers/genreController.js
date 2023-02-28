const Genre = require("../models/genre");
const Book = require("../models/book");
const { body, validationResult } = require("express-validator");
const async = require("async");
// Display list of all Genre.
exports.genre_list = (req, res) => {
	Genre.find({}, (err, genre) => {
		res.render("genre_list", { title: "Genre List", genres: genre });
	});
};

// Display detail page for a specific Genre.
exports.genre_detail = (req, res, next) => {
	async.parallel(
		{
			genre(callback) {
				Genre.findById(req.params.id).exec(callback);
			},
			genre_books(callback) {
				Book.find({ genre: req.params.id }).exec(callback);
			},
		},
		(err, results) => {
			err && next(err);
			if (results.genre == null) {
				const err = new Error("Genre not found!");
				err.status = 404;
				return next(err);
			}
			res.render("genre_detail", {
				title: "Genre Details",
				genre: results.genre,
				genre_books: results.genre_books,
			});
		}
	);
};

// Display Genre create form on GET.
exports.genre_create_get = (req, res) => {
	res.render("genre_form", { title: "Create Genre" });
};

// Handle Genre create on POST.
exports.genre_create_post = [
	body("name", "Only alphabetic characters can be created")
		.trim()
		.isString()
		.isLength({ min: 1 })
		.escape(),
	(req, res, next) => {
		const errors = validationResult(req);

		const genre = new Genre({ name: req.body.name });

		if (!errors.isEmpty()) {
			res.render("genre_form", {
				title: "Create Genre",
				genre,
				errors: errors.array(),
			});
			return;
		} else {
			Genre.findOne({ name: req.body.name }).exec((err, found_genre) => {
				err && next(err);
				if (found_genre) {
					res.redirect(found_genre.url);
				} else {
					genre.save((err) => {
						err && next(err);
						res.redirect(genre.url);
					});
				}
			});
		}
	},
];

// Display Genre delete form on GET.
exports.genre_delete_get = (req, res) => {
	res.send("NOT IMPLEMENTED: Genre delete GET");
};

// Handle Genre delete on POST.
exports.genre_delete_post = (req, res) => {
	res.send("NOT IMPLEMENTED: Genre delete POST");
};

// Display Genre update form on GET.
exports.genre_update_get = (req, res) => {
	res.send("NOT IMPLEMENTED: Genre update GET");
};

// Handle Genre update on POST.
exports.genre_update_post = (req, res) => {
	res.send("NOT IMPLEMENTED: Genre update POST");
};

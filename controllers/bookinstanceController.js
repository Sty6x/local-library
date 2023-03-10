const BookInstance = require("../models/bookinstance");
const Book = require("../models/book");
const { body, validationResult } = require("express-validator");
const async = require("async");
// Display list of all BookInstances.
exports.bookinstance_list = (req, res) => {
	BookInstance.find()
		.populate("book")
		.exec(function (err, list_bookinstances) {
			console.log(list_bookinstances);
			err && next(err);
			res.render("bookinstance_list", {
				title: "Book Instance List",
				bookinstance_list: list_bookinstances,
			});
		});
};

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = (req, res, next) => {
	BookInstance.findById(req.params.id)
		.populate("book")
		.exec((err, bookinstance) => {
			if (err) {
				return next(err);
			}
			if (bookinstance == null) {
				// No results.
				const err = new Error("Book copy not found");
				err.status = 404;
				return next(err);
			}
			// Successful, so render.
			res.render("bookinstance_detail", {
				title: `Copy: ${bookinstance.book.title}`,
				bookinstance,
			});
		});
};

// Display BookInstance create form on GET.
exports.bookinstance_create_get = (req, res, next) => {
	Book.find({}, "title").exec((err, books) => {
		err && next(err);
		res.render("bookinstance_form", {
			title: "Create BookInstance",
			book_list: books,
		});
	});
};

// Handle BookInstance create on POST.
exports.bookinstance_create_post = [
	body("book", "Book must be specified").trim().isLength({ min: 1 }).escape(),
	body("imprint", "Imprint must be specified")
		.trim()
		.isLength({ min: 1 })
		.escape(),
	body("status").escape(),
	body("due_back", "Invalid date")
		.optional({ checkFalsy: true })
		.isISO8601()
		.toDate(),
	(req, res, next) => {
		const errors = validationResult(req);

		const bookinstance = new BookInstance({
			book: req.body.book,
			imprint: req.body.imprint,
			status: req.body.status,
			due_back: req.body.due_back,
		});
		if (!errors.isEmpty()) {
			Book.find({}, "title").exec((err, books) => {
				err && next(err);
				res.render("bookinstance_form", {
					title: "Create BookInstance",
					book_list: books,
					errors: errors.array(),
					bookinstance,
				});
			});
			return;
		}
		bookinstance.save((err) => {
			err && next(err);
			res.redirect(bookinstance.url);
		});
	},
];

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = (req, res, next) => {
	BookInstance.findById(req.params.id)
		.populate("book")
		.exec((err, instance) => {
			err && next(err);
			res.render("bookinstance_delete", {
				title: "Delete Copy",
				book_instance: instance,
			});
		});
};

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = (req, res, next) => {
	BookInstance.findByIdAndRemove(req.body.bookinstanceid, (err, instance) => {
		err && next(err);
		res.redirect("/catalog/bookinstances");
	});
};

// Display BookInstance update form on GET.
exports.bookinstance_update_get = (req, res, next) => {
	async.parallel(
		{
			bookinstance(callback) {
				BookInstance.findById(req.params.id)
					.populate("book")
					.exec(callback);
			},
			books(callback) {
				Book.find({}, "title").exec(callback);
			},
		},
		(err, results) => {
			console.log(results);
			err && next(err);
			res.render("bookinstance_form", {
				title: "Update Book",
				book_list: results.books,
				bookinstance: results.bookinstance,
			});
		}
	);
};

// Handle bookinstance update on POST.
exports.bookinstance_update_post = [
	body("book", "Book must be specified").trim().isLength({ min: 1 }).escape(),
	body("imprint", "Imprint must be specified")
		.trim()
		.isLength({ min: 1 })
		.escape(),
	body("status").escape(),
	body("due_back", "Invalid date")
		.optional({ checkFalsy: true })
		.isISO8601()
		.toDate(),

	(req, res, next) => {
		const errors = validationResult(req);
		const new_bookinstance = new BookInstance({
			book: req.body.book,
			imprint: req.body.imprint,
			due_back: req.body.due_back,
			status: req.body.status,
			_id: req.params.id,
		});

		if (!errors.isEmpty()) {
			async.parallel(
				{
					bookinstance(callback) {
						BookInstance.findById(req.params.id)
							.populate("book")
							.exec(callback);
					},
					books(callback) {
						Book.find({}, "title").exec(callback);
					},
				},
				(err, results) => {
					console.log(results);
					err && next(err);
					res.render("bookinstance_form", {
						title: "Update Book",
						book_list: results.books,
						bookinstance: results.bookinstance,
						errors: errors.array(),
					});
				}
			);
			return;
		}
		BookInstance.findByIdAndUpdate(
			req.params.id,
			new_bookinstance,
			{},
			(err, update_instance) => {
				err && next(err);
				res.redirect(update_instance.url);
			}
		);
	},
];

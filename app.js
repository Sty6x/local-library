var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const MongoDB =
	"mongodb+srv://francis:demo1234@cluster0.kqzcqhx.mongodb.net/localLibrary?retryWrites=true&w=majority";

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

async function connectToDB() {
	await mongoose.connect(MongoDB);
}
app.use((req, res, next) => {
	connectToDB().catch((err) => console.log(err));
	next();
});
app.use("/", indexRouter);
app.use("/users", usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get("env") === "development" ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render("error");
});

const Schema = mongoose.Schema;
const someSchema = new Schema({ name: String, title: String, reviews: Number });
const model = mongoose.model("authors", someSchema);
const modelInstance = new model({
	name: "ME",
	title: "CSGO",
	reviews: 0.1,
});
modelInstance.save((err, data) => {
	if (err) return console.log(err);
	console.log(data);
});

modelInstance.name = "New Name";
modelInstance.save((err, data) => {
	if (err) return console.log(err);
	console.log(data);
});
module.exports = app;

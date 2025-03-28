const express = require("express");
const morgan =require("morgan");
const httpErrors = require("http-errors");
const bodyParser = require("body-parser");
const db = require("./models");
const WallpaperRouter = require("./routes/wallpaper.route");
const UserRouter = require("./routes/user.route");
const AlbumRouter = require("./routes/album.route");
const ReportRouter = require("./routes/report.route");
const AuthRouter = require("./routes/auth.route");
const cors = require("cors");
require("dotenv").config();


// Khoi tao ung dung Express web server
const app = express();

// Them cac middlewares kiem soat cac requests, responses
app.use(morgan("dev"));
app.use(cors({
    origin: "http://localhost:3000", // Đảm bảo đúng với URL frontend
    credentials: true,  // QUAN TRỌNG: Cho phép gửi cookie
  }));
app.use(bodyParser.json());

// Dinh tuyen tai cap do root (root router)
app.get("/", async (req, res, next) => {
    res.status(200).json({message: "Welcome to RESTFul API - NodeJS web server"});
});

// tiep nhan request
app.use("/wallpapers", WallpaperRouter);
app.use("/users", UserRouter);
app.use("/albums", AlbumRouter);
app.use("/reports", ReportRouter);
app.use("/auth", AuthRouter);
// Them middleware kiem soat requests loi cho web server
app.use(async(req, res, next) => {
    next(httpErrors.BadRequest());
});

app.use(async(err, req, res, next) => {
    res.status = err.status || 500;
    res.send({message: {status: err.status, message: err.message}});
});

// Thiet lap hoat dong tiep nhan requests va hoi dap responses
const port = process.env.PORT_NUMBER || 8080;
const hostname = process.env.HOST_NAME || "localhost";
app.listen(port, hostname, () => {
    console.log(`Server running at: http://${hostname}:${port}`); 
    db.connectDB();
});

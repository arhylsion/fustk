const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

let databaseConnection = "Waiting for database response...";

router.get('/', function(req, res, next) {
    res.send(databaseConnection);
});

mongoose.connect("mongodb://mongodb:27017/test");

mongoose.connection.on("error", error => {
    console.log("Database connection error:", error);
    databaseConnection = "error connection database";
});

mongoose.connection.once("open", () => {
    console.log("Connected to database!");
    databaseConnection = "Connected to database";
});

module.exports = router;
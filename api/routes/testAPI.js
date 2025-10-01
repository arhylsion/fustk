var express = require("express");
var router = express.Router();

router.get("/", function(req, res, next) {
    res.send("API Is working properly!");
});
module.exports = router;
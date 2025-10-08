var express = require('express');
var router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  updateUser,
  deleteUser,
} = require("../controllers/userController");

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.put('/update', protect, updateUser);
router.delete('/delete', protect, deleteUser);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
    getSettings,
    getSetting,
    updateSetting,
    deleteSetting,
} = require('../controllers/settingController');
const { protect, admin } = require('../middleware/auth');

router.route('/').get(protect, getSettings);

router
    .route('/:key')
    .get(protect, getSetting)
    .put(protect, admin, updateSetting)
    .delete(protect, admin, deleteSetting);

module.exports = router;

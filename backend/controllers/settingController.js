const Setting = require('../models/Setting');

// @desc    Get all settings
// @route   GET /api/settings
// @access  Private
const getSettings = async (req, res) => {
    try {
        const settings = await Setting.find();

        // Convert to key-value object
        const settingsObj = {};
        settings.forEach((setting) => {
            settingsObj[setting.key] = setting.value;
        });

        res.json({
            success: true,
            data: settingsObj,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get single setting
// @route   GET /api/settings/:key
// @access  Private
const getSetting = async (req, res) => {
    try {
        const setting = await Setting.findOne({ key: req.params.key });

        if (!setting) {
            return res.status(404).json({
                success: false,
                message: 'Setting not found',
            });
        }

        res.json({
            success: true,
            data: setting,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Update or create setting
// @route   PUT /api/settings/:key
// @access  Private/Admin
const updateSetting = async (req, res) => {
    try {
        const { value, description } = req.body;

        let setting = await Setting.findOne({ key: req.params.key });

        if (setting) {
            // Update existing setting
            setting = await Setting.findOneAndUpdate(
                { key: req.params.key },
                { value, description },
                { new: true, runValidators: true }
            );
        } else {
            // Create new setting
            setting = await Setting.create({
                key: req.params.key,
                value,
                description,
            });
        }

        res.json({
            success: true,
            data: setting,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Delete setting
// @route   DELETE /api/settings/:key
// @access  Private/Admin
const deleteSetting = async (req, res) => {
    try {
        const setting = await Setting.findOne({ key: req.params.key });

        if (!setting) {
            return res.status(404).json({
                success: false,
                message: 'Setting not found',
            });
        }

        await Setting.findOneAndDelete({ key: req.params.key });

        res.json({
            success: true,
            message: 'Setting deleted successfully',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    getSettings,
    getSetting,
    updateSetting,
    deleteSetting,
};

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All routes need authentication
router.use(auth_1.authenticate);
// Get user profile
router.get('/profile', async (req, res) => {
    res.json({
        success: true,
        data: req.user
    });
});
exports.default = router;
//# sourceMappingURL=user.routes.js.map
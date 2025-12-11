"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
// Team routes would go here
router.get('/', (req, res) => {
    res.json({ message: 'Get all teams' });
});
exports.default = router;
//# sourceMappingURL=team.routes.js.map
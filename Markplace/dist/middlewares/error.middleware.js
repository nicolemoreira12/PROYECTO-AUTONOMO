"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
function errorHandler(err, req, res, next) {
    console.error("❌ Error:", err);
    res.status(500).json({ message: "Error interno del servidor" });
}

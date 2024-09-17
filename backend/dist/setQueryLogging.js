"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setQueryLogging = setQueryLogging;
function setQueryLogging(dataSource, enable) {
    dataSource.setOptions({
        logging: enable,
        logger: "advanced-console"
    });
}

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const entities_1 = require("./entities");
const dotenv_1 = __importDefault(require("dotenv"));
// Load the .env file
dotenv_1.default.config();
exports.AppDataSource = new typeorm_1.DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: true,
    // logging: true,
    entities: [entities_1.Day, entities_1.Exercise, entities_1.DaysExercises],
    migrations: [],
    subscribers: [],
    // logger: "advanced-console"
});
// Log the configuration (be careful not to log sensitive information in production)
// console.log('DataSource configuration:', {
//     host: process.env.DB_HOST,
//     port: process.env.DB_PORT,
//     username: process.env.DB_USERNAME,
//     database: process.env.DB_NAME,
// })

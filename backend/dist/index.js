"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const data_source_1 = require("./data-source");
const dayRoutes_1 = __importDefault(require("./routes/dayRoutes"));
const exerciseRoutes_1 = __importDefault(require("./routes/exerciseRoutes"));
const dayExerciseRoutes_1 = __importDefault(require("./routes/dayExerciseRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api/days', dayRoutes_1.default);
app.use('/api/exercises', exerciseRoutes_1.default);
app.use('/api/dayExercises', dayExerciseRoutes_1.default);
const PORT = process.env.PORT || 5000;
data_source_1.AppDataSource.initialize().then(() => {
    app.listen(5001, () => {
        console.log('Server is running on port 5001');
    });
}).catch(error => console.log("TypeORM connection error: ", error));

import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {AppDataSource} from './data-source';
import dayRoutes from './routes/dayRoutes';
import exerciseRoutes from './routes/exerciseRoutes';
import dayExerciseRoutes from "./routes/dayExerciseRoutes";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/days', dayRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/dayExercises', dayExerciseRoutes);

const PORT = process.env.PORT || 5000;

AppDataSource.initialize().then(() => {
    app.listen(5001, () => {
        console.log('Server is running on port 5001');
    });
}).catch(error => console.log("TypeORM connection error: ", error));


import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { AppDataSource } from './data-source';
import routes from './routes';
import { authenticateUser } from './middleware/auth';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Apply the authentication middleware to all /api routes
app.use('/api', authenticateUser, routes);

const PORT = process.env.PORT || 5000;

AppDataSource.initialize().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch(error => console.log("TypeORM connection error: ", error));

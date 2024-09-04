import "reflect-metadata"
import { DataSource } from "typeorm"
import { Day, Exercise, DaysExercises } from "./entities"
import dotenv from 'dotenv'

// Load the .env file
dotenv.config()

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: true,
    // logging: true,
    entities: [Day, Exercise, DaysExercises],
    migrations: [],
    subscribers: [],
    // logger: "advanced-console"
})

// Log the configuration (be careful not to log sensitive information in production)
// console.log('DataSource configuration:', {
//     host: process.env.DB_HOST,
//     port: process.env.DB_PORT,
//     username: process.env.DB_USERNAME,
//     database: process.env.DB_NAME,
// })
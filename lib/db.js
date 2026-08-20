import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const connectionConfig = process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.DATABASE_SSL === "false"
            ? false
            : { rejectUnauthorized: false }
    }
    : {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT
            ? Number(process.env.DB_PORT)
            : undefined,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: process.env.DB_SSL === "true"
            ? { rejectUnauthorized: false }
            : false
    };

const pool = new Pool(connectionConfig);

export default pool;

import pg from "pg"
import dotenv from "dotenv"

dotenv.config()
// console.log(process.env.DATABASE_URL);

const db = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
})

db.connect().then(() => console.log("Connected to Render PostgreSQL!"))
  .catch(err => {
    console.error("Database connection failed:");
    console.error(err);
    process.exit(1); // stop app if DB fails
  });

export default db;
import { Pool } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const config = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'my_server',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD,
    }

const pool = new Pool(config)

export default pool
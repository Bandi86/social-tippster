import { config } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

config();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT ?? '5433', 10),
  username: process.env.DATABASE_USERNAME || 'postgres',
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME || 'tippmix',
  entities: [
    __dirname + '/../**/*.entity{.ts,.js}',
    '!' + __dirname + '/../**/archived/**/*.entity{.ts,.js}', // Exclude archived entities
  ],
  migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
  synchronize: process.env.NODE_ENV === 'development',
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
/* console.log(`🔌 Database connection options:
  Host: ${dataSourceOptions.host}
  Port: ${dataSourceOptions.port}
  Username: ${dataSourceOptions.username}
  Database: ${dataSourceOptions.database}
  Synchronize: ${dataSourceOptions.synchronize}
`); */

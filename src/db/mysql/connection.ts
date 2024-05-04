import mysql from "mysql";

export default class MySQLDriver {
  private static pool: mysql.Pool;
  private static isInitialized: boolean = false;

  private constructor() {}
  private static async initialize() {
    if (!MySQLDriver.isInitialized) {
      let host = process.env.DB_HOST;
      let user = process.env.DB_USER;
      let password = process.env.DB_PASSWORD || "";
      let database = process.env.DB_NAME;

      if (!host || !user || !database) {
        console.error("Invalid database creds in .env");
        process.exit(1);
      }

      MySQLDriver.pool = mysql.createPool({
        host,
        user,
        password,
        database,
        charset: "latin1",
        connectionLimit: 10,
      });
      MySQLDriver.isInitialized = true;
      console.log("[+] Database connection initialized.");
    }
  }
  public static async getConnection() {
    await MySQLDriver.initialize(); // Ensure the database is initialized

    return new Promise<mysql.PoolConnection>((resolve, reject) => {
      MySQLDriver.pool.getConnection((err, connection) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(connection);
      });
    });
  }

  public static async queryAsync<T>(sql: string, values?: any): Promise<T> {
    const connection = await MySQLDriver.getConnection();

    return new Promise<T>((resolve, reject) => {
      connection.query(sql, values, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
        connection.release();
      });
    });
  }
}

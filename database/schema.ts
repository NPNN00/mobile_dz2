// Доступ к БД и инициализация

import * as SQLite from "expo-sqlite";

export const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  return await SQLite.openDatabaseAsync("markers.db", {
    useNewConnection: true,
  });
};

export const initDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  try {
    const db = await SQLite.openDatabaseAsync("markers.db", {
      useNewConnection: true,
    });
    await db.withTransactionAsync(async () => {
      await db.execAsync(
        `CREATE TABLE IF NOT EXISTS markers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          latitude REAL NOT NULL,
          longitude REAL NOT NULL,
          title TEXT,
          description TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );`,
      );
      await db.execAsync(
        `CREATE TABLE IF NOT EXISTS marker_images (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         marker_id INTEGER NOT NULL,
         uri TEXT NOT NULL,
         created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
         FOREIGN KEY (marker_id) REFERENCES markers (id) ON DELETE CASCADE
        );`,
      );
    });
    console.log("Инициация прошла");
    return db;
  } catch (error) {
    console.error("Ошибка инициализации базы данных:", error);
    throw error;
  }
};

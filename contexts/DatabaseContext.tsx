import React, {
  ReactNode,
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import { DatabaseContextType } from "../types";
import * as SQLite from "expo-sqlite";
import { initDatabase } from "../database/schema";
import {
  addMarker,
  updateMarker,
  deleteMarker,
  addImage,
  deleteImage,
  getMarkers,
  getMarkerById,
  addMarkerWithImages,
  updateMarkerWithImages,
  getMarkerImages,
} from "../database/operations";
export const DatabaseContext = createContext<DatabaseContextType | null>(null);

interface DatabaseProviderProps {
  children: ReactNode;
}

export const DatabaseProvider: React.FC<DatabaseProviderProps> = ({
  children,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
  // Инициализация БД
  useEffect(() => {
    const initDB = async (): Promise<void> => {
      try {
        console.log("Начало инициализации базы данных...");
        const database = await initDatabase();
        setDb(database);
        setIsLoading(false);
        console.log("База данных успешно инициализирована");
      } catch (error) {
        console.error("Ошибка инициализации БД:", error);
        setIsLoading(false);
        throw error;
      }
    };
    initDB();
  }, []);

  const value: DatabaseContextType = {
    // Каррированные функции
    addMarker: addMarker(db, setIsLoading),
    addMarkerWithImages: addMarkerWithImages(db, setIsLoading),
    updateMarker: updateMarker(db, setIsLoading),
    updateMarkerWithImages: updateMarkerWithImages(db, setIsLoading),
    deleteMarker: deleteMarker(db, setIsLoading),
    addImage: addImage(db, setIsLoading),
    deleteImage: deleteImage(db, setIsLoading),
    getMarkers: getMarkers(db),
    getMarkerById: getMarkerById(db),
    getMarkerImages: getMarkerImages(db),
    isLoading,
    db,
  };

  return (
    // Провайдер делает значение контекста доступным для дочерних компонентов
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
};

// Кастомный хук над созданным контекстом для использования БД в компонентах
export const useDatabase = (): DatabaseContextType => {
  const context = useContext(DatabaseContext);
  if (context === null) {
    throw new Error(
      "[useDatabase] должен быть использован внутри DatabaseProvider",
    );
  }
  return context;
};

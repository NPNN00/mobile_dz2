// Операции над БД

import * as SQLite from "expo-sqlite";
import { MarkerData, MarkerDataDB, MarkerImage, MarkerImageDB } from "../types";

// Добавление маркера
export const addMarker =
  (db: SQLite.SQLiteDatabase | null, setIsLoading: (value: boolean) => void) =>
  async (
    latitude: number,
    longitude: number,
    title: string,
    description: string,
  ): Promise<number> => {
    console.log("[addMarker] Вызван:", {
      latitude,
      longitude,
      title,
      description,
    });
    if (!db) {
      console.error("[addMarker] БД не инициализирована");
      throw new Error("[addMarker] БД не инициализирована");
    }
    setIsLoading(true);
    try {
      const result = await db.runAsync(
        "INSERT INTO markers (latitude, longitude, title, description) VALUES (?, ?, ?, ?)",
        latitude,
        longitude,
        title,
        description,
      );
      console.log("[addMarker] Маркер добавлен, ID:", result.lastInsertRowId);
      return result.lastInsertRowId;
    } catch (error) {
      console.error("[addMarker] Ошибка добавления маркера:", error);
      throw error;
    } finally {
      setIsLoading(false);
      console.log("[addMarker] Завершён");
    }
  };

// Обновление маркера
export const updateMarker =
  (db: SQLite.SQLiteDatabase | null, setIsLoading: (value: boolean) => void) =>
  async (
    id: number,
    latitude: number,
    longitude: number,
    title: string,
    description: string,
  ): Promise<void> => {
    console.log("[updateMarker] Вызван:", {
      id,
      latitude,
      longitude,
      title,
      description,
    });
    if (!db) {
      console.error("[updateMarker] БД не инициализирована");
      throw new Error("[updateMarker] БД не инициализирована");
    }
    setIsLoading(true);
    try {
      await db.runAsync(
        "UPDATE markers SET latitude = ?, longitude = ?, title = ?, description = ? WHERE id = ?",
        latitude,
        longitude,
        title,
        description,
        id,
      );
      console.log("[updateMarker] Маркер обновлён, ID:", id);
    } catch (error) {
      console.error("[updateMarker] Ошибка обновления маркера:", error);
      throw error;
    } finally {
      setIsLoading(false);
      console.log("[updateMarker] Завершён");
    }
  };

// Удаление маркера
export const deleteMarker =
  (db: SQLite.SQLiteDatabase | null, setIsLoading: (value: boolean) => void) =>
  async (id: number): Promise<void> => {
    console.log("[deleteMarker] Вызван, ID:", id);
    if (!db) {
      console.error("[deleteMarker] БД не инициализирована");
      throw new Error("[deleteMarker] БД не инициализирована");
    }
    setIsLoading(true);
    try {
      await db.runAsync("DELETE FROM markers WHERE id = ?", id);
      console.log("[deleteMarker] Маркер удалён, ID:", id);
    } catch (error) {
      console.error("[deleteMarker] Ошибка удаления маркера:", error);
      throw error;
    } finally {
      setIsLoading(false);
      console.log("[deleteMarker] Завершён");
    }
  };

// Добавление изображения
export const addImage =
  (db: SQLite.SQLiteDatabase | null, setIsLoading: (value: boolean) => void) =>
  async (markerId: number, uri: string): Promise<number> => {
    console.log("[addImage] Вызван:", { markerId, uri });
    if (!db) {
      console.error("[addImage] БД не инициализирована");
      throw new Error("[addImage] БД не инициализирована");
    }
    setIsLoading(true);
    try {
      const result = await db.runAsync(
        "INSERT INTO marker_images (marker_id, uri) VALUES (?, ?)",
        markerId,
        uri,
      );
      console.log(
        "[addImage] Изображение добавлено, ID:",
        result.lastInsertRowId,
      );
      return result.lastInsertRowId;
    } catch (error) {
      console.error("[addImage ] Ошибка добавление изображения:", error);
      throw error;
    } finally {
      setIsLoading(false);
      console.log("[addImage] Завершён");
    }
  };

// Удаление изображения
export const deleteImage =
  (db: SQLite.SQLiteDatabase | null, setIsLoading: (value: boolean) => void) =>
  async (id: number): Promise<void> => {
    console.log("[deleteImage] Вызван, ID:", id);
    if (!db) {
      console.error("[deleteImage] БД не инициализирована");
      throw new Error("[deleteImage] БД не инициализирована");
    }
    setIsLoading(true);
    try {
      await db.runAsync("DELETE FROM marker_images WHERE id = ?", id);
      console.log("[deleteImage] Изображение удалено, ID:", id);
    } catch (error) {
      console.error("[deleteImage] Ошибка удаления изображения:", error);
      throw error;
    } finally {
      setIsLoading(false);
      console.log("[deleteImage] Завершён");
    }
  };

// Получение маркеров (только чтение, не блокируем)
export const getMarkers =
  (db: SQLite.SQLiteDatabase | null) => async (): Promise<MarkerData[]> => {
    console.log("[getMarkers] Вызван");
    if (!db) {
      console.error("[getMarkers] БД не инициализирована");
      throw new Error("[getMarkers] БД не инициализирована");
    }
    try {
      const markersDB = await db.getAllAsync<MarkerDataDB>(
        "SELECT * FROM markers",
      );
      console.log("[getMarkers] Получено маркеров:", markersDB.length);
      return markersDB.map(
        (marker: MarkerDataDB): MarkerData => ({
          id: marker.id,
          latlng: {
            latitude: marker.latitude,
            longitude: marker.longitude,
          },
          title: marker.title,
          description: marker.description,
        }),
      );
    } catch (error) {
      console.error("[getMarkers] Ошибка получения маркеров:", error);
      throw error;
    } finally {
      console.log("[getMarkers] Завершён");
    }
  };

// Получение маркера по ID (только чтение, не блокируем)
export const getMarkerById =
  (db: SQLite.SQLiteDatabase | null) =>
  async (id: number): Promise<MarkerData | null> => {
    console.log("[getMarkerById] Вызван, ID:", id);
    if (!db) {
      console.error("[getMarkerById] БД не инициализирована");
      throw new Error("[getMarkerById] БД не инициализирована");
    }
    try {
      const marker = await db.getFirstAsync<MarkerDataDB>(
        "SELECT * FROM markers WHERE id = ?",
        id,
      );
      if (!marker) {
        console.log("[getMarkerById] Маркер не найден, ID:", id);
        return null;
      }
      console.log("[getMarkerById] Маркер найден, ID:", id);
      return {
        id: marker.id,
        latlng: {
          latitude: marker.latitude,
          longitude: marker.longitude,
        },
        title: marker.title,
        description: marker.description,
      };
    } catch (error) {
      console.error("[getMarkerById] Ошибка получение маркера по ID:", error);
      throw error;
    } finally {
      console.log("[getMarkerById] Завершён");
    }
  };

// Получение изображений (только чтение, не блокируем)
export const getMarkerImages =
  (db: SQLite.SQLiteDatabase | null) =>
  async (markerId: number): Promise<MarkerImage[]> => {
    console.log("[getMarkerImages] Вызван, markerId:", markerId);
    if (!db) {
      console.error("[getMarkerImages] БД не инициализирована");
      throw new Error("[getMarkerImages] БД не инициализирована");
    }
    try {
      const images = await db.getAllAsync<MarkerImageDB>(
        "SELECT id, marker_id, uri FROM marker_images WHERE marker_id = ? ORDER BY created_at DESC",
        markerId,
      );
      console.log("[getMarkerImages] Получено изображений:", images.length);
      return images.map(
        (image: MarkerImageDB): MarkerImage => ({
          id: image.id,
          marker_id: image.marker_id,
          uri: image.uri,
        }),
      );
    } catch (error) {
      console.error(
        "[getMarkerImages] Ошибка получения изображений маркера:",
        error,
      );
      throw error;
    } finally {
      console.log("[getMarkerImages] Завершён");
    }
  };

// Добавление маркера с изображениями в одной транзакции
export const addMarkerWithImages =
  (db: SQLite.SQLiteDatabase | null, setIsLoading: (value: boolean) => void) =>
  async (
    latitude: number,
    longitude: number,
    title: string,
    description: string,
    imageUris: string[],
  ): Promise<number> => {
    console.log("[addMarkerWithImages] Вызван:", {
      latitude,
      longitude,
      title,
      description,
      imageCount: imageUris.length,
    });
    if (!db) {
      console.error("[addMarkerWithImages] БД не инициализирована");
      throw new Error("[addMarkerWithImages] БД не инициализирована");
    }

    setIsLoading(true);
    let newMarkerId = 0;
    const imageIds: number[] = []; // массив для хранения ID изображений

    try {
      await db.withTransactionAsync(async () => {
        // Добавляем маркер
        const result = await db!.runAsync(
          "INSERT INTO markers (latitude, longitude, title, description) VALUES (?, ?, ?, ?)",
          latitude,
          longitude,
          title,
          description,
        );
        newMarkerId = result.lastInsertRowId;
        console.log("[addMarkerWithImages] Маркер добавлен, ID:", newMarkerId);

        // Добавляем все изображения
        for (const uri of imageUris) {
          const imageResult = await db!.runAsync(
            "INSERT INTO marker_images (marker_id, uri) VALUES (?, ?)",
            newMarkerId,
            uri,
          );
          imageIds.push(imageResult.lastInsertRowId); // сохраняем ID изображения
          console.log(
            "[addMarkerWithImages] Изображение добавлено для маркера:",
            newMarkerId,
            "ID изображения:",
            imageResult.lastInsertRowId,
          );
        }
      });

      console.log(
        "[addMarkerWithImages] Успешно завершён, ID маркера:",
        newMarkerId,
        "ID изображений:",
        imageIds,
      );
      return newMarkerId;
    } catch (error) {
      console.error("[addMarkerWithImages] Ошибка:", error);
      throw error;
    } finally {
      setIsLoading(false);
      console.log("[addMarkerWithImages] Завершён");
    }
  };

// Обновление маркера с изображениями в одной транзакции
export const updateMarkerWithImages =
  (db: SQLite.SQLiteDatabase | null, setIsLoading: (value: boolean) => void) =>
  async (
    id: number,
    latitude: number,
    longitude: number,
    title: string,
    description: string,
    deletedImageIds: number[],
    newImageUris: string[],
  ): Promise<void> => {
    console.log("[updateMarkerWithImages] Вызван:", {
      id,
      latitude,
      longitude,
      title,
      description,
      deletedCount: deletedImageIds.length,
      newCount: newImageUris.length,
    });
    if (!db) {
      console.error("[updateMarkerWithImages] БД не инициализирована");
      throw new Error("[updateMarkerWithImages] БД не инициализирована");
    }

    setIsLoading(true);
    const addedImageIds: number[] = [];

    try {
      await db.withTransactionAsync(async () => {
        // Обновляем маркер
        await db!.runAsync(
          "UPDATE markers SET latitude = ?, longitude = ?, title = ?, description = ? WHERE id = ?",
          latitude,
          longitude,
          title,
          description,
          id,
        );
        console.log("[updateMarkerWithImages] Маркер обновлён, ID:", id);

        // Удаляем помеченные изображения
        for (const imageId of deletedImageIds) {
          await db!.runAsync("DELETE FROM marker_images WHERE id = ?", imageId);
          console.log(
            "[updateMarkerWithImages] Изображение удалено, ID:",
            imageId,
          );
        }

        // Добавляем новые изображения
        for (const uri of newImageUris) {
          const imageResult = await db!.runAsync(
            "INSERT INTO marker_images (marker_id, uri) VALUES (?, ?)",
            id,
            uri,
          );
          addedImageIds.push(imageResult.lastInsertRowId);
          console.log(
            "[updateMarkerWithImages] Изображение добавлено для маркера:",
            id,
            "ID изображения:",
            imageResult.lastInsertRowId,
          );
        }
      });

      console.log(
        "[updateMarkerWithImages] Успешно завершён для маркера ID:",
        id,
        "Добавленные ID изображений:",
        addedImageIds,
      );
    } catch (error) {
      console.error("[updateMarkerWithImages] Ошибка:", error);
      throw error;
    } finally {
      setIsLoading(false);
      console.log("[updateMarkerWithImages] Завершён");
    }
  };

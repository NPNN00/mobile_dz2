import * as SQLite from "expo-sqlite";

// Тип для изображения маркера
export interface MarkerImage {
  id: number;
  marker_id: number;
  uri: string;
}

// Тип для изображения маркера в БД
export interface MarkerImageDB {
  id: number;
  marker_id: number;
  uri: string;
  created_at: Date;
}

// Тип данных маркера на карте
export interface MarkerData {
  id: number;
  latlng: {
    latitude: number;
    longitude: number;
  };
  title: string;
  description: string;
}

// Тип для данных маркера в БД
export interface MarkerDataDB {
  id: number;
  latitude: number;
  longitude: number;
  title: string;
  description: string;
  created_at: Date;
}

// Тип для передаваемых данных в ImageList.tsx
export interface ImageListProps {
  images: MarkerImage[];
  onDelete?: (id: number) => void;
  isEditing?: boolean;
}

// Тип для параметров навигации
export interface RouterProps {
  pathname: "/marker/[id]" | "/";
  params: {
    id?: string;
    latitude?: string;
    longitude?: string;
  };
}

// Тип контекста
export interface DatabaseContextType {
  isLoading: boolean;
  db: SQLite.SQLiteDatabase | null;

  // Операции с маркерами
  addMarker: (
    latitude: number,
    longitude: number,
    title: string,
    description: string,
  ) => Promise<number>;
  addMarkerWithImages: (
    latitude: number,
    longitude: number,
    title: string,
    description: string,
    imageUris: string[],
  ) => Promise<number>;
  deleteMarker: (id: number) => Promise<void>;
  updateMarker: (
    id: number,
    latitude: number,
    longitude: number,
    title: string,
    description: string,
  ) => Promise<void>;
  updateMarkerWithImages: (
    id: number,
    latitude: number,
    longitude: number,
    title: string,
    description: string,
    deletedImageIds: number[],
    newImageUris: string[],
  ) => Promise<void>;
  getMarkers: () => Promise<MarkerData[]>;
  getMarkerById: (id: number) => Promise<MarkerData | null>;

  // Операции с изображениями
  addImage: (markerId: number, uri: string) => Promise<number>;
  deleteImage: (id: number) => Promise<void>;
  getMarkerImages: (markerId: number) => Promise<MarkerImage[]>;
}

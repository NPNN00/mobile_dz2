import React, { useState, useCallback } from "react";
import MapView, { LongPressEvent, Region } from "react-native-maps";
import { StyleSheet, Alert } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { MarkerList } from "../components/MarkerList";
import { MarkerData, RouterProps } from "../types";
import { useDatabase } from "../contexts/DatabaseContext";

const initialRegion = {
  latitude: 58.0105,
  longitude: 56.2502,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

export function Map() {
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [currentRegion, setCurrentRegion] = useState<Region | null>(null);
  const { getMarkers, isLoading } = useDatabase();

  // useFocusEffect срабатывает каждый раз, когда карта становится видимой (в фокусе)
  useFocusEffect(
    // useCallback запоминает функцию, чтобы не было бесконечных рендеров
    useCallback(() => {
      const loadMarkers = async () => {
        if (isLoading) return;
        try {
          const loadedMarkers = await getMarkers();
          setMarkers(loadedMarkers);
          console.log("_[useFocusEffect] Загрузили маркеры");
        } catch (error) {
          console.error("_[useFocusEffect] Ошибка загрузки маркеров:", error);
          Alert.alert("Ошибка", "Не удалось загрузить маркеры");
          throw error;
        }
      };

      loadMarkers();
    }, [isLoading]), // Зависимости для пересоздания сallBack функции (без этого функция будет думать, что isLoading = true, и маркеры никогда не загрузятся.)
  );

  // Обработчик долгого нажатия -> создание маркера
  const handleLongPress = (e: LongPressEvent) => {
    try {
      const { latitude, longitude } = e.nativeEvent.coordinate;

      router.push({
        pathname: `/marker/[id]`,
        params: {
          id: "new",
          latitude: latitude.toString(),
          longitude: longitude.toString(),
        },
      } satisfies RouterProps);
    } catch (error) {
      console.error("Ошибка навигации при долгом нажатии: ", error);
      Alert.alert("Ошибка", "Не удалось создать маркер");
    }
  };

  // Обработчик после движения карты -> сохраняем регион
  const handleRegionChangeComplete = (region: Region) => {
    setCurrentRegion(region);
  };

  // Обработчик после загрузки карты
  const handleMapReady = () => {
    console.log("Карта загружена");
  };

  // Пока БД инициализируется, ничего не рендерим
  if (isLoading) {
    return null;
  }

  return (
    <MapView
      style={styles.map}
      region={currentRegion || initialRegion}
      onRegionChangeComplete={handleRegionChangeComplete}
      onLongPress={handleLongPress}
      onMapReady={handleMapReady}
    >
      <MarkerList markers={markers} />
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: { width: "100%", height: "100%" },
});

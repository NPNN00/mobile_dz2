import React from "react";
import { Marker } from "react-native-maps";
import { router } from "expo-router";
import { Alert } from "react-native";
import { MarkerData, RouterProps } from "../types";
import { useDatabase } from "../contexts/DatabaseContext";

interface MarkerListProps {
  markers: MarkerData[];
}

export function MarkerList({ markers }: MarkerListProps) {
  const { isLoading } = useDatabase();

  // Обработчик нажатия на маркер
  const handleMarkerPress = (marker: MarkerData) => {
    try {
      router.push({
        pathname: "/marker/[id]",
        params: { id: marker.id.toString() },
      } satisfies RouterProps);
    } catch (error) {
      console.error("Ошибка навигации при нажатии на маркер: ", error);
      Alert.alert("Ошибка", "Ошибка навигации");
    }
  };

  // Пока БД инициализируется, ничего не рендерим
  if (isLoading) {
    return null;
  }

  return (
    <>
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          coordinate={marker.latlng}
          title={marker.title}
          description={marker.description}
          onPress={() => handleMarkerPress(marker)}
        />
      ))}
    </>
  );
}

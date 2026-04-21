import React from "react";
import { View, Image, Button, StyleSheet, Text, Alert } from "react-native";
import { ImageListProps } from "../types";
import { useDatabase } from "../contexts/DatabaseContext";

export function ImageList({
  images,
  onDelete,
  isEditing = true,
}: ImageListProps) {
  const { isLoading } = useDatabase();

  if (images.length === 0) return null;

  // Обёртка над onDelete(id)
  const handleDelete = (id: number) => {
    try {
      if (onDelete) {
        onDelete(id);
      }
    } catch (error) {
      console.error("Ошибка при удалении изображения:", error);
      Alert.alert("Ошибка", "Не удалось удалить изображение");
    }
  };

  // Пока БД инициализируется, ничего не рендерим
  if (isLoading) {
    return null;
  }

  return (
    <>
      <Text style={styles.paramName}>Изображения:</Text>
      {images.map((image) => (
        <View key={image.id} style={styles.imageItem}>
          <Image
            source={{ uri: image.uri }}
            style={styles.image}
            resizeMode="contain"
            onError={({ nativeEvent: { error } }) =>
              console.error("Ошибка загрузки изображения:", error)
            }
          />
          {isEditing && (
            <Button
              title="Удалить"
              onPress={() => handleDelete(image.id)}
              color="red"
            />
          )}
        </View>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  imageItem: {
    marginVertical: 10,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginVertical: 5,
  },
  paramName: {
    fontWeight: "bold",
  },
});

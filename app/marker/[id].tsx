import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  requestMediaLibraryPermissionsAsync,
  launchImageLibraryAsync,
} from "expo-image-picker";
import { MarkerImage, RouterProps } from "../../types";
import { ImageList } from "../../components/ImageList";
import { useDatabase } from "../../contexts/DatabaseContext";

export default function MarkerDetail() {
  // Для отступов от шторки и кнопок
  const insets = useSafeAreaInsets();

  // Переданные параметры
  const { id, latitude, longitude } = useLocalSearchParams();

  const isNew = id === "new";

  // Содержимое контекста для работы с БД
  const {
    getMarkerById,
    deleteMarker,
    getMarkerImages,
    updateMarkerWithImages,
    addMarkerWithImages,
    isLoading,
  } = useDatabase();

  // Содержимое маркера
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");

  // "Режим" просмотра/изменения
  const [isEditing, setIsEditing] = useState(isNew);

  // Изображения
  const [images, setImages] = useState<MarkerImage[]>([]);
  // id изображений на удаление
  const [deletedImages, setDeletedImages] = useState<number[]>([]);
  // счётчик id новых изображений (только отрицательные)
  const [nextTempId, setNextTempId] = useState(-1);

  // useEffect срабатывает при монтировани компонента и изменения режима редактирования
  // -> загрузка данных маркера и его изображений / установка координат из переданных параметров
  useEffect(() => {
    if (!isNew) {
      // ПОСЛЕДОВАТЕЛЬНОЕ ЧТЕНИЕ маркеров и изображений
      const loadData = async () => {
        await loadMarker();
        await loadImages();
      };
      loadData();
    } else {
      setLat(latitude as string);
      setLng(longitude as string);
    }
  }, [isEditing]);

  // Загрузка содержимого маркера
  const loadMarker = async () => {
    try {
      const marker = await getMarkerById(parseInt(id as string));
      if (marker) {
        setTitle(marker.title);
        setDescription(marker.description);
        setLat(marker.latlng.latitude.toString());
        setLng(marker.latlng.longitude.toString());
      } else {
        console.error("Маркер не найден, ID:", id);
        throw new Error("Маркер не найден");
      }
    } catch (error) {
      console.error("Ошибка загрузки маркера:", error);
      throw new Error("Ошибка загрузки маркера");
    }
  };

  // Загрузка изображений
  const loadImages = async () => {
    try {
      const loadedImages = await getMarkerImages(parseInt(id as string));
      setImages(loadedImages);
    } catch (error) {
      console.error("Ошибка загрузки изображений:", error);
      throw error;
    }
  };

  // Получение изображения из диска/галереи
  const pickImage = async () => {
    try {
      const permissionResult = await requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert("Ошибка", "Нужен доступ к галерее");
        return;
      }

      const result = await launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.5,
      });

      if (!result.canceled) {
        const tempImage: MarkerImage = {
          id: nextTempId,
          marker_id: isNew ? 0 : parseInt(id as string),
          uri: result.assets[0].uri,
        };
        setImages([...images, tempImage]);
        setNextTempId(nextTempId - 1);
      }
    } catch (error) {
      console.error("Ошибка выбора изображения:", error);
      throw error;
    }
  };

  // Удаление изображения (в редактировании)
  const deleteImageHandler = (imageId: number) => {
    // Существующая в БД
    if (!isNew && imageId > 0) {
      setDeletedImages([...deletedImages, imageId]);
    }
    // Существующая только в редактировании
    setImages(images.filter((img) => img.id !== imageId));
  };

  // Сохранение результата создания/редактирования маркера
  const saveMarker = async () => {
    if (!title.trim()) {
      Alert.alert("Ошибка", "Название не может быть пустым");
      return;
    }

    const latitudeNum = parseFloat(lat);
    const longitudeNum = parseFloat(lng);

    if (
      isNaN(latitudeNum) ||
      isNaN(longitudeNum) ||
      Math.abs(latitudeNum) > 90 ||
      Math.abs(longitudeNum) > 180
    ) {
      Alert.alert(
        "Ошибка",
        "Введите корректные координаты (широта: -90..90, долгота: -180..180)",
      );
      return;
    }

    try {
      // Новый маркер
      if (isNew) {
        const imageUris = images.map((img) => img.uri);
        const newMarkerId = await addMarkerWithImages(
          latitudeNum,
          longitudeNum,
          title.trim(),
          description.trim() || "Нет описания",
          imageUris,
        );

        router.replace({
          pathname: "/marker/[id]",
          params: { id: newMarkerId.toString() },
        } satisfies RouterProps);

        // Старый маркер
      } else if (id) {
        const newImageUris = images
          .filter((img) => img.id < 0)
          .map((img) => img.uri);

        await updateMarkerWithImages(
          parseInt(id as string),
          latitudeNum,
          longitudeNum,
          title.trim(),
          description.trim() || "Нет описания",
          deletedImages,
          newImageUris,
        );

        console.log("Изменения сохранены");
        setIsEditing(false);
        setDeletedImages([]);
        setNextTempId(-1);
      }
    } catch (error) {
      console.error("Ошибка сохранения маркера:", error);
      throw error;
    }
  };

  // Удаление маркера
  const deleteMarkerHandler = async () => {
    Alert.alert(
      "Удаление",
      "Вы уверены?",
      [
        { text: "Отмена", style: "cancel" },
        {
          text: "Удалить",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteMarker(parseInt(id as string));
              router.back();
            } catch (error) {
              console.error("Ошибка удаления маркера:", error);
              throw error;
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  // Загрузка..
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Загрузка...</Text>
      </View>
    );
  }

  // Режим редактирования
  if (isEditing) {
    return (
      <ScrollView
        style={[
          styles.container,
          {
            marginBottom: insets.bottom + 5,
            marginTop: insets.top + 5,
          },
        ]}
      >
        <Text style={styles.title}>
          {isNew ? "Создание маркера" : "Редактирование"}
        </Text>

        <Text>Название *</Text>
        <TextInput style={styles.input} value={title} onChangeText={setTitle} />

        <Text>Описание</Text>
        <TextInput
          style={styles.input}
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <Text>Широта</Text>
        <TextInput
          style={styles.input}
          value={lat}
          onChangeText={setLat}
          keyboardType="numeric"
        />

        <Text>Долгота</Text>
        <TextInput
          style={styles.input}
          value={lng}
          onChangeText={setLng}
          keyboardType="numeric"
        />

        <View style={styles.addButtonContainer}>
          <Button
            title="Добавить изображение"
            onPress={pickImage}
            disabled={isLoading}
          />
        </View>

        <ImageList
          images={images}
          onDelete={deleteImageHandler}
          isEditing={true}
        />

        <View style={styles.buttonContainer}>
          <Button title="Сохранить" onPress={saveMarker} disabled={isLoading} />
          {!isNew && (
            // При отмене редактирования существующего маркера очищаем изменения
            <Button
              title="Отмена"
              onPress={() => {
                setIsEditing(false);
                loadImages();
                setDeletedImages([]);
                setNextTempId(-1);
              }}
              color={"red"}
              disabled={isLoading}
            />
          )}
          {isNew && (
            // При отмене создания нового маркера просто возвращаемся на карту
            <Button
              title="Отмена"
              onPress={() => router.back()}
              color={"red"}
              disabled={isLoading}
            />
          )}
        </View>

        {isLoading && <Text style={styles.loadingText}>Сохранение...</Text>}
      </ScrollView>
    );
  }

  // Режим просмотра
  return (
    <ScrollView
      style={[
        styles.container,
        {
          marginBottom: insets.bottom + 5,
          marginTop: insets.top + 5,
        },
      ]}
    >
      <Text style={styles.title}>{title}</Text>

      <Text>
        <Text style={styles.paramName}>ID:</Text> {id}
      </Text>

      <Text>
        <Text style={styles.paramName}>Широта:</Text> {lat}
      </Text>

      <Text>
        <Text style={styles.paramName}>Долгота:</Text> {lng}
      </Text>

      <Text style={styles.paramName}>Описание:</Text>
      <Text>{description}</Text>

      <ImageList images={images} isEditing={false} />

      <View style={styles.buttonContainer}>
        <Button title="Редактировать" onPress={() => setIsEditing(true)} />
        <Button title="Удалить" onPress={deleteMarkerHandler} color="red" />
        <Button title="Назад" onPress={() => router.back()} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  paramName: {
    fontWeight: "bold",
  },
  buttonContainer: {
    gap: 10,
    marginTop: 20,
  },
  addButtonContainer: {
    marginVertical: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#868686",
    padding: 10,
    borderRadius: 2,
    marginBottom: 6,
  },
  loadingText: {
    textAlign: "center",
    marginTop: 10,
    color: "blue",
  },
});

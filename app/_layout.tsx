import { Stack } from "expo-router";
import { DatabaseProvider } from "../contexts/DatabaseContext";

export default function RootLayout() {
  return (
    // Стек навигации
    <DatabaseProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="marker/[id]" options={{ headerShown: false }} />
      </Stack>
    </DatabaseProvider>
  );
}

import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import { Alert, Platform } from "react-native";
import ViewShot from "react-native-view-shot";

export async function requestMediaPermission(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  const { status } = await MediaLibrary.requestPermissionsAsync();
  return status === "granted";
}

export async function captureAndShare(ref: React.RefObject<ViewShot>): Promise<"shared" | "saved" | "cancelled"> {
  if (!ref.current) return "cancelled";
  try {
    const uri: string = await (ref.current as any).capture();
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(uri, { mimeType: "image/png", dialogTitle: "Share your achievement" });
      return "shared";
    }
    const granted = await requestMediaPermission();
    if (granted) {
      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert("Saved!", "Your achievement card was saved to your camera roll. Share it anywhere!");
      return "saved";
    }
    return "cancelled";
  } catch (e) {
    return "cancelled";
  }
}

export async function saveToGallery(ref: React.RefObject<ViewShot>): Promise<boolean> {
  if (!ref.current) return false;
  try {
    const uri: string = await (ref.current as any).capture();
    const granted = await requestMediaPermission();
    if (!granted) {
      Alert.alert("Permission needed", "Please allow photo access to save your card.");
      return false;
    }
    await MediaLibrary.saveToLibraryAsync(uri);
    return true;
  } catch {
    return false;
  }
}

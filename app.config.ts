import "dotenv/config";
import type { ExpoConfig } from "@expo/config-types";

const config: ExpoConfig = {
  name: "Vitala",
  slug: "vitala-ai",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  scheme: "vitala",
  userInterfaceStyle: "light",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#F7FAFE"
  },
  android: {
    package: "com.wabix2.vitalaai",
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#6366F1"
    },
    permissions: []
  },
  extra: {
    eas: {
      projectId: process.env.EXPO_PROJECT_ID ?? "11dd4a69-396e-493a-b4bc-f50a1c095a60"
    },
    geminiApiKey: process.env.GEMINI_API_KEY,
    appEnv: process.env.APP_ENV ?? "production"
  }
};

export default config;

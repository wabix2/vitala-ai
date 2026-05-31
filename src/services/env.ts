import Constants from "expo-constants";

type Extra = {
  geminiApiKey?: string;
  appEnv?: string;
};

const extra = (Constants.expoConfig?.extra ?? {}) as Extra;

export function getGeminiApiKey() {
  return extra.geminiApiKey;
}

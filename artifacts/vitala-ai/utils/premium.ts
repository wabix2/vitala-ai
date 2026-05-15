import { Platform } from "react-native";
import Purchases, { LOG_LEVEL } from "react-native-purchases";

const REVENUECAT_GOOGLE_API_KEY = "YOUR_GOOGLE_PLAY_API_KEY_PLACEHOLDER";
const REVENUECAT_APPLE_API_KEY = "YOUR_APPLE_API_KEY_PLACEHOLDER";

let initialized = false;

export async function initializePurchases(): Promise<void> {
  if (Platform.OS === "web") return;
  if (initialized) return;
  try {
    Purchases.setLogLevel(LOG_LEVEL.ERROR);
    if (Platform.OS === "android") {
      await Purchases.configure({ apiKey: REVENUECAT_GOOGLE_API_KEY });
    } else if (Platform.OS === "ios") {
      await Purchases.configure({ apiKey: REVENUECAT_APPLE_API_KEY });
    }
    initialized = true;
  } catch {
    // Purchases initialization failed — app will still work, premium features will be locked
  }
}

export async function isPremiumUser(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return typeof customerInfo.entitlements.active["premium"] !== "undefined";
  } catch {
    return false;
  }
}

export async function showPremiumOffering(): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    const offerings = await Purchases.getOfferings();
    if (!offerings.current) {
      return;
    }
    // Caller should present the offering packages via a paywall UI
  } catch {
    // Could not load offerings
  }
}

export async function purchasePremium(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  try {
    const offerings = await Purchases.getOfferings();
    const pkg = offerings.current?.availablePackages?.[0];
    if (!pkg) return false;
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return typeof customerInfo.entitlements.active["premium"] !== "undefined";
  } catch {
    return false;
  }
}

export async function restorePurchases(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  try {
    const customerInfo = await Purchases.restorePurchases();
    return typeof customerInfo.entitlements.active["premium"] !== "undefined";
  } catch {
    return false;
  }
}

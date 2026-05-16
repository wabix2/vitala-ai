import { Platform } from "react-native";
import Purchases, {
  LOG_LEVEL,
  type CustomerInfo,
  type PurchasesPackage,
  type PurchasesOffering,
  PACKAGE_TYPE,
} from "react-native-purchases";

// Keys come from environment variables — never hardcode in source
const REVENUECAT_ANDROID_API_KEY =
  process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY ?? "";
const REVENUECAT_APPLE_API_KEY =
  process.env.EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY ?? "";

export const ENTITLEMENT_ID = "vitala_ai_pro";

let initialized = false;

export async function initializePurchases(): Promise<void> {
  if (Platform.OS === "web") return;
  if (initialized) return;
  const apiKey =
    Platform.OS === "android" ? REVENUECAT_ANDROID_API_KEY : REVENUECAT_APPLE_API_KEY;
  if (!apiKey) {
    console.warn("[RevenueCat] API key not configured — purchases unavailable");
    return;
  }
  try {
    Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.ERROR);
    Purchases.configure({ apiKey });
    initialized = true;
  } catch (e) {
    console.warn("[RevenueCat] Failed to initialize:", e);
  }
}

export function isPurchasesInitialized(): boolean {
  return initialized;
}

export async function isPremiumUser(): Promise<boolean> {
  if (Platform.OS === "web" || !initialized) return false;
  try {
    const info = await Purchases.getCustomerInfo();
    return isEntitlementActive(info);
  } catch {
    return false;
  }
}

function isEntitlementActive(info: CustomerInfo): boolean {
  return typeof info.entitlements.active[ENTITLEMENT_ID] !== "undefined";
}

export interface VitalaOffering {
  monthly:  PurchasesPackage | null;
  yearly:   PurchasesPackage | null;
  lifetime: PurchasesPackage | null;
  raw:      PurchasesOffering | null;
}

export async function getOffering(): Promise<VitalaOffering> {
  const empty: VitalaOffering = { monthly: null, yearly: null, lifetime: null, raw: null };
  if (Platform.OS === "web" || !initialized) return empty;
  try {
    const offerings = await Purchases.getOfferings();
    const current = offerings.current;
    if (!current) return empty;

    let monthly:  PurchasesPackage | null = null;
    let yearly:   PurchasesPackage | null = null;
    let lifetime: PurchasesPackage | null = null;

    for (const pkg of current.availablePackages) {
      if (pkg.packageType === PACKAGE_TYPE.MONTHLY)  monthly  = pkg;
      if (pkg.packageType === PACKAGE_TYPE.ANNUAL)   yearly   = pkg;
      if (pkg.packageType === PACKAGE_TYPE.LIFETIME) lifetime = pkg;
    }

    // Fallback: match by product identifier if package types are not set
    if (!monthly || !yearly || !lifetime) {
      for (const pkg of current.availablePackages) {
        const id = pkg.product.identifier.toLowerCase();
        if (!monthly  && id.includes("monthly"))  monthly  = pkg;
        if (!yearly   && (id.includes("yearly") || id.includes("annual"))) yearly = pkg;
        if (!lifetime && id.includes("lifetime")) lifetime = pkg;
      }
    }

    return { monthly, yearly, lifetime, raw: current };
  } catch (e) {
    console.warn("[RevenueCat] getOffering failed:", e);
    return empty;
  }
}

export async function purchasePackage(pkg: PurchasesPackage): Promise<boolean> {
  if (Platform.OS === "web" || !initialized) return false;
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return isEntitlementActive(customerInfo);
  } catch (e: any) {
    if (e?.userCancelled) return false;
    throw e;
  }
}

export async function restorePurchases(): Promise<boolean> {
  if (Platform.OS === "web" || !initialized) return false;
  try {
    const info = await Purchases.restorePurchases();
    return isEntitlementActive(info);
  } catch {
    return false;
  }
}

export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  if (Platform.OS === "web" || !initialized) return null;
  try {
    return await Purchases.getCustomerInfo();
  } catch {
    return null;
  }
}

export async function logInUser(userId: string): Promise<void> {
  if (Platform.OS === "web" || !initialized) return;
  try {
    await Purchases.logIn(userId);
  } catch (e) {
    console.warn("[RevenueCat] logIn failed:", e);
  }
}

export async function logOutUser(): Promise<void> {
  if (Platform.OS === "web" || !initialized) return;
  try {
    await Purchases.logOut();
  } catch (e) {
    console.warn("[RevenueCat] logOut failed:", e);
  }
}

// Legacy alias — keeps older call sites working
export async function purchasePremium(): Promise<boolean> {
  const offering = await getOffering();
  const pkg = offering.monthly ?? offering.yearly ?? offering.lifetime;
  if (!pkg) return false;
  return purchasePackage(pkg);
}

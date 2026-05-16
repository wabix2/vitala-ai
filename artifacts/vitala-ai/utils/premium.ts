import { Platform } from "react-native";
import Purchases, {
  LOG_LEVEL,
  type CustomerInfo,
  type PurchasesPackage,
  type PurchasesOffering,
  PACKAGE_TYPE,
} from "react-native-purchases";

const REVENUECAT_ANDROID_API_KEY = "test_jKojaAuEepLTTttcOAGNRVBsHGo";
const REVENUECAT_APPLE_API_KEY   = "YOUR_APPLE_API_KEY_PLACEHOLDER";

export const ENTITLEMENT_ID = "vitala ai Pro";

let initialized = false;

export async function initializePurchases(): Promise<void> {
  if (Platform.OS === "web") return;
  if (initialized) return;
  try {
    Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.ERROR);
    const apiKey =
      Platform.OS === "android" ? REVENUECAT_ANDROID_API_KEY : REVENUECAT_APPLE_API_KEY;
    Purchases.configure({ apiKey });
    initialized = true;
  } catch {
    // Initialization failed — app still works, premium features locked
  }
}

export async function isPremiumUser(): Promise<boolean> {
  if (Platform.OS === "web") return false;
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
  if (Platform.OS === "web") return empty;
  try {
    const offerings = await Purchases.getOfferings();
    const current   = offerings.current;
    if (!current) return empty;

    let monthly:  PurchasesPackage | null = null;
    let yearly:   PurchasesPackage | null = null;
    let lifetime: PurchasesPackage | null = null;

    for (const pkg of current.availablePackages) {
      if (pkg.packageType === PACKAGE_TYPE.MONTHLY)  monthly  = pkg;
      if (pkg.packageType === PACKAGE_TYPE.ANNUAL)   yearly   = pkg;
      if (pkg.packageType === PACKAGE_TYPE.LIFETIME) lifetime = pkg;
    }

    // Fallback: match by product identifier if package types aren't set
    if (!monthly || !yearly || !lifetime) {
      for (const pkg of current.availablePackages) {
        const id = pkg.product.identifier.toLowerCase();
        if (!monthly  && id.includes("monthly"))  monthly  = pkg;
        if (!yearly   && id.includes("yearly"))   yearly   = pkg;
        if (!lifetime && id.includes("lifetime")) lifetime = pkg;
      }
    }

    return { monthly, yearly, lifetime, raw: current };
  } catch {
    return empty;
  }
}

export async function purchasePackage(pkg: PurchasesPackage): Promise<boolean> {
  if (Platform.OS === "web") return false;
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return isEntitlementActive(customerInfo);
  } catch (e: any) {
    if (e?.userCancelled) return false;
    throw e;
  }
}

export async function restorePurchases(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  try {
    const info = await Purchases.restorePurchases();
    return isEntitlementActive(info);
  } catch {
    return false;
  }
}

export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  if (Platform.OS === "web") return null;
  try {
    return await Purchases.getCustomerInfo();
  } catch {
    return null;
  }
}

// Legacy alias — keeps older call sites working
export async function purchasePremium(): Promise<boolean> {
  const offering = await getOffering();
  const pkg = offering.monthly ?? offering.yearly ?? offering.lifetime;
  if (!pkg) return false;
  return purchasePackage(pkg);
}

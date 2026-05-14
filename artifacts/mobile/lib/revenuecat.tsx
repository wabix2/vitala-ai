import React, { createContext, useContext } from "react";
import Purchases, { LOG_LEVEL } from "react-native-purchases";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const REVENUECAT_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY ?? "";

export const ENTITLEMENT_ID = "pro";

let rcInitialized = false;

export function initializeRevenueCat() {
  if (!REVENUECAT_API_KEY) {
    console.warn("[RevenueCat] EXPO_PUBLIC_REVENUECAT_API_KEY not set — purchases disabled");
    return;
  }
  try {
    Purchases.setLogLevel(LOG_LEVEL.WARN);
    Purchases.configure({ apiKey: REVENUECAT_API_KEY });
    rcInitialized = true;
  } catch (err) {
    console.warn("[RevenueCat] init failed:", err);
  }
}

function useSubscriptionContext() {
  const queryClient = useQueryClient();

  const customerInfoQuery = useQuery({
    queryKey: ["revenuecat", "customer-info"] as const,
    queryFn: () => (rcInitialized ? Purchases.getCustomerInfo() : Promise.resolve(null)),
    staleTime: 60_000,
    retry: 1,
  });

  const offeringsQuery = useQuery({
    queryKey: ["revenuecat", "offerings"] as const,
    queryFn: () => (rcInitialized ? Purchases.getOfferings() : Promise.resolve(null)),
    staleTime: 300_000,
    retry: 1,
  });

  const purchaseMutation = useMutation({
    mutationFn: async (pkg: any) => {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      return customerInfo;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["revenuecat"] });
    },
  });

  const restoreMutation = useMutation({
    mutationFn: () => Purchases.restorePurchases(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["revenuecat"] });
    },
  });

  const isSubscribed =
    (customerInfoQuery.data?.entitlements?.active as Record<string, unknown>)?.[ENTITLEMENT_ID] !== undefined;

  return {
    customerInfo: customerInfoQuery.data ?? null,
    offerings: offeringsQuery.data ?? null,
    isSubscribed,
    isLoading: customerInfoQuery.isLoading || offeringsQuery.isLoading,
    purchase: purchaseMutation.mutateAsync,
    restore: restoreMutation.mutateAsync,
    isPurchasing: purchaseMutation.isPending,
    isRestoring: restoreMutation.isPending,
    purchaseError: purchaseMutation.error,
    refetchCustomerInfo: customerInfoQuery.refetch,
    rcAvailable: rcInitialized,
  };
}

type SubscriptionContextValue = ReturnType<typeof useSubscriptionContext>;
const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const value = useSubscriptionContext();
  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error("useSubscription must be used within SubscriptionProvider");
  return ctx;
}

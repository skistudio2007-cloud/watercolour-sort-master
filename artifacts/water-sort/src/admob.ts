import {
  AdMob,
  BannerAdPosition,
  AdmobConsentStatus,
} from "@capacitor-community/admob";

// ─────────────────────────────────────────────────────────────────────────────
// GOOGLE TEST AD UNIT IDs (Official Google AdMob Sample Ad Units)
// Android official test ad IDs from Google Developers documentation:
// https://developers.google.com/admob/android/test-ads
// ─────────────────────────────────────────────────────────────────────────────

export const TEST_INTERSTITIAL_ID = "ca-app-pub-3940256099942544/1033173712";
export const TEST_REWARDED_ID     = "ca-app-pub-3940256099942544/5224354917";
export const TEST_BANNER_ID       = "ca-app-pub-3940256099942544/6300978111";

// Production AdMob IDs
export const PROD_INTERSTITIAL_ID = "ca-app-pub-2007565791914092/1369888538";
export const PROD_REWARDED_ID     = "ca-app-pub-2007565791914092/4048751713";
export const PROD_BANNER_ID       = "ca-app-pub-2007565791914092/9861305428";

/**
 * Storage key to toggle between Test Ads and Production Ads.
 * Default is TRUE (Test Ads enabled) as requested.
 */
const KEY_USE_TEST_ADS = "ws2_use_test_ads";

export function isUsingTestAds(): boolean {
  try {
    const val = localStorage.getItem(KEY_USE_TEST_ADS);
    // If not set, default to true (Test Ads mode)
    if (val === null) return true;
    return val === "true";
  } catch {
    return true;
  }
}

export function setUseTestAds(enabled: boolean): void {
  try {
    localStorage.setItem(KEY_USE_TEST_ADS, enabled ? "true" : "false");
    console.log(`[AdMob] Test ads mode set to: ${enabled}`);
  } catch {
    // Ignore
  }
}

export function getInterstitialId(): string {
  return isUsingTestAds() ? TEST_INTERSTITIAL_ID : PROD_INTERSTITIAL_ID;
}

export function getRewardedId(): string {
  return isUsingTestAds() ? TEST_REWARDED_ID : PROD_REWARDED_ID;
}

export function getBannerId(): string {
  return isUsingTestAds() ? TEST_BANNER_ID : PROD_BANNER_ID;
}

// ─────────────────────────────────────────────────────────────────────────────
// STATE
// ─────────────────────────────────────────────────────────────────────────────

let isAdMobInitialized = false;
let rewardedAdInProgress = false;
let interstitialAdInProgress = false;

// ─────────────────────────────────────────────────────────────────────────────
// INITIALIZE ADMOB
// ─────────────────────────────────────────────────────────────────────────────

export async function initializeAdMob(): Promise<void> {
  if (isAdMobInitialized) {
    console.log("[AdMob] already initialized");
    return;
  }

  try {
    console.log(`[AdMob] initializing (Test Ads: ${isUsingTestAds()})...`);

    await AdMob.initialize({
      testingDevices: ["EMULATOR"],
      initializeForTesting: isUsingTestAds(),
    });

    isAdMobInitialized = true;
    console.log("[AdMob] initialized successfully");

    // Consent Request
    try {
      const consentInfo = await AdMob.requestConsentInfo();
      console.log("[AdMob] consent info:", consentInfo);

      if (
        consentInfo.isConsentFormAvailable &&
        consentInfo.status === AdmobConsentStatus.REQUIRED
      ) {
        await AdMob.showConsentForm();
        console.log("[AdMob] consent form completed");
      }
    } catch (consentError) {
      console.log("[AdMob] consent notice:", consentError);
    }
  } catch (error) {
    console.log("[AdMob] initialization error:", error);
    isAdMobInitialized = false;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// INTERSTITIAL AD (Supports Google Test Ads)
// ─────────────────────────────────────────────────────────────────────────────

export async function showInterstitialAd(): Promise<boolean> {
  if (interstitialAdInProgress) {
    console.log("[AdMob] interstitial already in progress - ignored");
    return false;
  }

  interstitialAdInProgress = true;
  const adId = getInterstitialId();

  const isBrowser = typeof window !== "undefined" && !(window as any).Capacitor?.isNativePlatform?.();
  if (isBrowser) {
    // Zero Google Ads displayed on Windows / Desktop / Web
    interstitialAdInProgress = false;
    return true;
  }

  try {
    console.log(`[AdMob] preparing interstitial (${isUsingTestAds() ? "TEST" : "PROD"}: ${adId})...`);

    await AdMob.prepareInterstitial({
      adId,
      isTesting: isUsingTestAds(),
    });

    console.log("[AdMob] interstitial prepared");
    await AdMob.showInterstitial();
    console.log("[AdMob] interstitial shown successfully");
    return true;
  } catch (error) {
    console.log("[AdMob] interstitial native error:", error);
    return false;
  } finally {
    interstitialAdInProgress = false;
    console.log("[AdMob] interstitial flow finished");
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// REWARDED VIDEO AD (Supports Google Test Ads on Native)
// ─────────────────────────────────────────────────────────────────────────────

export async function showRewardedAd(): Promise<boolean> {
  if (rewardedAdInProgress) {
    console.log("[AdMob] rewarded already in progress - ignored");
    return false;
  }

  rewardedAdInProgress = true;
  const adId = getRewardedId();

  // On Windows / Desktop / Web: Zero Google Ads displayed, grant reward directly
  const isBrowser = typeof window !== "undefined" && !(window as any).Capacitor?.isNativePlatform?.();
  if (isBrowser) {
    console.log("[AdMob] Windows/Web environment - granting reward directly with zero Google Ads");
    rewardedAdInProgress = false;
    return true;
  }

  // Running on Native Mobile Platform (Android / iOS)
  try {
    console.log(`[AdMob] preparing rewarded (${isUsingTestAds() ? "TEST" : "PROD"}: ${adId})...`);

    await AdMob.prepareRewardVideoAd({
      adId,
      isTesting: isUsingTestAds(),
    });

    console.log("[AdMob] rewarded prepared, showing now...");
    const reward = await AdMob.showRewardVideoAd();
    console.log("[AdMob] rewarded result:", reward);

    if (reward) {
      console.log("[AdMob] rewarded successfully completed");
      return true;
    }

    console.log("[AdMob] rewarded closed/failed without reward");
    return false;
  } catch (error) {
    console.log("[AdMob] rewarded native error:", error);
    return false;
  } finally {
    rewardedAdInProgress = false;
    console.log("[AdMob] rewarded flow finished");
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// BANNER AD (Supports Google Test Ads)
// ─────────────────────────────────────────────────────────────────────────────

export async function showBannerAd(): Promise<boolean> {
  const isBrowser = typeof window !== "undefined" && !(window as any).Capacitor?.isNativePlatform?.();
  if (isBrowser) {
    return false;
  }

  const adId = getBannerId();

  try {
    console.log(`[AdMob] showing banner (${isUsingTestAds() ? "TEST" : "PROD"}: ${adId})...`);

    await AdMob.showBanner({
      adId,
      isTesting: isUsingTestAds(),
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 0,
    });

    console.log("[AdMob] banner shown");
    return true;
  } catch (error) {
    console.log("[AdMob] banner error:", error);
    return false;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// HIDE BANNER
// ─────────────────────────────────────────────────────────────────────────────

export async function hideBannerAd(): Promise<boolean> {
  try {
    await AdMob.hideBanner();
    console.log("[AdMob] banner hidden");
    return true;
  } catch (error) {
    console.log("[AdMob] hide banner error:", error);
    return false;
  }
}
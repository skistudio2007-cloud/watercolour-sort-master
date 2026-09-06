import { showRewardedAd as showRealRewardedAd } from "@/admob";
import { toast } from "@/hooks/use-toast";

export type AdReward = "hint" | "skip" | "bottle" | "theme" | "undo";

// Prevent two rewarded ads from opening at the same time
let rewardedAdInProgress = false;

export async function showRewardedAd(
  reward: AdReward,
  onReward: () => void,
  onFailed?: () => void,
): Promise<void> {
  // 🚫 Already showing an ad
  if (rewardedAdInProgress) {
    console.log(
      `[AdManager] Rewarded ad already in progress. Ignoring: ${reward}`,
    );
    return;
  }

  rewardedAdInProgress = true;

  console.log(`[AdManager] Starting rewarded ad: ${reward}`);

  try {
    // Show ONE rewarded ad
    const rewarded = await showRealRewardedAd();

    if (rewarded) {
      console.log(`[AdManager] Reward granted: ${reward}`);

      // ✅ Give reward immediately after ad completes
      try {
        onReward();
      } catch (rewardError) {
        console.error(
          `[AdManager] Reward callback error:`,
          rewardError,
        );
      }
    } else {
      console.log(`[AdManager] Rewarded ad failed/unavailable: ${reward}`);
      // Show user-facing notification when rewarded ad is not available
      try {
        toast({
          title: "No Ads Available",
          description: "No ads are currently available. Please try again in a moment.",
          variant: "destructive",
        });
      } catch (e) {
        console.error("[AdManager] Toast error:", e);
      }

      try {
        onFailed?.();
      } catch (failedError) {
        console.error(
          `[AdManager] Failure callback error:`,
          failedError,
        );
      }
    }
  } catch (error) {
    console.error(`[AdManager] Rewarded ad error:`, error);
    try {
      toast({
        title: "No Ads Available",
        description: "Ad service is currently unavailable. Please try again later.",
        variant: "destructive",
      });
    } catch (e) {
      console.error("[AdManager] Toast error:", e);
    }

    try {
      onFailed?.();
    } catch (failedError) {
      console.error(
        `[AdManager] Failure callback error:`,
        failedError,
      );
    }
  } finally {
    // 🔓 Allow another ad only after this ad flow is completely finished
    rewardedAdInProgress = false;

    console.log(
      `[AdManager] Rewarded ad flow finished: ${reward}`,
    );
  }
}
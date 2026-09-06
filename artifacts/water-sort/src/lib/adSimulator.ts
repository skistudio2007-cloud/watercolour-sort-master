// ─── AdMob Simulator & Events for Browser/Desktop ─────────────────────────────

export interface AdSimulationRequest {
  type: "rewarded" | "interstitial";
  adUnitId: string;
  onReward?: () => void;
  onClose: (completed: boolean) => void;
}

type AdListener = (req: AdSimulationRequest | null) => void;
const listeners: Set<AdListener> = new Set();

let currentAdRequest: AdSimulationRequest | null = null;

export function subscribeAdModal(listener: AdListener): () => void {
  listeners.add(listener);
  if (currentAdRequest) {
    listener(currentAdRequest);
  }
  return () => {
    listeners.delete(listener);
  };
}

export function triggerSimulatedAd(req: AdSimulationRequest): void {
  currentAdRequest = req;
  listeners.forEach((l) => l(req));
}

export function closeSimulatedAd(completed: boolean): void {
  if (currentAdRequest) {
    const req = currentAdRequest;
    currentAdRequest = null;
    listeners.forEach((l) => l(null));
    req.onClose(completed);
  }
}

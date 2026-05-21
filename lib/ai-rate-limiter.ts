const globalState = global as unknown as {
  dailyCount?: number;
  lastResetDay?: number;
  rpmTimestamps?: number[];
};

if (typeof globalState.dailyCount === "undefined") {
  globalState.dailyCount = 0;
  globalState.lastResetDay = new Date().getDate();
  globalState.rpmTimestamps = [];
}

export function checkQuotaAndConsume() {
  const now = Date.now();
  const currentDay = new Date(now).getDate();

  if (currentDay !== globalState.lastResetDay) {
    globalState.dailyCount = 0;
    globalState.lastResetDay = currentDay;
  }

  if (globalState.dailyCount! >= 1500) {
    throw new Error("Google AI Daily Limit (1500 RPD) reached. Try Tomorrow.");
  }

  const sixtySecondsAgo = now - 60000;

  while (
    globalState.rpmTimestamps!.length > 0 &&
    globalState.rpmTimestamps![0] < sixtySecondsAgo
  ) {
    globalState.rpmTimestamps!.shift();
  }

  if (globalState.rpmTimestamps!.length >= 15) {
    throw new Error("Rate limit (15 RPM) reached. Please wait 60 seconds.");
  }

  globalState.dailyCount!++;
  globalState.rpmTimestamps!.push(now);
}

export function getQuotaMetrics() {
  return {
    rpdRemaining: 1500 - (globalState.dailyCount || 0),
    rpmRemaining: 15 - (globalState.rpmTimestamps?.length || 0),
  };
}

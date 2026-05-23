const REQUEST_PER_DAY = 20;
const REQUEST_PER_MINUTE = 5;

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

function checkQuotaAndConsume() {
  const now = Date.now();
  const currentDay = new Date(now).getDate();

  if (currentDay !== globalState.lastResetDay) {
    globalState.dailyCount = 0;
    globalState.lastResetDay = currentDay;
  }

  if (globalState.dailyCount! >= REQUEST_PER_DAY) {
    throw new Error(`Google AI Daily Limit (${REQUEST_PER_DAY} RPD) reached. Try Tomorrow.`);
  }

  const sixtySecondsAgo = now - 60000;

  while (
    globalState.rpmTimestamps!.length > 0 &&
    globalState.rpmTimestamps![0] < sixtySecondsAgo
  ) {
    globalState.rpmTimestamps!.shift();
  }

  if (globalState.rpmTimestamps!.length >= REQUEST_PER_MINUTE) {
    throw new Error(`Rate limit (${REQUEST_PER_MINUTE} RPM) reached. Please wait 60 seconds.`);
  }

  globalState.dailyCount!++;
  globalState.rpmTimestamps!.push(now);
}

function getQuotaMetrics() {
  return {
    rpdRemaining: REQUEST_PER_DAY - (globalState.dailyCount || 0),
    rpmRemaining: REQUEST_PER_MINUTE - (globalState.rpmTimestamps?.length || 0),
  };
}

export { checkQuotaAndConsume, getQuotaMetrics, REQUEST_PER_DAY, REQUEST_PER_MINUTE };

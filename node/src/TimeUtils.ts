
const timers: {[key: string]: {timeout: any; endCB?: () => void}} = {};
const CONSTANT_TIME_INC = false

export function doTimer(
    name: string, length: number, resolution: number,
    oninstance: (steps: number, count: number) => void,
    oncomplete?: () => void) {
  const steps = length / resolution;
  const speed = resolution;
  let count = 0;
  const start = new Date().getTime();
  let lastTime = start;
  const instance = () => {
    const trueCount = count
    count++;
    const now = new Date().getTime()
    const elapsedTime = (now - start)
    const estimatedCount = Math.min(steps, elapsedTime / resolution)
    const estimatedOrTrueCount = CONSTANT_TIME_INC ? trueCount : estimatedCount;
    if (trueCount >= steps ||
        (!CONSTANT_TIME_INC && (estimatedCount >= steps))) {
      oninstance(steps, steps);
      stopTimer(name);
      // if (oncomplete) {oncomplete(); }
    } else {
      oninstance(steps, estimatedOrTrueCount);
      const diffRunningTime = elapsedTime - (trueCount * speed)
      const deltaNext = speed - (CONSTANT_TIME_INC ? 0 : diffRunningTime);
      //   debugTime(
      //       'diff', diffRunningTime, 'estCount', estimatedOrTrueCount, 'err',
      //       (now - lastTime) - speed, 'ms', 'nextDelta', deltaNext, 'ms');
      timers[name].timeout = setTimeout(instance, Math.max(0, deltaNext));
      lastTime = now
    }
  };
  stopTimer(name);
  timers[name] = {
    timeout: null,
    endCB: () => {
      console.log('end timer');
      if (oncomplete) {
        oncomplete();
      }
    }
  };
  console.log('timer', name, speed, 'ms');
  instance();
  // oninstance(steps, count);
}

export function stopTimer(name: string) {
  if (timers[name]) {
    clearTimeout(timers[name].timeout);
    const endCB = timers[name].endCB;
    if (endCB) {
      endCB();
    }
    delete timers[name];
  }
}

function
getMs() {
  return new Date().getTime();
}

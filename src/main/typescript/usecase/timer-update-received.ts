import type { Progress } from './lib/progress';

export const update = (currentProgress: Progress, now: Date) => {
    return currentProgress.updateTime(now);
}

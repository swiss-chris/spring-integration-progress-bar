import type { Progress } from '../core/progress';

export const update = (currentProgress: Progress, now: Date) => {
    return currentProgress.updateTime(now);
}

import { Action, effect } from '@reatom/core';
import { isProgressVisibleAtom } from '@/features/ProgressBar/model';

type AsyncActionWithPending = Action & {
  pending: () => number;
};

export const withProgress =
  <T extends AsyncActionWithPending>() =>
  (anAsync: T): T => {
    effect(
      () => {
        const pending = anAsync.pending();

        if (pending > 0) {
          isProgressVisibleAtom.set(true);
        } else {
          isProgressVisibleAtom.set(false);
        }
      },
      `${anAsync.name || 'async'}.progressEffect`
    );

    return anAsync;
  };

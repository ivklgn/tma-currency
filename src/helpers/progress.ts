import { AsyncAction, Ctx } from '@reatom/framework';
import { isProgressVisibleAtom } from '@/features/ProgressBar';

export const withProgress =
  <T extends AsyncAction>() =>
  (anAsync: T): T => {
    anAsync.onCall((ctx) => {
      const isVisible = ctx.get(isProgressVisibleAtom);

      if (!isVisible) {
        isProgressVisibleAtom(ctx, true);
      }
    });

    const onFulfillHandler = (ctx: Ctx) => {
      const isVisible = ctx.get(isProgressVisibleAtom);

      if (isVisible) {
        isProgressVisibleAtom(ctx, false);
      }
    };

    anAsync.onFulfill.onCall(onFulfillHandler);
    anAsync.onReject.onCall(onFulfillHandler);

    return anAsync;
  };

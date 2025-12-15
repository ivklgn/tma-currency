import { reatomComponent } from '@reatom/react';
import { isProgressVisibleAtom } from '@/features/ProgressBar/model';

import './ProgressBar.css';

export const ProgressBar = reatomComponent(() => {
  const isProgressVisible = isProgressVisibleAtom();

  if (!isProgressVisible) {
    return null;
  }

  return <div className="progressBar" />;
}, 'ProgressBar');

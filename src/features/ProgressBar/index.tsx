import { useAtom } from '@reatom/npm-react';
import { isProgressVisibleAtom } from '@/features/ProgressBar/model';

import './ProgressBar.css';

export const ProgressBar = () => {
  const [isProgressVisible] = useAtom(isProgressVisibleAtom);

  if (!isProgressVisible) {
    return null;
  }

  return <div className="progressBar" />;
};

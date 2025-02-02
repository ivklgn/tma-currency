import { useAtom } from '@reatom/npm-react';
import { atom } from '@reatom/framework';

import './ProgressBar.css';

export const isProgressVisibleAtom = atom(false, 'isProgressVisibleAtom');

export const ProgressBar = () => {
  const [isProgressVisible] = useAtom(isProgressVisibleAtom);

  if (!isProgressVisible) {
    return null;
  }

  return <div className="progressBar" />;
};

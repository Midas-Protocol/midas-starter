import { useRari } from '@context/RariContext';

export const useAuthedCallback = (callback: () => any) => {
  const { isAuthed, accountBtnElement } = useRari();

  return () => {
    if (isAuthed) {
      return callback();
    } else {
      return accountBtnElement.current.click();
    }
  };
};

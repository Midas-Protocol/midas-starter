import { useRari } from '@context/RariContext';

export const useAuthedCallback = (callback: () => any) => {
  const { isAuthed, accountBtnElement, isUnsupported, networkBtnElement } = useRari();

  return () => {
    if (isAuthed) {
      if (isUnsupported) {
        return networkBtnElement.current.click();
      } else {
        return callback();
      }
    } else {
      return accountBtnElement.current.click();
    }
  };
};

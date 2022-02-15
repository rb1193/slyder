import { RefObject, useLayoutEffect } from 'react';

export const useSetContainerWidthEffect = (
  containerRef: RefObject<HTMLElement>,
  setWidth: (width: number) => void,
) => {
  useLayoutEffect(() => {
    setWidth(containerRef.current?.clientWidth ?? 0);
  }, []);
};

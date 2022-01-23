import { useState } from 'react';

export const useSlyder = () => {
  const [visibleSlideIndex] = useState(0);

  return {
    getSlideProps: ({ index }: { index: number }) => ({
      'aria-hidden': index !== visibleSlideIndex,
    }),
  };
};

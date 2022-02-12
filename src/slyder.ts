import {
  HTMLProps, useLayoutEffect, useRef, useState,
} from 'react';

const mergeRefs = <T>(...refs: any[]) => (node: T) => {
  refs.forEach((ref) => {
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      // eslint-disable-next-line no-param-reassign
      ref.current = node;
    }
  });
};

export const useSlyder = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);

  const [visibleSlideIndex, setVisibleSlideIndex] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  const totalSlides = trackRef.current?.children.length ?? 1;

  useLayoutEffect(() => {
    setContainerWidth(containerRef.current?.clientWidth ?? 0);
  }, []);

  return {
    getSlyder: () => ({
      trackPosition: -visibleSlideIndex * containerWidth,
      visibleSlideIndex,
    }),
    getContainerProps: ({ ref, ...props }: HTMLProps<HTMLElement>) => ({
      ...props,
      ref: mergeRefs(containerRef, ref),
      style: {
        overflow: 'hidden',
        ...props.style,
      },
    }),
    getTrackProps: <ExtraProps>(props: HTMLProps<HTMLUListElement> & ExtraProps) => ({
      ...props,
      ref: trackRef,
      style: {
        display: 'flex',
        width: containerWidth * totalSlides,
        ...props.style,
      },
    }),
    getPrevButtonProps: (props: HTMLProps<HTMLButtonElement>) => ({
      ...props,
      type: 'button' as 'button',
      'aria-label': 'previous',
      onClick: () => {
        setVisibleSlideIndex((value) => (value > 0 ? value - 1 : 0));
      },
    }),
    getNextButtonProps: (props: HTMLProps<HTMLButtonElement>) => ({
      ...props,
      type: 'button' as 'button',
      'aria-label': 'next',
      onClick: () => {
        setVisibleSlideIndex((value) => (value < (totalSlides - 1)
          ? value + 1 : (totalSlides - 1)));
      },
    }),
    getSlideProps: ({ index, ...props }: { index: number } & HTMLProps<HTMLLIElement>) => ({
      ...props,
      'aria-hidden': index !== visibleSlideIndex,
      style: {
        width: containerWidth,
        ...props.style,
      },
    }),
    getControlProps: ({ index, ...props }: { index: number } & HTMLProps<HTMLButtonElement>) => ({
      type: 'button' as 'button',
      'aria-label': `Go to slide ${index} of ${totalSlides}`,
      disabled: index === visibleSlideIndex,
      onClick: () => setVisibleSlideIndex(index),
      ...props,
    }),
  };
};

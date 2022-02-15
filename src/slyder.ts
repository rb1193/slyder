import {
  HTMLProps, useRef, useState,
} from 'react';
import { useSetContainerWidthEffect } from './dom-effects';

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

  useSetContainerWidthEffect(containerRef, setContainerWidth);

  return {
    getSlyder: () => ({
      trackPosition: -visibleSlideIndex * containerWidth,
      visibleSlideIndex,
    }),
    getContainerProps: <ExtraProps>({ ref, ...props }: HTMLProps<HTMLElement> & ExtraProps) => ({
      ...props,
      ref: mergeRefs(containerRef, ref),
      style: {
        overflow: 'hidden',
        ...props.style,
      },
    }),
    getTrackProps: <ExtraProps>({ ref, ...props }: HTMLProps<HTMLUListElement> & ExtraProps) => ({
      ...props,
      ref: mergeRefs(trackRef, ref),
      style: {
        display: 'flex',
        width: containerWidth * totalSlides,
        transform: `translateX(${-containerWidth * visibleSlideIndex}px)`,
        ...props.style,
      },
    }),
    getPrevButtonProps: <ExtraProps>(props: HTMLProps<HTMLButtonElement> & ExtraProps) => ({
      ...props,
      type: 'button' as 'button',
      'aria-label': 'previous',
      onClick: () => {
        setVisibleSlideIndex((value) => (value > 0 ? value - 1 : 0));
      },
    }),
    getNextButtonProps: <ExtraProps>(props: HTMLProps<HTMLButtonElement> & ExtraProps) => ({
      ...props,
      type: 'button' as 'button',
      'aria-label': 'next',
      onClick: () => {
        setVisibleSlideIndex((value) => (value < (totalSlides - 1)
          ? value + 1 : (totalSlides - 1)));
      },
    }),
    getSlideProps: <ExtraProps>({ index, ...props }: {
      index: number
    } & HTMLProps<HTMLLIElement> & ExtraProps) => ({
      ...props,
      'aria-hidden': index !== visibleSlideIndex,
      style: {
        width: containerWidth,
        ...props.style,
      },
    }),
    getControlProps: ({ index, ...props }: { index: number } & HTMLProps<HTMLButtonElement>) => ({
      type: 'button' as 'button',
      'aria-label': `Go to slide ${index + 1} of ${totalSlides}`,
      disabled: index === visibleSlideIndex,
      onClick: () => setVisibleSlideIndex(index),
      ...props,
    }),
  };
};

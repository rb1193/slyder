import {
  HTMLProps, useEffect, useRef, useState,
} from 'react';
import { useSetContainerWidthEffect } from './dom-effects';
import useSlyderReducer from './useSlyderReducer';
import useSlyderSwipeEffect from './useSlyderSwipeEffect';

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

export type SlyderState = {
  swipingFrom?: number,
  swipeDistance: number,
  visibleSlideIndex: number,
}

export enum SlyderActionType {
  GOTO = 'goto',
  NEXT = 'next',
  PREVIOUS = 'previous',
  POINTER_DOWN = 'pointerdown',
  POINTER_MOVE = 'pointermove',
  POINTER_UP = 'pointerup',
  POINTER_CANCEL = 'pointercancel',
}

export type PointerDownAction = {
  type: SlyderActionType.POINTER_DOWN,
  payload: { x: number },
}

export type PointerMoveAction = {
  type: SlyderActionType.POINTER_MOVE,
  payload: { x: number },
}

export type PointerUpAction = {
  type: SlyderActionType.POINTER_UP,
  payload: { x: number },
}

export type NextAction = {
  type: SlyderActionType.NEXT,
}

export type PreviousAction = {
  type: SlyderActionType.PREVIOUS, 
}

export type GoToAction = {
  type: SlyderActionType.GOTO,
  payload: { index: number },
}

export type SlyderAction = NextAction | PreviousAction | GoToAction | PointerDownAction | PointerMoveAction | PointerUpAction;

export enum SwipeDirection {
  NEXT = 'next',
  PREV = 'prev',
}

export interface UseSlyderProps {
  infinite: boolean,
  swipeThreshold: number|false,
}

export const useSlyder = ({ infinite, swipeThreshold }: UseSlyderProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);

  const [containerWidth, setContainerWidth] = useState(0);

  const totalSlides = trackRef.current?.children.length ?? 1;

  const [{ swipingFrom, swipeDistance, visibleSlideIndex }, dispatch] = useSlyderReducer({
    infinite,
    totalSlides,
    containerWidth,
    swipeThreshold,
  });

  const trackPosition = (-containerWidth * visibleSlideIndex) + swipeDistance;

  // TODO: figure out how to do this without breaking the total slide count
  const renderedSlideIndexes = [visibleSlideIndex - 1, visibleSlideIndex, visibleSlideIndex + 1].filter((slideIndex) => {
    if (infinite) return true;
    if (slideIndex >= totalSlides) return false;
    if (slideIndex < 0) return false;
    return true;
  }).map(slideIndex => slideIndex % totalSlides)

  useSetContainerWidthEffect(containerRef, setContainerWidth);

  useSlyderSwipeEffect({ dispatch, swipingFrom, trackRef })

  const handlePointerDown = (event: PointerEvent) => {
    if (!event.isPrimary) return;
    dispatch({ type: SlyderActionType.POINTER_DOWN, payload: { x: event.pageX } });
  };

  return {
    getSlyder: () => ({
      trackPosition,
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
      onPointerDown: handlePointerDown,
      ref: mergeRefs(trackRef, ref),
      style: {
        display: 'flex',
        width: containerWidth * totalSlides,
        transform: `translateX(${trackPosition}px)`,
        pointerEvents: swipeThreshold === false ? 'none' : null,
        ...props.style,
      },
    }),
    getPrevButtonProps: <ExtraProps>(props: HTMLProps<HTMLButtonElement> & ExtraProps) => ({
      ...props,
      type: 'button' as 'button',
      'aria-label': 'previous',
      onClick: () => {
        dispatch({ type: SlyderActionType.PREVIOUS });
      },
    }),
    getNextButtonProps: <ExtraProps>(props: HTMLProps<HTMLButtonElement> & ExtraProps) => ({
      ...props,
      type: 'button' as 'button',
      'aria-label': 'next',
      onClick: () => {
        dispatch({ type: SlyderActionType.NEXT })
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
      onClick: () => dispatch({ type: SlyderActionType.GOTO, payload: { index } }),
      ...props,
    }),
    renderSlides: (callback: (slideIndex: number) => JSX.Element) => renderedSlideIndexes.map(callback),
  };
};

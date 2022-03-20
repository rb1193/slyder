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
  swipeThreshold: number|false,
}

export const useSlyder = ({ swipeThreshold }: UseSlyderProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);

  const [containerWidth, setContainerWidth] = useState(0);

  const totalSlides = trackRef.current?.children.length ?? 1;

  const [{ swipingFrom, swipeDistance, visibleSlideIndex }, dispatch] = useSlyderReducer({
    totalSlides,
    containerWidth,
    swipeThreshold,
  });

  const trackPosition = (-containerWidth * visibleSlideIndex) + swipeDistance;

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
  };
};

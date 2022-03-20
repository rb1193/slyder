import {
  HTMLProps, useEffect, useReducer, useRef, useState,
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

type SlyderState = {
  swipingFrom?: number,
  swipeDistance: number,
  visibleSlideIndex: number,
}

enum SlyderActionType {
  GOTO = 'goto',
  NEXT = 'next',
  PREVIOUS = 'previous',
  POINTER_DOWN = 'pointerdown',
  POINTER_MOVE = 'pointermove',
  POINTER_UP = 'pointerup',
  POINTER_CANCEL = 'pointercancel',
}

type PointerDownAction = {
  type: SlyderActionType.POINTER_DOWN,
  payload: { x: number },
}

type PointerMoveAction = {
  type: SlyderActionType.POINTER_MOVE,
  payload: { x: number },
}

type PointerUpAction = {
  type: SlyderActionType.POINTER_UP,
  payload: { x: number },
}

type NextAction = {
  type: SlyderActionType.NEXT,
}

type PreviousAction = {
  type: SlyderActionType.PREVIOUS, 
}

type GoToAction = {
  type: SlyderActionType.GOTO,
  payload: { index: number },
}

type SlyderAction = NextAction | PreviousAction | GoToAction | PointerDownAction | PointerMoveAction | PointerUpAction;

enum SwipeDirection {
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

  const [{ swipingFrom, swipeDistance, visibleSlideIndex }, dispatch] = useReducer((state: SlyderState, action: SlyderAction) => {
    const getSafeVisibleSlideIndex = (newSlideIndex: number) => {
      if (newSlideIndex >= totalSlides) return state.visibleSlideIndex;
      if (newSlideIndex < 0) return state.visibleSlideIndex;
      return newSlideIndex;
    }

    switch (action.type) {
      case SlyderActionType.NEXT:
        return {
          ...state,
          visibleSlideIndex: getSafeVisibleSlideIndex(state.visibleSlideIndex + 1),
        }
      case SlyderActionType.PREVIOUS:
        return {
          ...state,
          visibleSlideIndex: getSafeVisibleSlideIndex(state.visibleSlideIndex - 1),
        };
      case SlyderActionType.GOTO:
        return {
          ...state,
          visibleSlideIndex: getSafeVisibleSlideIndex(action.payload.index),
        }
      case SlyderActionType.POINTER_DOWN:
        return {
          ...state,
          swipingFrom: action.payload.x,
        };
      case SlyderActionType.POINTER_MOVE:
        if (state.swipingFrom === undefined) return state;
        return {
          ...state,
          swipeDistance: action.payload.x - state.swipingFrom,
        };
      case SlyderActionType.POINTER_UP:
        if (state.swipingFrom === undefined) return state;
        const hasSwipedAcrossThreshold = Math.abs(state.swipeDistance) > containerWidth * (swipeThreshold || Infinity);

        if (!hasSwipedAcrossThreshold) {
          return {
            swipeDistance: 0,
            visibleSlideIndex: state.visibleSlideIndex,
          }
        }

        const swipeDirection = state.swipeDistance >= 0 ? SwipeDirection.PREV : SwipeDirection.NEXT;
        const newSlideIndexOffset = swipeDirection === SwipeDirection.NEXT ? 1 : -1;
        
        return {
          swipeDistance: 0,
          visibleSlideIndex: getSafeVisibleSlideIndex(state.visibleSlideIndex + newSlideIndexOffset),
        };
      default:
        throw new Error(`Unexpected swipe action type`);
    }
  }, {
    swipeDistance: 0,
    visibleSlideIndex: 0,
  });

  const trackPosition = (-containerWidth * visibleSlideIndex) + swipeDistance;

  useSetContainerWidthEffect(containerRef, setContainerWidth);

  useEffect(() => {
    if (!trackRef.current) return;
    if (swipingFrom === undefined) return;

    const handlePointerMove = (event: PointerEvent) => {
      if (!event.isPrimary) return;
      dispatch({ type: SlyderActionType.POINTER_MOVE, payload: { x: event.pageX } });
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (!event.isPrimary) return;
      dispatch({ type: SlyderActionType.POINTER_UP, payload: { x: event.pageX } });
    };

    trackRef.current.addEventListener('pointermove', handlePointerMove);
    trackRef.current.addEventListener('pointerup', handlePointerUp);


    return () => {
      trackRef.current?.removeEventListener('pointermove', handlePointerMove);
      trackRef.current?.removeEventListener('pointerup', handlePointerUp);
    };
  }, [swipingFrom]);

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
        pointerEvents: typeof swipeThreshold === 'number' ? 'initial' : 'none',
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

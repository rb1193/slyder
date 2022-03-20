import { useReducer } from "react";
import { SlyderState, SlyderAction, SlyderActionType, SwipeDirection } from "./slyder";

export interface SlyderReducerProps {
  totalSlides: number,
  containerWidth: number,
  infinite: boolean,
  swipeThreshold: number | false,
}

export default ({ totalSlides, infinite, containerWidth, swipeThreshold }: SlyderReducerProps) => useReducer((state: SlyderState, action: SlyderAction) => {
  const getSafeVisibleSlideIndex = (newSlideIndex: number) => {
    if (infinite) return newSlideIndex;
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
})
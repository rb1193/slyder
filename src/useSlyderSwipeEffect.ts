import { Dispatch, RefObject, useEffect } from "react";
import { SlyderAction, SlyderActionType } from "./slyder";

export interface SlyderSwipeEffectProps {
  dispatch: Dispatch<SlyderAction>,
  swipingFrom?: number;
  trackRef: RefObject<HTMLElement>,
}

export default ({ dispatch, swipingFrom, trackRef }: SlyderSwipeEffectProps) => {
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
}
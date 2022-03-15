import '@testing-library/jest-dom';

const pointerEventProps = ['clientX', 'clientY', 'pageX', 'pageY', 'isPrimary', 'pointerType'];
class PointerEventFake extends Event {
  constructor(type: string, props: PointerEventInit) {
    super(type, props);
    pointerEventProps.forEach((prop) => {
      if (props[prop as keyof PointerEventInit] != null) {
        // @ts-ignore
        this[prop] = props[prop as keyof PointerEventInit];
      }
    });
  }
}

// @ts-ignore
global.PointerEvent = PointerEventFake
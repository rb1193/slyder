import React, { useLayoutEffect, ComponentPropsWithoutRef } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useSetContainerWidthEffect } from './dom-effects';
import { useSlyder } from './slyder';

jest.mock('./dom-effects');

describe('Slyder', () => {
  const containerWidth = 1600;

  const mockUseSetContainerWidthEffect = useSetContainerWidthEffect as jest.Mock;
  mockUseSetContainerWidthEffect.mockImplementation((_, setWidth: (width: number) => void) => {
    useLayoutEffect(() => {
      setWidth(containerWidth);
    }, []);
  });

  const Slyder = () => {
    const {
      getControlProps,
      getContainerProps,
      getTrackProps,
      getSlideProps,
      getPrevButtonProps,
      getNextButtonProps,
    } = useSlyder({ swipeThreshold: 0.5 });

    const slides = [
      {
        key: 'One',
        text: 'One',
        color: 'lightcyan',
      },
      {
        key: 'Two',
        text: 'Two',
        color: 'lightcoral',
      },
      {
        key: 'Three',
        text: 'Three',
        color: 'lightgreen',
      },
    ];

    return (
      <div {...getContainerProps({ 'data-testid': 'slyder-container' })}>
        <ul {...getTrackProps({ 'data-testid': 'slyder-track' })}>
          {slides.map(({ key, text, color }, index) => (
            <li
              key={key}
              {...getSlideProps({
                index,
                style: { background: color },
              })}
            >
              {text}
            </li>
          ))}
        </ul>
        <div>
          <button {...getPrevButtonProps({})}>{'<'}</button>
          <button {...getNextButtonProps({})}>{'>'}</button>
        </div>
        <ol style={{ listStyle: 'none' }}>
          {slides.map(({ key }, index) => (
            <li key={key} style={{ display: 'inline-block' }}>
              <button {...getControlProps({ index }) as ComponentPropsWithoutRef<'button'>}>{index + 1}</button>
            </li>
          ))}
        </ol>
      </div>
    );
  };

  const triggerNext = () => {
    userEvent.click(screen.getByRole('button', { name: 'next' }));
  };

  const triggerPrevious = () => {
    userEvent.click(screen.getByRole('button', { name: 'previous' }));
  };

  const triggerGoTo = (slideIndex: number) => {
    userEvent.click(screen.getByRole('button', { name: `Go to slide ${slideIndex + 1} of 3` }));
  };

  const swipeLeft = () => {
    const track = screen.getByTestId('slyder-track')

    fireEvent.pointerDown(track, { isPrimary: true, pageX: containerWidth });

    fireEvent.pointerMove(track, {
      pageX: containerWidth / 2 - 1,
      isPrimary: true,
    });

    fireEvent.pointerUp(track, { isPrimary: true, pageX: containerWidth / 2 - 1 });
  }

  const swipeRight = () => {
    const track = screen.getByTestId('slyder-track')

    fireEvent.pointerDown(track, { isPrimary: true, pageX: 0 });

    fireEvent.pointerMove(track, {
      pageX: containerWidth / 2 + 1,
      isPrimary: true,
    });

    fireEvent.pointerUp(track, { isPrimary: true, pageX: containerWidth / 2 + 1 });
  }

  const getAllSlides = () => [
    screen.getByText('One'),
    screen.getByText('Two'),
    screen.getByText('Three'),
  ];

  const expectTrackToHaveMoved = (distance: number) => {
    expect(screen.getByTestId('slyder-track')).toHaveStyle({
      transform: `translateX(${distance}px)`,
    });
  };

  it('hides the container overflow', () => {
    render(<Slyder />);

    expect(screen.getByTestId('slyder-container')).toHaveStyle({ overflow: 'hidden' });
  });

  it('sets the container, track and slide widths correctly', () => {
    render(<Slyder />);

    expect(screen.getByTestId('slyder-container')).toHaveStyle({ width: containerWidth });
    expect(screen.getByTestId('slyder-track')).toHaveStyle({ width: `${containerWidth * 3}px` });
    const slides = getAllSlides();

    slides.forEach((slide) => {
      expect(slide).toHaveStyle({ width: `${containerWidth}px` });
    });
  });

  it('can be navigated using the next and back buttons', () => {
    render(<Slyder />);

    expectTrackToHaveMoved(0);

    triggerNext();

    expectTrackToHaveMoved(-containerWidth);

    triggerNext();

    expectTrackToHaveMoved(-containerWidth * 2);

    triggerPrevious();

    expectTrackToHaveMoved(-containerWidth);

    userEvent.click(screen.getByRole('button', { name: 'previous' }));

    triggerPrevious();
  });

  it('cannot move beyond the track length', () => {
    render(<Slyder />);

    expectTrackToHaveMoved(0);

    triggerPrevious();

    expectTrackToHaveMoved(0);

    for (let index = 0; index < 3; index++) {
      triggerNext();
    }

    expectTrackToHaveMoved(-containerWidth * 2);
  });

  it('hides invisible slides from screen readers', () => {
    render(<Slyder />);

    triggerNext();

    expect(screen.getByText('One')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByText('Two')).toHaveAttribute('aria-hidden', 'false');
    expect(screen.getByText('Three')).toHaveAttribute('aria-hidden', 'true');
  });

  it('provides controls for navigating directly to a slide', () => {
    render(<Slyder />);

    triggerGoTo(2);

    expectTrackToHaveMoved(-containerWidth * 2);

    triggerGoTo(0);

    expectTrackToHaveMoved(0);
  });

  it('disables the control for the currently visible slide', () => {
    render(<Slyder />);

    expect(screen.getByRole('button', { name: 'Go to slide 1 of 3' })).toBeDisabled();

    triggerGoTo(2);

    expect(screen.getByRole('button', { name: 'Go to slide 1 of 3' })).not.toBeDisabled();
    expect(screen.getByRole('button', { name: 'Go to slide 3 of 3' })).toBeDisabled();
  });

  it('can be navigated by swiping using a pointer', () => {
    render(<Slyder />);

    swipeLeft()

    expectTrackToHaveMoved(-containerWidth);

    swipeLeft()

    expectTrackToHaveMoved(-containerWidth * 2)

    swipeRight()

    expectTrackToHaveMoved(-containerWidth);

    swipeRight()

    expectTrackToHaveMoved(0);
  });

  it('partially moves the slide as the user begins to swipe', () => {
    render(<Slyder />);

    const track = screen.getByTestId('slyder-track')

    fireEvent.pointerDown(track, { isPrimary: true, pageX: containerWidth });

    fireEvent.pointerMove(track, {
      pageX: containerWidth / 4,
      isPrimary: true,
    });

    expectTrackToHaveMoved(-containerWidth + (containerWidth / 4));
  })

  it('does not complete slide navigation if the user does not swipe beyond the threshold', () => {
    render(<Slyder />)

    const track = screen.getByTestId('slyder-track')

    fireEvent.pointerDown(track, { isPrimary: true, pageX: containerWidth });

    fireEvent.pointerMove(track, {
      pageX: containerWidth - 1,
      isPrimary: true,
    });

    fireEvent.pointerUp(track, { isPrimary: true, pageX: containerWidth - 1 });

    expectTrackToHaveMoved(0)
  })
});

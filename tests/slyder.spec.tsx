import React from 'react';
import { render, screen } from '@testing-library/react';
import { useSlyder } from '../src/slyder';

const TestSlyder = () => {
  const { getContainerProps, getSlideProps } = useSlyder();

  const slides = [
    {
      key: 'One',
      text: 'One',
    },
    {
      key: 'Two',
      text: 'Two',
    },
  ];

  return (
    <ul {...getContainerProps()}>
      {slides.map(({ key, text }, index) => (
        <li key={key} {...getSlideProps({ index })}>{text}</li>
      ))}
    </ul>
  );
};

describe('The useSlyder hook', () => {
  it('hides invisble slides from screen readers', () => {
    render(<TestSlyder />);
    expect(screen.getByText('One')).toHaveAttribute('aria-hidden', 'false');
    expect(screen.getByText('Two')).toHaveAttribute('aria-hidden', 'true');
  });
});

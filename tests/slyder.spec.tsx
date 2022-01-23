import React from 'react';
import { render, screen } from '@testing-library/react';
import { useSlyder } from '../src/slyder';

const TestSlyder = () => {
  const result = useSlyder();
  return <p>{result}</p>;
};

describe('The useSlyder hook', () => {
  it('returns "hello world"', () => {
    render(<TestSlyder />);
    expect(screen.getByText('hello world')).toBeVisible();
  });
});

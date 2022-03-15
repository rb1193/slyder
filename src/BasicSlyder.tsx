import React from 'react';
import { motion, MotionProps } from 'framer-motion';
import { useSlyder } from './slyder';

const BasicSlyder = () => {
  const {
    getSlyder,
    getControlProps,
    getContainerProps,
    getTrackProps, getSlideProps, getPrevButtonProps, getNextButtonProps,
  } = useSlyder({ swipeThreshold: 0.2 });

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

  const { trackPosition } = getSlyder();

  const trackProps = getTrackProps<MotionProps>({
    style: { paddingLeft: 0, listStyle: 'none' },
    animate: { x: trackPosition },
  });

  return (
    <div {...getContainerProps({})}>
      <motion.ul {...trackProps}>
        {slides.map(({ key, text, color }, index) => (
          <li
            key={key}
            {...getSlideProps({
              index,
              style: { background: color, height: '300px' },
            })}
          >
            {text}
          </li>
        ))}
      </motion.ul>
      <div>
        <button {...getPrevButtonProps({})}>{'<'}</button>
        <button {...getNextButtonProps({})}>{'>'}</button>
      </div>
      <ol style={{ 'list-style': 'none' }}>
        {slides.map(({ key }, index) => (
          <li key={key} style={{ display: 'inline-block' }}>
            <button {...getControlProps({ index })}>{index + 1}</button>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default BasicSlyder;

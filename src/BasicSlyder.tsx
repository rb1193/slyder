import React from 'react';
import { motion, MotionProps } from 'framer-motion';
import { useSlyder } from './slyder';

const BasicSlyder = () => {
  const {
    getSlyder,
    getContainerProps, getTrackProps, getSlideProps, getPrevButtonProps, getNextButtonProps,
  } = useSlyder();

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
              style: { background: color },
            })}
          >
            {text}
          </li>
        ))}
      </motion.ul>
      <button {...getPrevButtonProps({})}>{'<'}</button>
      <button {...getNextButtonProps({})}>{'>'}</button>
    </div>
  );
};

export default BasicSlyder;

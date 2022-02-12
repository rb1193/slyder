import React from 'react';
import { motion, MotionProps } from 'framer-motion';
import { useSlyder } from './slyder';

const FadeSlyder = () => {
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

  const { trackPosition, visibleSlideIndex } = getSlyder();

  const trackProps = getTrackProps<MotionProps>({
    style: { paddingLeft: 0, listStyle: 'none', transform: `translateX(${trackPosition.toString()}px)` },
  });

  const getSlideAnimationProps = (index: number) => ({
    animate: {
      opacity: visibleSlideIndex === index ? 1 : 0,
    },
    initial: {
      opacity: index === 0 ? 1 : 0,
    },
  });

  return (
    <div {...getContainerProps({})}>
      <ul {...trackProps}>
        {slides.map(({ key, text, color }, index) => (
          <motion.li
            key={key}
            {...getSlideProps({
              index,
              style: { background: color },
              ...getSlideAnimationProps(index),
            })}
          >
            {text}
          </motion.li>
        ))}
      </ul>
      <button {...getPrevButtonProps({})}>{'<'}</button>
      <button {...getNextButtonProps({})}>{'>'}</button>
    </div>
  );
};

export default FadeSlyder;

import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';
import { useSlyder } from './slyder';

const TestSlyder = () => {
  const {
    getContainerProps, getTrackProps, getSlideProps, getPrevButtonProps, getNextButtonProps,
  } = useSlyder();

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
    <div {...getContainerProps({})}>
      <ul {...getTrackProps({})}>
        {slides.map(({ key, text }, index) => (
          <li key={key} {...getSlideProps({ index })}>{text}</li>
        ))}
      </ul>
      <button {...getPrevButtonProps({})}>{'<'}</button>
      <button {...getNextButtonProps({})}>{'>'}</button>
    </div>
  );
};

export default {
  title: 'Basic',
  component: TestSlyder,
} as ComponentMeta<typeof TestSlyder>;

const Template: ComponentStory<typeof TestSlyder> = () => <TestSlyder />;

export const Basic = Template.bind({});
Basic.args = {};

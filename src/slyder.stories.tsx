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
      color: 'lightcyan',
    },
    {
      key: 'Two',
      text: 'Two',
      color: 'lightcoral',
    },
  ];

  return (
    <div {...getContainerProps({})}>
      <ul {...getTrackProps({ style: { paddingLeft: 0, listStyle: 'none' } })}>
        {slides.map(({ key, text, color }, index) => (
          <li key={key} {...getSlideProps({ index, style: { background: color } })}>{text}</li>
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

import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';
import { useSlyder } from './slyder';

const TestSlyder = () => {
  const { getSlideProps } = useSlyder();

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
    <ul>
      {slides.map(({ key, text }, index) => (
        <li key={key} {...getSlideProps({ index })}>{text}</li>
      ))}
    </ul>
  );
};

export default {
  title: 'Basic',
  component: TestSlyder,
} as ComponentMeta<typeof TestSlyder>;

const Template: ComponentStory<typeof TestSlyder> = () => <TestSlyder />;

export const Basic = Template.bind({});
Basic.args = {};

import { ComponentMeta, ComponentStory } from '@storybook/react';
import React, { ReactElement } from 'react';
import BasicSlyder from './BasicSlyder';
import FadeSlyder from './FadeSlyder';

const SlyderContainer = ({ children }: { children: ReactElement }) => <div>{children}</div>;

export default {
  title: 'Slyder',
  component: SlyderContainer,
} as ComponentMeta<typeof SlyderContainer>;

// eslint-disable-next-line max-len
const Template: ComponentStory<typeof SlyderContainer> = (args: { children: ReactElement }) => {
  const { children } = args;
  return <SlyderContainer>{children}</SlyderContainer>;
};

export const Slide = Template.bind({});
Slide.args = { children: <BasicSlyder /> };

export const Fade = Template.bind({});
Fade.args = { children: <FadeSlyder /> };

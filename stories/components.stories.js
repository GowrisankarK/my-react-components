/* eslint-disable import/no-named-as-default-member */
/* eslint-disable import/no-named-as-default */
/* eslint-disable import/no-extraneous-dependencies */
// eslint-disable
import React from 'react';
// eslint-disable-next-line no-unused-vars
import { storiesOf } from '@storybook/react';
import {
  withKnobs
} from '@storybook/addon-knobs';
import CascadingSequenceProductTypeahead from '../packages/cascading-product-typeahead/src';

storiesOf('Components', module)
  .addDecorator(withKnobs)
  .add('Cascading component', () => (
    <CascadingSequenceProductTypeahead
      success_callback={(data) => {
        console.log(data);
      }}
      failure_callback={(data) => {
        console.log(data);
      }}
      userevent_callback={(data) => {
        console.log(data);
      }}
      inputStyle="box"
      lang="en"
    />
  ));
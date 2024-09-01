import {
  Content,
  Header,
  Page,
} from '@backstage/core-components';
import React from 'react';
import { MissingEntityContent } from './MissingEntityContent';

export const MissingEntityPage = () => {
  return (
    <Page themeId="tool">
      <Header
        title="Missing entity"
        subtitle="All entities which are proccessed"
      />
      <Content>
        <MissingEntityContent />
      </Content>
    </Page>
  );
};

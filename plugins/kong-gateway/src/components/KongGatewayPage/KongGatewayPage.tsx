import {
  Content,
  Header,
  Page,
} from '@backstage/core-components';
import React from 'react';
import { KongGatewayEntityContent } from './KongGatewayEntityContent';

export const KongGatewayPage = () => {
  return (
    <Page themeId="tool">
      <Header
        title="Kong Gateway"
        subtitle="Helps you manage all configured Kong gateways similar to Kong manager"
      />
      <Content>
        <KongGatewayEntityContent />
      </Content>
    </Page>
  );
};

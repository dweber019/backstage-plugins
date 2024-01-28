import React from 'react';
import { WsdlDefinitionWidget } from './components/WsdlDefinitionWidget';

/**
 * @public
 */
export const wsdlApiWidget = {
  type: 'wsdl',
  title: 'WSDL',
  component: (definition: string) => (
    <WsdlDefinitionWidget definition={definition || ''} />
  ),
};

import { WsdlDefinitionWidget } from './components/WsdlDefinitionWidget';
import { ApiEntityV1alpha1 } from '@backstage/catalog-model';

/**
 * @public
 */
export const wsdlApiWidget = (apiEntity: ApiEntityV1alpha1) => ({
  type: 'wsdl',
  title: 'WSDL',
  component: (definition: string) => (
    <WsdlDefinitionWidget definition={definition || ''} entity={apiEntity} />
  ),
});

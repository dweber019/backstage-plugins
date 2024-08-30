import { Progress } from '@backstage/core-components';
import React, { Suspense } from 'react';
import { ApiEntityV1alpha1 } from '@backstage/catalog-model';

// The widget will convert WSDL markup to HTML so only load it if necessary
const LazyWsdlDefinition = React.lazy(() =>
  import('./WsdlDefinition').then(m => ({
    default: m.WsdlDefinition,
  })),
);

/** @public */
export type WsdlDefinitionWidgetProps = {
  definition: string;
  entity: ApiEntityV1alpha1;
};

/** @public */
export const WsdlDefinitionWidget = (props: WsdlDefinitionWidgetProps) => {
  return (
    <Suspense fallback={<Progress />}>
      <LazyWsdlDefinition {...props} />
    </Suspense>
  );
};

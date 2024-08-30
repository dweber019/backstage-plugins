import {
  ScmIntegrationsApi,
  scmIntegrationsApiRef,
  ScmAuth,
} from '@backstage/integration-react';
import {
  AnyApiFactory,
  configApiRef,
  createApiFactory,
  discoveryApiRef,
  identityApiRef,
} from '@backstage/core-plugin-api';
import {
  apiDocsConfigRef,
  defaultDefinitionWidgets,
} from '@backstage/plugin-api-docs';
import {
  apiDocsModuleWsdlApiRef,
  ApiDocsModuleWsdlClient,
  wsdlApiWidget,
} from '@dweber019/backstage-plugin-api-docs-module-wsdl';
import { ApiEntity } from '@backstage/catalog-model';
import { catalogApiRef, entityPresentationApiRef } from '@backstage/plugin-catalog-react';
import { SimpleIconsEntityPresentationApi } from '@dweber019/backstage-plugin-simple-icons';

export const apis: AnyApiFactory[] = [
  createApiFactory({
    api: scmIntegrationsApiRef,
    deps: { configApi: configApiRef },
    factory: ({ configApi }) => ScmIntegrationsApi.fromConfig(configApi),
  }),
  ScmAuth.createDefaultApiFactory(),

  // Custom

  createApiFactory({
    api: apiDocsModuleWsdlApiRef,
    deps: {
      identityApi: identityApiRef,
      discoveryApi: discoveryApiRef,
    },
    factory: ({ identityApi, discoveryApi }) =>
      new ApiDocsModuleWsdlClient({ identityApi, discoveryApi }),
  }),
  createApiFactory({
    api: apiDocsConfigRef,
    deps: {},
    factory: () => {
      const definitionWidgets = defaultDefinitionWidgets();
      return {
        getApiDefinitionWidget: (apiEntity: ApiEntity) => {
          if (apiEntity.spec.type.toLowerCase() === 'wsdl') {
            return wsdlApiWidget(apiEntity);
          }
          return definitionWidgets.find(d => d.type === apiEntity.spec.type);
        },
      };
    },
  }),
  createApiFactory({
    api: entityPresentationApiRef,
    deps: { catalogApi: catalogApiRef },
    factory: ({ catalogApi }) => {
      return SimpleIconsEntityPresentationApi.create({ catalogApi });
    },
  }),
];

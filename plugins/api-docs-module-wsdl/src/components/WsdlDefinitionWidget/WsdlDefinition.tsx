import React from 'react';
import useAsync from 'react-use/lib/useAsync';
import { Alert } from '@material-ui/lab';
import { Progress } from '@backstage/core-components';
import { appThemeApiRef, useApi } from '@backstage/core-plugin-api';
import { apiDocsModuleWsdlApiRef } from '../../api';
import { useEntity } from '@backstage/plugin-catalog-react';
import { stringifyEntityRef } from '@backstage/catalog-model';

export type WsdlDefinitionProps = {
  definition: string;
};

export const WsdlDefinition = ({ definition }: WsdlDefinitionProps) => {
  const apiDocsModuleWsdlDocApi = useApi(apiDocsModuleWsdlApiRef);
  const { entity } = useEntity();
  const appThemeApi = useApi(appThemeApiRef);
  const result = useAsync(() => {
    return apiDocsModuleWsdlDocApi.convert(stringifyEntityRef(entity));
  }, [definition]);

  if (result.loading) {
    return <Progress />;
  }

  if (result.error) {
    return <Alert severity="error">{result?.error?.message}</Alert>;
  }

  return (
    <div
      className={`theme-${appThemeApi.getActiveThemeId()}`}
      dangerouslySetInnerHTML={{ __html: result.value || '' }}
    />
  );
};

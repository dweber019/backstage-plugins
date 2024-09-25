import Alert from '@material-ui/lab/Alert';
import React from 'react';
import { identityApiRef, useApi } from '@backstage/core-plugin-api';
import Grid from '@material-ui/core/Grid';
import { kongGatewayApiRef } from '../../api';
import useAsync from 'react-use/lib/useAsync';

export const KongGatewayEntityContent = () => {
  const kongGatewayApi = useApi(kongGatewayApiRef);
  const identityApi = useApi(identityApiRef);

  const { value, loading, error } = useAsync(async () => {
    const ossInstance = kongGatewayApi.get('oss')!;
    return ossInstance.getRoutes();
  }, [kongGatewayApi, identityApi ]);

  if (loading) {
    return <h2>Loading</h2>
  }

  return (
    <>
      {error && <Alert severity="error">{error.message}</Alert>}
      <Grid container>
        <Grid item xs={12}>
          <pre>{ JSON.stringify(value) }</pre>
        </Grid>
      </Grid>
    </>
  );
};

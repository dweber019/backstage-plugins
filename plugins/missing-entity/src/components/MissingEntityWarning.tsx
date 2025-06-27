import Box from '@material-ui/core/Box';
import { ResponseErrorPanel } from '@backstage/core-components';
import Alert from '@material-ui/lab/Alert';
import { useEntity } from '@backstage/plugin-catalog-react';
import useAsync from 'react-use/esm/useAsync';
import { ApiHolder, useApi } from '@backstage/core-plugin-api';
import { missingEntityApiRef } from '../api';
import { Entity, stringifyEntityRef } from '@backstage/catalog-model';
import Typography from '@material-ui/core/Typography';

export async function hasEntityMissingWarnings(
  entity: Entity,
  context: { apis: ApiHolder },
) {
  const missingEntityApi = context.apis.get(missingEntityApiRef);
  if (!missingEntityApi) {
    throw new Error(`No implementation available for ${missingEntityApiRef}`);
  }

  const entityMissingResults = await missingEntityApi.getMissingEntities(stringifyEntityRef(entity), true);
  return !!entityMissingResults && !!entityMissingResults.missingEntityRefs && entityMissingResults.missingEntityRefs.length > 0;
}

export const MissingEntityWarning = () => {
  const { entity } = useEntity();
  const missingEntityApi = useApi(missingEntityApiRef);
  const { loading, error, value } = useAsync(() => {
    return missingEntityApi.getMissingEntities(stringifyEntityRef(entity), false);
  }, [entity, missingEntityApi]);

  if (error) {
    return (
      <Box mb={1}>
        <ResponseErrorPanel error={error} />
      </Box>
    );
  }

  if (loading || !value || !value.missingEntityRefs || value.missingEntityRefs.length === 0) {
    return null;
  }

  return (
    <Alert severity="warning" style={{ whiteSpace: 'pre-line' }}>
      <Typography>This entity has relations to other entities, which can't be found in the catalog.</Typography>
      <Typography>Entities not found are: {value.missingEntityRefs.join(', ')}</Typography>
    </Alert>
  );
};

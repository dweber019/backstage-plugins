import { useState } from 'react';
import { Progress } from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';
import { useApi } from '@backstage/core-plugin-api';
import { accentuateApiRef } from '../../api';
import { useAsync } from 'react-use';
import { stringifyEntityRef } from '@backstage/catalog-model';
import { Alert } from '@material-ui/lab';
import { EntityAccentuateDialog } from '../EntityAccentuateDialog';
import { IconButton, makeStyles, Typography } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';

const useStyles = makeStyles(theme => ({
  button: {
    padding: theme.spacing(0),
  },
}));

export const EntityAccentuateInfo = () => {
  const { button } = useStyles();
  const { entity } = useEntity();
  const accentuateApi = useApi(accentuateApiRef);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [refreshCounter, setRefreshCounter] = useState(0);

  const { value, loading, error } = useAsync(async () => {
    return accentuateApi.get(stringifyEntityRef(entity));
  }, [entity, refreshCounter]);

  if (loading) {
    return <Progress />;
  }
  if (error) {
    return <Alert severity="error">{error?.message}</Alert>;
  }

  const onClose = () => {
    setDialogOpen(false);
    setRefreshCounter(refreshCounter + 1);
  };

  return (
    <>
      <Alert
        severity="info"
        action={
          <IconButton className={button} onClick={() => setDialogOpen(true)}>
            <EditIcon />
          </IconButton>
        }
      >
        {!value && (
          <Typography>
            The data of this entity <strong>has NOT been overwritten</strong>{' '}
            manually.
          </Typography>
        )}
        {value && (
          <Typography>
            The data of this entity <strong>has been overwritten</strong>{' '}
            manually. This means the source has been overwritten and will only
            show partially data. The whole truth is displayed on this page.
          </Typography>
        )}
        <EntityAccentuateDialog open={dialogOpen} onClose={onClose} />
      </Alert>
    </>
  );
};

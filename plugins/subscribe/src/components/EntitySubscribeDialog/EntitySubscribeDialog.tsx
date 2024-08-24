import { useAsyncEntity } from '@backstage/plugin-catalog-react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { useTheme } from '@material-ui/core/styles';
import React, { useCallback, useEffect, useState } from 'react';
import { subscribeApiRef } from '../../api';
import { identityApiRef, useApi } from '@backstage/core-plugin-api';
import { Checkbox } from '@material-ui/core';
import { stringifyEntityRef } from '@backstage/catalog-model';
import useAsync from 'react-use/lib/useAsync';
import { Progress, ResponseErrorPanel } from '@backstage/core-components';
import FormLabel from '@material-ui/core/FormLabel';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';

export const EntitySubscribeDialog = (props: {
  open: boolean;
  onClose?: () => any;
}) => {
  const { open, onClose } = props;
  const theme = useTheme();
  const { entity } = useAsyncEntity();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const subscribeApi = useApi(subscribeApiRef);
  const identityApi = useApi(identityApiRef);

  const [checkboxEntity, setCheckboxEntity] = useState(false);

  const {
    value,
    loading,
    error,
  } = useAsync(async () => {
    if (open && entity) {
      const userIdentity = await identityApi.getBackstageIdentity();
      return await subscribeApi.get(stringifyEntityRef(entity), userIdentity.userEntityRef);
    }
    return [];
  }, [subscribeApi, entity, open]);

  useEffect(() => {
    if (value?.some(entry => entry.type === 'entity')) {
      setCheckboxEntity(true);
    }
  }, [value])

  const handleCheckbox = useCallback(async (checked: boolean, type: string, setStateFunction: (state: boolean) => void) => {
    const userIdentity = await identityApi.getBackstageIdentity();
    if (checked) {
      await subscribeApi.update(stringifyEntityRef(entity!), userIdentity.userEntityRef, type);
    } else {
      await subscribeApi.delete(stringifyEntityRef(entity!), userIdentity.userEntityRef, type);
    }
    setStateFunction(checked);
  }, []);

  return (
    <Dialog fullScreen={fullScreen} open={open} onClose={onClose}>
      <DialogTitle>Entity Subscribe</DialogTitle>
      <DialogContent>
        {loading && <Progress />}
        {error && <ResponseErrorPanel error={error} />}

        <DialogContentText>
          <FormControl component="fieldset">
            <FormLabel component="legend">You subscribed to the following events:</FormLabel>
            <FormGroup>
              <FormControlLabel
                control={<Checkbox checked={checkboxEntity} onChange={(event) => handleCheckbox(event.target.checked, 'entity', setCheckboxEntity)} />}
                label="Entity"
              />
            </FormGroup>
          </FormControl>

        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

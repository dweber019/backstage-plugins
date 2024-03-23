import React, { useRef } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  makeStyles,
} from '@material-ui/core';
import validator from '@rjsf/validator-ajv8';
import Form from '@rjsf/material-ui';
import { IChangeEvent } from '@rjsf/core/src/components/Form';
import { stringifyEntityRef } from '@backstage/catalog-model';
import { useEntity } from '@backstage/plugin-catalog-react';
import { alertApiRef, useApi } from '@backstage/core-plugin-api';
import { accentuateApiRef } from '../../api';
import { RegistryWidgetsType } from '@rjsf/utils';
import { EntityKindTypeahead } from './EntityKindTypeahead';
import { TagTypeahead } from './TagTypeahead';
import { DismissableBanner, Progress } from '@backstage/core-components';
import { useAsync } from 'react-use';
import { Alert } from '@material-ui/lab';

const useStyles = makeStyles(theme => ({
  fullHeightDialog: {
    height: 'calc(100% - 64px)',
  },
  root: {
    display: 'flex',
    flexGrow: 1,
    width: '100%',
    backgroundColor: theme.palette.background.paper,
  },
}));

export const EntityAccentuateDialog = (props: {
  open: boolean;
  onClose?: (showRefreshInfo: boolean) => void;
}) => {
  const classes = useStyles();
  const { entity } = useEntity();
  const accentuateApi = useApi(accentuateApiRef);
  const alertApi = useApi(alertApiRef);
  const containerRef = useRef<any>(null);

  const { value, loading, error } = useAsync(async () => {
    return accentuateApi.get(stringifyEntityRef(entity));
  }, [entity]);

  const jsonSchema = accentuateApi.getSchema(entity.kind);

  if (loading) {
    return <Progress />;
  }
  if (error) {
    return <Alert severity="error">{error?.message}</Alert>;
  }
  if (jsonSchema === undefined) {
    return (
      <Alert severity="error">
        Could not find schema configuration for entity kind.
      </Alert>
    );
  }

  const uiSchema = {
    ...jsonSchema.uiSchema,
    'ui:submitButtonOptions': {
      norender: true,
    },
  };

  const widgets: RegistryWidgetsType = {
    entityKindTypeaheadWidget: EntityKindTypeahead,
    tagTypeaheadWidget: TagTypeahead,
  };

  const onClose = (showRefreshInfo: boolean) => {
    if (showRefreshInfo) {
      alertApi.post({
        message:
          'Entity refreshed, changes are available soon after page refresh.',
        severity: 'info',
        display: 'transient',
      });
    }
    if (props.onClose) {
      props.onClose(showRefreshInfo);
    }
  };

  const onSubmit = async (data: IChangeEvent) => {
    await accentuateApi.update(stringifyEntityRef(entity), data.formData);
    await accentuateApi.refresh(stringifyEntityRef(entity));
    onClose(true);
  };

  const onDelete = async () => {
    await accentuateApi.delete(stringifyEntityRef(entity));
    await accentuateApi.refresh(stringifyEntityRef(entity));
    onClose(true);
  };

  return (
    <>
      <Dialog
        fullWidth
        maxWidth="xl"
        open={props.open}
        onClose={() => onClose(false)}
        aria-labelledby="entity-inspector-dialog-title"
        PaperProps={{ className: classes.fullHeightDialog }}
      >
        <DialogTitle>
          Overwrite entity - {stringifyEntityRef(entity)}
        </DialogTitle>
        <DialogContent dividers>
          <div className={classes.root}>
            <Form
              ref={containerRef}
              formData={value?.data}
              schema={jsonSchema.schema}
              validator={validator}
              uiSchema={uiSchema}
              widgets={widgets}
              onSubmit={onSubmit}
              experimental_defaultFormStateBehavior={{
                emptyObjectFields: 'skipDefaults',
              }}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => containerRef?.current?.submit()}
            color="primary"
          >
            Save
          </Button>
          <Button onClick={() => onClose(false)} color="default">
            Close
          </Button>
          {value && (
            <Button onClick={onDelete} color="secondary">
              Delete
            </Button>
          )}
        </DialogActions>
      </Dialog>
      <DismissableBanner
        variant="info"
        message="The entity has been requested to refresh, the changes should be available soon"
        id="refresh-info"
      />
    </>
  );
};

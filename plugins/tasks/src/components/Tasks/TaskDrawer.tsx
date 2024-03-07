import {
  Button,
  Checkbox,
  createStyles,
  Drawer,
  Grid,
  makeStyles,
  TextField,
  Theme,
} from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { BasicTask } from '@dweber019/backstage-plugin-tasks-common';
import { Autocomplete } from '@material-ui/lab';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { stringifyEntityRef } from '@backstage/catalog-model';
import { useAsync } from 'react-use';
import { useApi } from '@backstage/core-plugin-api';
import { DateTime } from 'luxon';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      width: '25%',
      padding: theme.spacing(2.5),
    },
    button: {
      '& > *': {
        marginLeft: theme.spacing(1),
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
      },
    },
  }),
);

export type TaskDrawerProps = {
  input: { parentTaskId?: string; task: BasicTask };
  open: boolean;
  onSave: (task: BasicTask, parentTaskId?: string) => void;
  onDelete: (taskId: string) => void;
  onClose: () => void;
};

export const TaskDrawer = ({
  input,
  open,
  onSave,
  onDelete,
  onClose,
}: TaskDrawerProps) => {
  const classes = useStyles();
  const [taskUnderChange, setTaskUnderChange] = useState<BasicTask>(
    {} as BasicTask,
  );
  const [allTargets, setAllTargets] = useState<string[]>([]);
  const [searchTarget, setSearchTarget] = useState<string>('');
  const [allAssignees, setAllAssignees] = useState<string[]>([]);
  const [searchAssignee, setSearchAssignee] = useState<string>('');
  const catalogApi = useApi(catalogApiRef);

  const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
  const checkedIcon = <CheckBoxIcon fontSize="small" />;

  useEffect(() => {
    if (input) {
      setTaskUnderChange(input.task);
      setAllTargets(input.task.targetsEntityRefs);
      setAllAssignees(input.task.assigneeEntityRefs);
    }
  }, [input]);

  const { loading: loadingAssignees } = useAsync(async () => {
    const queryEntitiesResponse = await catalogApi.queryEntities({
      fullTextFilter: {
        term: searchAssignee,
        fields: ['metadata.name', 'metadata.title'],
      },
      filter: [{ kind: ['Group', 'User'] }],
    });
    setAllAssignees(
      Array.from(
        new Set([
          ...allAssignees,
          ...queryEntitiesResponse.items.map(value =>
            stringifyEntityRef(value),
          ),
        ]),
      ),
    );
  }, [searchAssignee]);

  const { loading: loadingTargets } = useAsync(async () => {
    const queryEntitiesResponse = await catalogApi.queryEntities({
      fullTextFilter: {
        term: searchTarget,
        fields: ['metadata.name', 'metadata.title'],
      },
      filter: [{ kind: ['API', 'Component', 'Resources', 'System'] }],
    });
    setAllTargets(
      Array.from(
        new Set([
          ...allTargets,
          ...queryEntitiesResponse.items.map(value =>
            stringifyEntityRef(value),
          ),
        ]),
      ),
    );
  }, [searchTarget]);

  const resetAndClose = () => {
    setAllTargets([]);
    setAllAssignees([]);
    setSearchTarget('');
    setSearchAssignee('');
    onClose();
  };

  const saveDisabled = () => {
    return !taskUnderChange.title;
  };

  return (
    <Drawer
      classes={{
        paper: classes.paper,
      }}
      anchor="right"
      open={open}
      onClose={resetAndClose}
    >
      <Grid container direction="row">
        <Grid item xs={12}>
          <h2>Task: {taskUnderChange?.title}</h2>
        </Grid>
        <Grid item xs={12}>
          <form noValidate autoComplete="off">
            <Grid container direction="column" spacing={3}>
              <Grid item>
                <TextField
                  required
                  label="Title"
                  variant="outlined"
                  fullWidth
                  value={taskUnderChange?.title ?? undefined}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  onChange={event => {
                    setTaskUnderChange({
                      ...taskUnderChange,
                      title: event.target.value,
                    });
                  }}
                  error={
                    !taskUnderChange.title || taskUnderChange.title.length === 0
                  }
                />
              </Grid>
              <Grid item>
                <TextField
                  label="Text"
                  variant="outlined"
                  fullWidth
                  multiline
                  minRows={4}
                  value={taskUnderChange?.text ?? undefined}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  onChange={event => {
                    setTaskUnderChange({
                      ...taskUnderChange,
                      text: event.target.value,
                    });
                  }}
                />
              </Grid>
              <Grid item>
                <TextField
                  type="datetime-local"
                  label="Due date"
                  variant="outlined"
                  fullWidth
                  value={taskUnderChange?.dueDate ?? undefined}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  onChange={event => {
                    setTaskUnderChange({
                      ...taskUnderChange,
                      dueDate: DateTime.fromISO(event.target.value).toFormat(
                        'yyyy-MM-dd TT',
                      ),
                    });
                  }}
                />
              </Grid>
              <Grid item>
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  loading={loadingAssignees}
                  options={allAssignees}
                  value={taskUnderChange?.assigneeEntityRefs ?? []}
                  onChange={(_: object, assignees) => {
                    setTaskUnderChange({
                      ...taskUnderChange,
                      assigneeEntityRefs: assignees,
                    });
                  }}
                  onInputChange={(_, newInputValue) => {
                    if (newInputValue && newInputValue.length > 2) {
                      setSearchAssignee(newInputValue);
                    }
                  }}
                  renderOption={(option, { selected }) => (
                    <React.Fragment>
                      <Checkbox
                        icon={icon}
                        checkedIcon={checkedIcon}
                        style={{ marginRight: 8 }}
                        checked={selected}
                      />
                      {option}
                    </React.Fragment>
                  )}
                  popupIcon={<ExpandMoreIcon />}
                  renderInput={params => (
                    <TextField
                      {...params}
                      label="Assignees"
                      variant="outlined"
                      fullWidth
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item>
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  loading={loadingTargets}
                  options={allTargets}
                  value={taskUnderChange?.targetsEntityRefs ?? []}
                  onChange={(_: object, targets) => {
                    setTaskUnderChange({
                      ...taskUnderChange,
                      targetsEntityRefs: targets,
                    });
                  }}
                  onInputChange={(_, newInputValue) => {
                    if (newInputValue && newInputValue.length > 2) {
                      setSearchTarget(newInputValue);
                    }
                  }}
                  renderOption={(option, { selected }) => (
                    <React.Fragment>
                      <Checkbox
                        icon={icon}
                        checkedIcon={checkedIcon}
                        style={{ marginRight: 8 }}
                        checked={selected}
                      />
                      {option}
                    </React.Fragment>
                  )}
                  popupIcon={<ExpandMoreIcon />}
                  renderInput={params => (
                    <TextField
                      {...params}
                      label="Targets"
                      variant="outlined"
                      fullWidth
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </form>
        </Grid>
        <Grid
          container
          item
          className={classes.button}
          justifyContent="flex-end"
          xs={12}
        >
          <Button
            disabled={saveDisabled()}
            variant="contained"
            color="primary"
            onClick={() => onSave(taskUnderChange, input.parentTaskId)}
          >
            Save
          </Button>
          {input.task.id && (
            <Button
              variant="contained"
              color="secondary"
              onClick={() => onDelete(input.task.id)}
            >
              Delete
            </Button>
          )}
          <Button onClick={resetAndClose}>Close</Button>
        </Grid>
      </Grid>
    </Drawer>
  );
};

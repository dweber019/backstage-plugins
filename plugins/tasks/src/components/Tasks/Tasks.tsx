import React, { useEffect, useState } from 'react';
import { BasicTask, Task } from '@dweber019/backstage-plugin-tasks-common';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Collapse,
  Divider,
  IconButton,
  makeStyles,
  Typography,
} from '@material-ui/core';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import Edit from '@material-ui/icons/Edit';
import PlaylistAdd from '@material-ui/icons/PlaylistAdd';
import { TaskDrawer } from './TaskDrawer';
import { useApi } from '@backstage/core-plugin-api';
import { tasksApiRef } from '../../api';
import { EntityRefLink } from '@backstage/plugin-catalog-react';
import { MarkdownContent } from '@backstage/core-components';

const useStyles = makeStyles(theme => ({
  createTaskButton: {
    marginBottom: theme.spacing(1),
  },
  cardNested: {
    marginLeft: theme.spacing(9),
    marginBottom: theme.spacing(1),
    paddingBottom: theme.spacing(2),
  },
  card: {
    marginBottom: theme.spacing(1),
    paddingBottom: theme.spacing(2),
  },
  entityRefs: {
    marginRight: theme.spacing(2),
  },
}));

export type TaskProps = {
  tasks: Task[];
  onRefresh?: () => void;
  newTaskHandler?: (openNewTask: () => void) => void;
};

export const Tasks = (props: TaskProps) => {
  const { tasks, onRefresh, newTaskHandler } = props;
  const tasksApi = useApi(tasksApiRef);
  const classes = useStyles();
  const [collapseState, setCollapseState] = useState<Map<string, boolean>>(
    new Map(),
  );
  const [openDrawer, setOpenDrawer] = useState(false);
  const [taskWrapper, setTaskWrapper] = useState<{
    parentTaskId?: string;
    task: BasicTask;
  }>();

  const createTask = (parentTaskId?: string) => {
    setTaskWrapper({
      parentTaskId,
      task: {
        id: undefined,
        title: undefined,
        text: undefined,
        completed: false,
        dueDate: undefined,
        assigneeEntityRefs: [],
        targetsEntityRefs: [],
      } as unknown as BasicTask,
    });
    setOpenDrawer(true);
  };

  useEffect(() => {
    if (newTaskHandler) {
      newTaskHandler(createTask);
    }
  }, [newTaskHandler]);

  const toggleCollapse = (taskId: string) => {
    collapseState.set(taskId, !collapseState.get(taskId));
    setCollapseState(new Map(collapseState));
  };

  const selectTaskForEdit = (task: BasicTask, parentTaskId?: string) => {
    setTaskWrapper({ parentTaskId, task });
    setOpenDrawer(true);
  };

  const onDelete = async (taskId: string) => {
    await tasksApi.deleteTask(taskId);
    setOpenDrawer(false);
    if (onRefresh) {
      onRefresh();
    }
  };

  const onSave = async (task: BasicTask, parentTaskId?: string) => {
    if (parentTaskId) {
      if (!task.id) {
        await tasksApi.createSubTask(parentTaskId, task);
      } else {
        await tasksApi.updateSubTask(parentTaskId, task);
      }
    } else {
      if (!task.id) {
        await tasksApi.createTask(task as Task);
      } else {
        await tasksApi.updateTask(task as Task);
      }
    }
    setOpenDrawer(false);
    if (onRefresh) {
      onRefresh();
    }
  };

  const toggleCompleteTask = async (task: BasicTask, parentTaskId?: string) => {
    task.completed = !task.completed;
    if (parentTaskId) {
      await tasksApi.updateSubTask(parentTaskId, task);
    } else {
      await tasksApi.updateTask(task as Task);
    }
    if (onRefresh) {
      onRefresh();
    }
  };

  return (
    <>
      {!newTaskHandler && (
        <Button
          size="small"
          onClick={() => createTask()}
          className={classes.createTaskButton}
        >
          <Typography variant="caption">Create task</Typography>
        </Button>
      )}

      {tasks.map(task => (
        <React.Fragment key={task.id}>
          <Card className={classes.card}>
            <CardHeader
              avatar={
                <Checkbox
                  edge="start"
                  checked={task.completed}
                  disableRipple
                  onChange={() => toggleCompleteTask(task)}
                />
              }
              action={
                <>
                  <IconButton
                    onClick={() => createTask(task.id)}
                    title="Add subtask"
                  >
                    <PlaylistAdd />
                  </IconButton>
                  {(collapseState.get(task.id) && (
                    <IconButton onClick={() => toggleCollapse(task.id)}>
                      <ExpandMore />
                    </IconButton>
                  )) || (
                    <IconButton onClick={() => toggleCollapse(task.id)}>
                      <ExpandLess />
                    </IconButton>
                  )}
                  <IconButton
                    onClick={() => selectTaskForEdit(task)}
                    title="Edit task"
                  >
                    <Edit />
                  </IconButton>
                </>
              }
              title={task.title}
              subheader={task.dueDate}
            />
            <Collapse
              in={collapseState.get(task.id)}
              timeout="auto"
              unmountOnExit
            >
              <CardContent>
                {task.text && (
                  <>
                    <Divider />
                    <MarkdownContent content={task.text} />
                    <Divider />
                  </>
                )}
                {task.assigneeEntityRefs &&
                  task.assigneeEntityRefs.length > 0 && (
                    <>
                      <Typography variant="caption">Assignees: </Typography>
                      {task.assigneeEntityRefs.map(value => (
                        <EntityRefLink
                          key={`assignee-${task.id}-${value}`}
                          entityRef={value}
                          className={classes.entityRefs}
                        />
                      ))}
                      <br />
                    </>
                  )}
                {task.targetsEntityRefs &&
                  task.targetsEntityRefs.length > 0 && (
                    <>
                      <Typography variant="caption">Targets: </Typography>
                      {task.targetsEntityRefs.map(value => (
                        <EntityRefLink
                          key={`target-${task.id}-${value}`}
                          entityRef={value}
                          className={classes.entityRefs}
                        />
                      ))}
                    </>
                  )}
                <>
                  <br />
                  <Typography variant="caption">Created / updated: </Typography>
                  {task.createdByEntityRef && (
                    <EntityRefLink entityRef={task.createdByEntityRef} />
                  )}{' '}
                  {task.createdAt}
                  {task.updateByEntityRef && (
                    <>
                      {' / '}{' '}
                      <EntityRefLink entityRef={task.updateByEntityRef} />
                    </>
                  )}
                </>
              </CardContent>
            </Collapse>
          </Card>

          {task.subTasks.map(subTask => (
            <Card key={subTask.id} className={classes.cardNested}>
              <CardHeader
                avatar={
                  <Checkbox
                    edge="start"
                    checked={subTask.completed}
                    disableRipple
                    onChange={() => toggleCompleteTask(subTask)}
                  />
                }
                action={
                  <>
                    {(collapseState.get(subTask.id) && (
                      <IconButton onClick={() => toggleCollapse(subTask.id)}>
                        <ExpandMore />
                      </IconButton>
                    )) || (
                      <IconButton onClick={() => toggleCollapse(subTask.id)}>
                        <ExpandLess />
                      </IconButton>
                    )}
                    <IconButton
                      onClick={() => selectTaskForEdit(subTask, task.id)}
                    >
                      <Edit />
                    </IconButton>
                  </>
                }
                title={subTask.title}
                subheader={subTask.dueDate}
              />
              <Collapse
                in={collapseState.get(subTask.id)}
                timeout="auto"
                unmountOnExit
              >
                <CardContent>
                  {subTask.text && (
                    <>
                      <Divider />
                      <MarkdownContent content={subTask.text} />
                      <Divider />
                    </>
                  )}
                  {subTask.assigneeEntityRefs &&
                    subTask.assigneeEntityRefs.length > 0 && (
                      <>
                        <Typography variant="caption">Assignees: </Typography>
                        {subTask.assigneeEntityRefs.map(value => (
                          <EntityRefLink
                            key={`assignee-${subTask.id}-${value}`}
                            entityRef={value}
                            className={classes.entityRefs}
                          />
                        ))}
                        <br />
                      </>
                    )}
                  {subTask.targetsEntityRefs &&
                    subTask.targetsEntityRefs.length > 0 && (
                      <>
                        <Typography variant="caption">Targets: </Typography>
                        {subTask.targetsEntityRefs.map(value => (
                          <EntityRefLink
                            key={`target-${subTask.id}-${value}`}
                            entityRef={value}
                            className={classes.entityRefs}
                          />
                        ))}
                      </>
                    )}
                  <>
                    <br />
                    <Typography variant="caption">
                      Created / updated:{' '}
                    </Typography>
                    {subTask.createdByEntityRef && (
                      <EntityRefLink entityRef={subTask.createdByEntityRef} />
                    )}{' '}
                    {subTask.createdAt}
                    {subTask.updateByEntityRef && (
                      <>
                        {' / '}{' '}
                        <EntityRefLink entityRef={subTask.updateByEntityRef} />
                      </>
                    )}
                  </>
                </CardContent>
              </Collapse>
            </Card>
          ))}
        </React.Fragment>
      ))}
      {openDrawer && taskWrapper && (
        <TaskDrawer
          input={taskWrapper}
          open={openDrawer}
          onSave={onSave}
          onDelete={onDelete}
          onClose={() => setOpenDrawer(false)}
        />
      )}
    </>
  );
};

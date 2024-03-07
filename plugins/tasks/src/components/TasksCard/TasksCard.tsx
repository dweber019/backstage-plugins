import { InfoCard, Progress } from '@backstage/core-components';
import Alert from '@material-ui/lab/Alert';
import React, { useState } from 'react';
import { useEntity } from '@backstage/plugin-catalog-react';
import { stringifyEntityRef } from '@backstage/catalog-model';
import { useApi } from '@backstage/core-plugin-api';
import { tasksApiRef } from '../../api';
import useAsync from 'react-use/lib/useAsync';
import { Tasks } from '../Tasks/Tasks';
import { Button, Typography } from '@material-ui/core';

export const TasksCard = () => {
  const { entity } = useEntity();

  const entityRef = stringifyEntityRef(entity);
  const api = useApi(tasksApiRef);
  const [useAsyncTrigger, setUseAsyncTrigger] = useState(0);

  const { value, loading, error } = useAsync(() => {
    return api.getTaskForEntity(entityRef);
  }, [api, entityRef, useAsyncTrigger]);

  const onRefresh = () => {
    setUseAsyncTrigger(useAsyncTrigger + 1);
  };

  let createTask: () => void;

  if (loading) {
    return <Progress />;
  } else if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  }

  return (
    <InfoCard
      title="Tasks"
      action={
        <Button size="small" onClick={() => createTask()}>
          <Typography variant="caption">Create task</Typography>
        </Button>
      }
    >
      <Tasks
        tasks={value ?? []}
        onRefresh={onRefresh}
        newTaskHandler={f => {
          createTask = f;
        }}
      />
    </InfoCard>
  );
};

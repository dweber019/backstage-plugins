import { Content, Header, Page, Progress } from '@backstage/core-components';
import Alert from '@material-ui/lab/Alert';
import React, { useState } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { tasksApiRef } from '../../api';
import useAsync from 'react-use/lib/useAsync';
import { Tasks } from '../Tasks/Tasks';

export const TasksPage = () => {
  const api = useApi(tasksApiRef);
  const [useAsyncTrigger, setUseAsyncTrigger] = useState(0);

  const { value, loading, error } = useAsync(() => {
    return api.getTasks();
  }, [api, useAsyncTrigger]);

  const onRefresh = () => {
    setUseAsyncTrigger(useAsyncTrigger + 1);
  };

  if (loading) {
    return <Progress />;
  } else if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  }

  return (
    <Page themeId="tool">
      <Header title="Tasks" subtitle="All tasks we could find" />
      <Content>
        <Tasks tasks={value ?? []} onRefresh={onRefresh} />
      </Content>
    </Page>
  );
};

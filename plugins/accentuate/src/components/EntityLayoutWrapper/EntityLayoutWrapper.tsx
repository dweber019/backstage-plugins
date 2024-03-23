import { EntityLayout } from '@backstage/plugin-catalog';
import React, { ReactNode, useMemo, useState } from 'react';
import { EntityAccentuateDialog } from '../EntityAccentuateDialog';
import EditIcon from '@material-ui/icons/Edit';
import { isAccentuateEnabled } from '@dweber019/backstage-plugin-accentuate-common';
import { useEntity } from '@backstage/plugin-catalog-react';

export const EntityLayoutWrapper = (props: { children?: ReactNode }) => {
  const { entity } = useEntity();
  const [accentuateDialogOpen, setAccentuateDialogOpen] = useState(false);

  const extraMenuItems = useMemo(() => {
    return isAccentuateEnabled(entity)
      ? [
          {
            title: 'Accentuate',
            Icon: EditIcon,
            onClick: () => setAccentuateDialogOpen(true),
          },
        ]
      : undefined;
  }, [entity]);

  return (
    <>
      <EntityLayout UNSTABLE_extraContextMenuItems={extraMenuItems}>
        {props.children}
      </EntityLayout>
      <EntityAccentuateDialog
        open={accentuateDialogOpen}
        onClose={() => setAccentuateDialogOpen(false)}
      />
    </>
  );
};

import React, { useMemo } from 'react';
import { IconButton, makeStyles, Theme, Tooltip } from '@material-ui/core';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import { MarkdownContent } from '@backstage/core-components';

const useStyles = makeStyles((theme: Theme) => ({
  button: {
    padding: theme.spacing(0),
  },
  font: {
    fontSize: '1.5em',
    lineHeight: '1.2em',
    paddingRight: theme.spacing(1),
    paddingLeft: theme.spacing(1),
  },
}));

export const HelpText = () => {
  const { button, font } = useStyles();
  const configApi = useApi(configApiRef);

  const helpText = configApi.getOptionalString('endOfLife.helpText');

  const content = useMemo(() => {
    if (!helpText) {
      return `### Support
End of active support. This is where features & bug fixes usually stop coming in.

### End of life (EOL)
This is where all support stops including security patches. This is where usually any support, including commercial, ends.

### Extended support
Extended/commercial support must be used only when additional support is available after EOL, usually against payment.

In general, the meaning of each time span depends on the information currently displayed.
      `;
    }
    return helpText;
  }, [helpText]);

  return (
    <Tooltip
      interactive
      title={<MarkdownContent content={content} className={font} />}
    >
      <IconButton className={button}>
        <HelpOutlineIcon />
      </IconButton>
    </Tooltip>
  );
};

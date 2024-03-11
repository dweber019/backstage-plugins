import { useElementFilter } from '@backstage/core-plugin-api';
import { Grid, makeStyles, Typography } from '@material-ui/core';
import React from 'react';

const useStyles = makeStyles(theme => ({
  value: {
    fontWeight: 'bold',
    overflow: 'hidden',
    lineHeight: '24px',
    wordBreak: 'break-word',
  },
  label: {
    color: theme.palette.text.secondary,
    textTransform: 'uppercase',
    fontSize: '10px',
    fontWeight: 'bold',
    letterSpacing: 0.5,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
}));

/**
 * Props for {@link AboutField}.
 *
 * @public
 */
export interface AboutFieldProps {
  label: string;
  value?: string;
  gridSizes?: Record<string, number>;
  children?: React.ReactNode;
}

/** @public */
export function AboutField(props: AboutFieldProps) {
  const { label, value, gridSizes, children } = props;
  const classes = useStyles();

  const childElements = useElementFilter(children, c => c.getElements());

  // Content is either children or a string prop `value`
  const content =
    childElements.length > 0 ? (
      childElements
    ) : (
      <Typography variant="body2" className={classes.value}>
        {value || `unknown`}
      </Typography>
    );
  return (
    <Grid item {...gridSizes}>
      <Typography variant="h2" className={classes.label}>
        {label}
      </Typography>
      {content}
    </Grid>
  );
}

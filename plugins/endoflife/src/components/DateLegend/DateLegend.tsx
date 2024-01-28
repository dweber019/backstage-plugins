import React from 'react';
import { Chip, makeStyles, Theme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => ({
  dateMissed: {
    backgroundColor: theme.palette.error.light,
    borderColor: theme.palette.error.dark,
    color: theme.palette.common.white,
    marginBottom: theme.spacing(0),
  },
  dateOk: {
    backgroundColor: theme.palette.success.light,
    borderColor: theme.palette.success.dark,
    color: theme.palette.common.white,
    marginBottom: theme.spacing(0),
  },
  dateClose: {
    backgroundColor: theme.palette.warning.light,
    borderColor: theme.palette.warning.dark,
    color: theme.palette.common.white,
    marginBottom: theme.spacing(0),
  },
}));

export const DateLegend = () => {
  const { dateMissed, dateClose, dateOk } = useStyles();

  return (
    <>
      <Chip label="Support not available" size="small" className={dateMissed} />
      <Chip label="Support soon over" size="small" className={dateClose} />
      <Chip
        label="Support available or no end date set"
        size="small"
        className={dateOk}
      />
    </>
  );
};

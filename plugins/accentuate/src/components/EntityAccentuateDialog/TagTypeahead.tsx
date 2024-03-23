import React from 'react';
import { Autocomplete } from '@material-ui/lab';
import { WidgetProps } from '@rjsf/utils';
import { Chip, TextField } from '@material-ui/core';

export const TagTypeahead = (props: WidgetProps) => {
  return (
    <Autocomplete
      multiple
      options={[]}
      defaultValue={props.value}
      disabled={props.disabled}
      freeSolo
      onChange={(_: object, selectedOptions) => {
        props.onChange(selectedOptions);
      }}
      renderTags={(value: string[], getTagProps) =>
        value.map((option: string, index: number) => (
          <Chip label={option} {...getTagProps({ index })} />
        ))
      }
      renderInput={params => (
        <TextField {...params} label={props.label} fullWidth />
      )}
    />
  );
};

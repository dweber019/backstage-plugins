import React, { useState } from 'react';
import { Autocomplete } from '@material-ui/lab';
import { WidgetProps } from '@rjsf/utils';
import { Checkbox, TextField } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import { useAsync } from 'react-use';
import { useApi } from '@backstage/core-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { stringifyEntityRef } from '@backstage/catalog-model';

export const EntityKindTypeahead = (props: WidgetProps) => {
  const { allowedKinds } = props.options;
  const catalogApi = useApi(catalogApiRef);
  const [search, setSearch] = useState<string>('');
  const [entityRefs, setEntityRefs] = useState<string[]>([]);

  const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
  const checkedIcon = <CheckBoxIcon fontSize="small" />;

  const deduplicateOptions = (array: string[]) => {
    return Array.from(new Set(array));
  };

  const { loading: loadingAssignees } = useAsync(async () => {
    const queryEntitiesResponse = await catalogApi.queryEntities({
      fullTextFilter: {
        term: search,
        fields: ['metadata.name', 'metadata.title'],
      },
      filter: [{ kind: allowedKinds as string[] }],
    });
    setEntityRefs(
      deduplicateOptions([
        ...entityRefs,
        ...queryEntitiesResponse.items.map(value => stringifyEntityRef(value)),
      ]),
    );
  }, [search]);

  return (
    <Autocomplete
      multiple={!!props.multiple}
      disableCloseOnSelect={!!props.multiple}
      loading={loadingAssignees}
      options={entityRefs}
      value={props.value}
      disabled={props.disabled}
      getOptionLabel={option => option ?? ''}
      onChange={(_: object, selectedOptions) => {
        if (Array.isArray(selectedOptions)) {
          setEntityRefs(
            deduplicateOptions([...entityRefs, ...selectedOptions]),
          );
        } else {
          setEntityRefs(deduplicateOptions([...entityRefs, selectedOptions]));
        }
        props.onChange(selectedOptions);
      }}
      onInputChange={(_, newInputValue) => {
        if (newInputValue && newInputValue.length > 2) {
          setSearch(newInputValue);
        }
      }}
      renderOption={(option, { selected }) => (
        <React.Fragment>
          {props.multiple && (
            <Checkbox
              icon={icon}
              checkedIcon={checkedIcon}
              style={{ marginRight: 8 }}
              checked={selected}
            />
          )}
          {option}
        </React.Fragment>
      )}
      popupIcon={<ExpandMoreIcon />}
      renderInput={params => (
        <TextField {...params} label={props.label} fullWidth />
      )}
    />
  );
};

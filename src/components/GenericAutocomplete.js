// src/components/GenericAutocomplete.js
import React from 'react';
import { Autocomplete, TextField, CircularProgress } from '@mui/material';

const GenericAutocomplete = ({
  options,
  label,
  value,
  onChange,
  name,
  loading,
  getOptionLabel = (option) => option.nome || '',
  isOptionEqualToValue = (option, value) => option.id === value.id,
  error,
  helperText
}) => {
  // Encontra o objeto da opção selecionada com base no valor (que pode ser apenas o ID)
  const selectedOption = options.find(option => option.nome === value) || null;

  return (
    <Autocomplete
      options={options}
      getOptionLabel={getOptionLabel}
      value={selectedOption}
      onChange={(event, newValue) => {
        // Simula o evento para o handleChange do formulário
        const simulatedEvent = {
          target: {
            name: name,
            value: newValue ? newValue.nome : '',
          },
        };
        onChange(simulatedEvent);
      }}
      isOptionEqualToValue={isOptionEqualToValue}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          variant="outlined"
          size="small"
          error={error}
          helperText={helperText}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
};

export default GenericAutocomplete;


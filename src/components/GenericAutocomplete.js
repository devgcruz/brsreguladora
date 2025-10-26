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
  isOptionEqualToValue = (option, value) => {
    if (!option || !value) return false;
    if (typeof option === 'string' || typeof value === 'string') return option === value;
    return option.id === value.id;
  },
  error,
  helperText
}) => {
  // Encontra o objeto da opção selecionada com base no valor (que pode ser objeto ou string)
  const selectedOption = (() => {
    if (!value || value === '') return null;
    if (typeof value === 'object' && value.id) {
      // Se value é um objeto, buscar pelo ID
      return options.find(option => option.id === value.id) || null;
    }
    // Se value é string, buscar pelo nome
    return options.find(option => option.nome === value) || null;
  })();

  return (
    <Autocomplete
      options={options}
      getOptionLabel={getOptionLabel}
      value={selectedOption}
      onChange={(event, newValue) => {
        // Retorna o objeto completo do colaborador (id, nome) para permitir buscar pelo ID mais tarde
        const simulatedEvent = {
          target: {
            name: name,
            value: newValue ? newValue : null, // Retorna o objeto completo {id, nome}
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


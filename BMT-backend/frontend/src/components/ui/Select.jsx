import { forwardRef } from 'react';
import CustomSelect from './CustomSelect';

const Select = forwardRef(function Select(
  { label, error, options = [], placeholder, className = '', value, onChange, disabled, required, ...props },
  ref
) {
  return (
    <CustomSelect
      ref={ref}
      label={label}
      error={error}
      options={options}
      placeholder={placeholder}
      className={className}
      value={value}
      onChange={onChange}
      disabled={disabled}
      required={required}
      {...props}
    />
  );
});

export default Select;


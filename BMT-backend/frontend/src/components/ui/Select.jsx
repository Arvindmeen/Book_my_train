import CustomSelect from './CustomSelect';

export default function Select({ label, error, options = [], placeholder, className = '', value, onChange, disabled, required, ...props }) {
  return (
    <CustomSelect
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
}

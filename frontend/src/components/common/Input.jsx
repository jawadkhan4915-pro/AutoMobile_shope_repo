import React from 'react';

const Input = ({
    label,
    type = 'text',
    name,
    value,
    onChange,
    placeholder,
    error,
    help,
    required = false,
    disabled = false,
    className = '',
    ...props
}) => {
    return (
        <div className="form-group">
            {label && (
                <label htmlFor={name} className="form-label">
                    {label}
                    {required && <span className="text-danger"> *</span>}
                </label>
            )}
            <input
                type={type}
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                required={required}
                className={`form-input ${className}`}
                {...props}
            />
            {error && <div className="form-error">{error}</div>}
            {help && !error && <div className="form-help">{help}</div>}
        </div>
    );
};

export default Input;

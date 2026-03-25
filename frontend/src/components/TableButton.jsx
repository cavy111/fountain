import React from 'react';

const TableButton = ({ 
  variant = 'primary', 
  size = 'sm', 
  onClick, 
  children, 
  disabled = false,
  className = '',
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-md transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-1';
  
  const sizeClasses = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-sm'
  };

  const variantClasses = {
    primary: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    secondary: 'bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-500',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
    info: 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500',
    success: 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-500',
    warning: 'bg-orange-500 text-white hover:bg-orange-600 focus:ring-orange-500',
    outline: 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-blue-500',
    ghost: 'text-gray-700 bg-transparent hover:bg-gray-100 focus:ring-gray-500'
  };

  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed hover:opacity-50' : '';

  const classes = [
    baseClasses,
    sizeClasses[size] || sizeClasses.sm,
    variantClasses[variant] || variantClasses.primary,
    disabledClasses,
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      className={classes}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

// Pre-configured button variants for common table actions
export const ViewButton = ({ onClick, ...props }) => (
  <TableButton variant="primary" size="sm" onClick={onClick} {...props}>
    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
    View
  </TableButton>
);

export const EditButton = ({ onClick, ...props }) => (
  <TableButton variant="secondary" size="sm" onClick={onClick} {...props}>
    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
    Edit
  </TableButton>
);

export const DeleteButton = ({ onClick, ...props }) => (
  <TableButton variant="danger" size="sm" onClick={onClick} {...props}>
    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
    Delete
  </TableButton>
);

export const AddButton = ({ onClick, ...props }) => (
  <TableButton variant="primary" size="sm" onClick={onClick} {...props}>
    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
    Add
  </TableButton>
);

export const SaveButton = ({ onClick, ...props }) => (
  <TableButton variant="success" size="md" onClick={onClick} {...props}>
    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V2" />
    </svg>
    Save
  </TableButton>
);

export const CancelButton = ({ onClick, ...props }) => (
  <TableButton variant="outline" size="md" onClick={onClick} {...props}>
    Cancel
  </TableButton>
);

export default TableButton;

import React from 'react';
import './Grid.css';

const Grid = ({ 
  children, 
  columns = '1fr', 
  gap = 'var(--space-lg)', 
  maxWidth = '1200px',
  className = '',
  ...props 
}) => {
  const gridStyle = {
    '--grid-columns': columns,
    '--grid-gap': gap,
    '--grid-max-width': maxWidth,
  };

  return (
    <div 
      className={`grid-container ${className}`}
      style={gridStyle}
      {...props}
    >
      {children}
    </div>
  );
};

const GridItem = ({ 
  children, 
  column = 'auto', 
  row = 'auto', 
  className = '',
  ...props 
}) => {
  const itemStyle = {
    '--grid-column': column,
    '--grid-row': row,
  };

  return (
    <div 
      className={`grid-item ${className}`}
      style={itemStyle}
      {...props}
    >
      {children}
    </div>
  );
};

const ResponsiveGrid = ({ 
  children, 
  mobileColumns = '1fr',
  tabletColumns = '1fr 1fr',
  desktopColumns = '1fr 2fr',
  gap = 'var(--space-lg)',
  maxWidth = '1200px',
  className = '',
  ...props 
}) => {
  const gridStyle = {
    '--mobile-columns': mobileColumns,
    '--tablet-columns': tabletColumns,
    '--desktop-columns': desktopColumns,
    '--grid-gap': gap,
    '--grid-max-width': maxWidth,
  };

  return (
    <div 
      className={`responsive-grid ${className}`}
      style={gridStyle}
      {...props}
    >
      {children}
    </div>
  );
};

export { Grid, GridItem, ResponsiveGrid };
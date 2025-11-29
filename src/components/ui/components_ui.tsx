import React from 'react';

export const Button = ({ children, variant = "default", className = "", ...props }) => {
  const baseStyle = "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2";
  
  const variants = {
    
    default: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md hover:shadow-lg",
    outline: "border border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50",
    ghost: "hover:bg-emerald-50 hover:text-emerald-700",
    destructive: "bg-red-500 text-white hover:bg-red-600",
    secondary: "bg-emerald-100 text-emerald-900 hover:bg-emerald-200",
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant] || variants.default} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};

export const Input = ({ className = "", ...props }) => (
  <input 
    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 disabled:cursor-not-allowed disabled:opacity-50 ${className}`} 
    {...props} 
  />
);

export const Card = ({ className = "", children }) => (
  <div className={`rounded-lg border bg-card text-card-foreground shadow-sm bg-white ${className}`}>
    {children}
  </div>
);

export const CardHeader = ({ className = "", children }) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>
    {children}
  </div>
);

export const CardTitle = ({ className = "", children }) => (
  <h3 className={`text-2xl font-semibold leading-none tracking-tight text-slate-900 ${className}`}>
    {children}
  </h3>
);

export const CardDescription = ({ className = "", children }) => (
  <p className={`text-sm text-muted-foreground text-slate-500 ${className}`}>
    {children}
  </p>
);

export const CardContent = ({ className = "", children }) => (
  <div className={`p-6 pt-0 ${className}`}>
    {children}
  </div>
);
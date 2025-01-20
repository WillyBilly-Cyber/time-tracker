export function Button({ children, className = "", disabled, ...props }) {
  const baseClasses = "px-4 py-2 font-bold rounded";
  const enabledClasses = "bg-blue-500 text-white hover:bg-blue-600";
  const disabledClasses = "bg-gray-400 text-gray-200 cursor-not-allowed";

  return (
    <button
      className={`${baseClasses} ${disabled ? disabledClasses : enabledClasses} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

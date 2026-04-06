import React from "react";

interface WordmarkProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const Wordmark: React.FC<WordmarkProps> = ({ className = "", size = "md" }) => {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl",
    xl: "text-7xl",
  };

  const dotSizes = {
    sm: "w-1 h-1",
    md: "w-1.5 h-1.5",
    lg: "w-2.5 h-2.5",
    xl: "w-4 h-4",
  };

  return (
    <div className={`flex items-baseline select-none font-headline font-black tracking-tighter leading-none ${sizeClasses[size]} ${className}`}>
      <span className="text-primary dark:text-white">Kliq</span>
      <span className={`${dotSizes[size]} rounded-full bg-secondary-fixed ml-[2px] inline-block align-baseline mb-[0.1em]`}></span>
    </div>
  );
};

export default Wordmark;

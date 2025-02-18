import React from "react";

interface ButtonProps {
  label: string;
}

const Button: React.FC<ButtonProps> = ({ label }) => {
  return (
    <button
      id="Button"
      type="button"
      className="border border-neutral-800/20 block rounded-xl bg-white hover:bg-neutral-200 dark:hover:bg-neutral-300 text-neutral-800 px-3 py-2 text-center text-sm font-medium shadow-lg transition duration-300 focus:outline focus:outline-2 focus:outline-offset-2"
    >
      {label}
    </button>
  );
};

export default Button;
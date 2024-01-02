import React from "react";
import "./common.css";

interface CheckboxInputProps {
  id: string;
  label: string;
  value: boolean;
  setValue: React.Dispatch<React.SetStateAction<boolean>>;
  className?: string;
  labelClassName?: string;
}

const CheckboxInput = ({
  id,
  label,
  setValue,
  value,
  className,
  labelClassName,
}: CheckboxInputProps) => {
  return (
    <div className={`checkbox-container ${className || ""}`}>
      <input
        className="checkbox"
        id={id}
        type="checkbox"
        checked={value}
        onChange={(e) => {
          setValue(e.currentTarget.checked);
        }}
      />
      <label className={`checkbox-label ${labelClassName || ""}`} htmlFor={id}>
        {label}
      </label>
    </div>
  );
};

export default CheckboxInput;

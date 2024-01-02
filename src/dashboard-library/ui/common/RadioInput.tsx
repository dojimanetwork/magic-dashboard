import React from "react";
import "./common.css";

interface RadioInputProps {
  id: string;
  label: string;
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
  valueOptions: Array<{
    value: string;
    label: string;
  }>;
  disabled?: boolean;
  className?: string;
  labelClassName?: string;
}

const RadioInput = ({
  id,
  label,
  setValue,
  value,
  valueOptions,
  disabled = false,
  className,
  labelClassName,
}: RadioInputProps) => {
  return (
    <div className={`radio-container ${className || ""}`}>
      <label className={labelClassName} htmlFor={id}>
        {label}
      </label>

      <div className="flex items-center gap-x-2">
        {valueOptions.map((option, index) => {
          return (
            <div key={index} className="flex">
              <input
                className="radio"
                type="radio"
                id={option.value}
                name={id}
                value={option.value}
                disabled={disabled}
                onChange={(e) => {
                  setValue(e.currentTarget.value);
                }}
              />
              <label className="radio-label" htmlFor={option.value}>
                {option.label}
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RadioInput;

import React from "react";
import "./common.css";

export enum TextInputTypes {
  TEXT = "text",
  PASSWORD = "password",
  EMAIL = "email",
  NUMBER = "number",
  URL = "url",
  DATE = "date",
  DATETIME_LOCAL = "datetime-local",
  MONTH = "month",
  WEEK = "week",
  TIME = "time",
  SEARCH = "search",
  TEL = "tel",
}

interface TextInputProps {
  id: string;
  label: string;
  type: TextInputTypes;
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
  minNum?: number;
  maxNum?: number;
  disabled?: boolean;
  className?: string;
  labelClassName?: string;
  placeholder?: string;
}

const TextInput = ({
  id,
  label,
  type,
  value,
  setValue,
  minNum,
  maxNum,
  disabled = false,
  className,
  labelClassName,
  placeholder,
}: TextInputProps) => {
  return (
    <div className="text-input-container">
      <label
        className={`text-input-label ${labelClassName || ""}`}
        htmlFor={id}
      >
        {label}
      </label>

      <input
        className={`text-input ${className || ""}`}
        id={id}
        type={type}
        value={value}
        onChange={(e) => {
          setValue(e.currentTarget.value);
        }}
        min={minNum}
        max={maxNum}
        disabled={disabled}
        placeholder={placeholder}
      />
    </div>
  );
};

export default TextInput;

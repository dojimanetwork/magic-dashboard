import React, { ReactNode } from "react";
import "./common.css";

export default function Button({
  children,
  className,
  color = "primary",
  size = "lg",
  icon,
  disabled = false,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  color?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  icon?: string | ReactNode;
  disabled?: boolean;
  onClick?: () => void | undefined;
}) {
  let colorStyle = "";

  if (color === "primary") {
    colorStyle = "button-primary";
  } else {
    colorStyle = "button-secondary";
  }

  const disabledStyle = disabled ? "button-disabled" : "";
  const classStyle = `${colorStyle} ${disabledStyle} ${className || ""}`;

  return (
    <button
      disabled={disabled}
      className={`button ${classStyle}`}
      onClick={onClick}
    >
      {children} {icon && icon}
    </button>
  );
}

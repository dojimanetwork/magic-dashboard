import React from "react";
import "./common.css";

export function Heading({
  children,
  Type = "h3",
  className,
}: {
  children: React.ReactNode;
  Type: string;
  className?: string;
}) {
  const classStyle = `heading ${Type.toLowerCase()} ${className || ""}`;

  return React.createElement(Type, { className: classStyle }, children);
}

export function Text({
  children,
  Type = "16-Rg",
  className,
}: {
  children: React.ReactNode;
  Type: string;
  className?: string;
}) {
  const classStyle = `text ${Type.toLowerCase()} ${className || ""}`;

  return <p className={classStyle}>{children}</p>;
}

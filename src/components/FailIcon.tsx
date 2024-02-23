import React from "react";
import { Icons } from "./copyIcon";

export default function FailIcon({
  width = "16",
  height = "16",
  fill = "#ff3a29",
  stroke = "",
  className,
}: Icons) {
  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clip-path="url(#clip0_299_5842)">
        <path
          d="M8.00004 14.6667C4.31804 14.6667 1.33337 11.682 1.33337 8.00004C1.33337 4.31804 4.31804 1.33337 8.00004 1.33337C11.682 1.33337 14.6667 4.31804 14.6667 8.00004C14.6667 11.682 11.682 14.6667 8.00004 14.6667ZM7.33337 10V11.3334H8.66671V10H7.33337ZM7.33337 4.66671V8.66671H8.66671V4.66671H7.33337Z"
          fill={fill}
        />
      </g>
      <defs>
        <clipPath id="clip0_299_5842">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

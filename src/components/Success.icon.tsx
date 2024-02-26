import React from "react";
import { Icons } from "./copyIcon";

function SuccessIcon({
  width = "40",
  height = "40",
  fill = "white",
  stroke = "currentColor",
  className,
}: Icons) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 40 40"
      fill="none"
    >
      <path
        d="M40 20C40 31.0457 31.0457 40 20 40C8.9543 40 0 31.0457 0 20C0 8.9543 8.9543 0 20 0C31.0457 0 40 8.9543 40 20ZM0.953623 20C0.953623 30.519 9.48098 39.0464 20 39.0464C30.519 39.0464 39.0464 30.519 39.0464 20C39.0464 9.48098 30.519 0.953623 20 0.953623C9.48098 0.953623 0.953623 9.48098 0.953623 20Z"
        fill="#34B53A"
        fill-opacity="0.14"
      />
      <circle cx="20" cy="20" r="12" fill="#34B53A" />
      <path
        d="M14.7656 20.1136L18.1734 23.696L25.0009 16.5312"
        stroke="white"
        stroke-width="1.5"
        stroke-linejoin="round"
      />
    </svg>
  );
}

export default SuccessIcon;

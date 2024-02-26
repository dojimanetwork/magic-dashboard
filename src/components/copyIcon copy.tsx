import { Icons } from "./copyIcon";

export default function CopyIcon({
  width = "20",
  height = "20",
  fill = "white",
  stroke = "currentColor",
  className,
}: Icons) {
  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox="0 0 22 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8 14C8 11.1716 8 9.75736 8.87868 8.87868C9.75736 8 11.1716 8 14 8L15 8C17.8284 8 19.2426 8 20.1213 8.87868C21 9.75736 21 11.1716 21 14V15C21 17.8284 21 19.2426 20.1213 20.1213C19.2426 21 17.8284 21 15 21H14C11.1716 21 9.75736 21 8.87868 20.1213C8 19.2426 8 17.8284 8 15L8 14Z"
        stroke={stroke}
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M15.9999 8C15.9975 5.04291 15.9528 3.51121 15.092 2.46243C14.9258 2.25989 14.7401 2.07418 14.5376 1.90796C13.4312 1 11.7875 1 8.5 1C5.21252 1 3.56878 1 2.46243 1.90796C2.25989 2.07417 2.07418 2.25989 1.90796 2.46243C1 3.56878 1 5.21252 1 8.5C1 11.7875 1 13.4312 1.90796 14.5376C2.07417 14.7401 2.25989 14.9258 2.46243 15.092C3.51121 15.9528 5.04291 15.9975 8 15.9999"
        stroke={stroke}
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
}

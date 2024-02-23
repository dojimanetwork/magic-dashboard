import { Icons } from "./copyIcon";

export default function CircleCancleIcon({
  width = "22",
  height = "22",
  fill = "none",
  stroke = "black",
  className,
}: Icons) {
  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox="0 0 22 22"
      fill={fill}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M13.9994 14L8 8M8.00064 14L14 8"
        stroke="black"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M21 11C21 5.47715 16.5228 1 11 1C5.47715 1 1 5.47715 1 11C1 16.5228 5.47715 21 11 21C16.5228 21 21 16.5228 21 11Z"
        stroke="black"
        stroke-width="1.5"
      />
    </svg>
  );
}

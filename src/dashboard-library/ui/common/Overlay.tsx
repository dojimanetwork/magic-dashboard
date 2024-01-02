import React, { ReactNode, useRef } from "react";

export default function Overlay({
  children,
}: // onClose,
{
  children: ReactNode;
  // onClose: () => void;
}) {
  const overlay = useRef(null);
  return (
    <div
      ref={overlay}
      className="fixed w-full h-full top-0 left-0 bg-overlay  bg-opacity-50 grid place-items-center z-50"
    >
      {children}
    </div>
  );
}

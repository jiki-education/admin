// Test component to verify SVG imports work
import React from "react";
import { PlusIcon, CloseIcon } from "@/icons";

export default function TestSVG() {
  return (
    <div>
      <PlusIcon width={24} height={24} />
      <CloseIcon width={24} height={24} />
    </div>
  );
}

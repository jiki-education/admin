import Select from "@/components/form/Select";
import { SEGMENTS } from "../types";
import type { Segment } from "../types";

interface SegmentSelectorProps {
  value: Segment | "";
  onChange: (segment: Segment) => void;
}

export default function SegmentSelector({ value, onChange }: SegmentSelectorProps) {
  return (
    <Select
      options={SEGMENTS}
      placeholder="Choose an audience…"
      value={value}
      onChange={(v) => onChange(v as Segment)}
    />
  );
}

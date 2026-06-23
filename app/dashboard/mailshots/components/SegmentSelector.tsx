import Select from "@/components/form/Select";
import { SEGMENTS } from "../types";
import type { Segment } from "../types";

interface SegmentSelectorProps {
  value: Segment | "";
  onChange: (segment: Segment) => void;
  exclude?: Segment[];
}

export default function SegmentSelector({ value, onChange, exclude = [] }: SegmentSelectorProps) {
  const options = SEGMENTS.filter((s) => !exclude.includes(s.value));

  return (
    <Select
      options={options}
      placeholder="Choose an audience…"
      value={value}
      onChange={(v) => onChange(v as Segment)}
    />
  );
}

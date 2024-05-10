import React from "react";
import { X } from "react-feather";
import { ILabel } from "../../types/interfaces";
interface ChipProps {
  item: ILabel;
  removeLabel?: (label: ILabel) => void;
  classes?: string
}
export default function Chip({ item, removeLabel, classes }: ChipProps) {
  return (
    <label className={classes} style={{ backgroundColor: item.color, color: "#fff" }}>
      {item.text}
      {removeLabel && <X onClick={() => removeLabel(item)} />}
    </label>
  );
}

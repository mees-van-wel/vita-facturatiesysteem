import { NumberInput } from "@mantine/core";
import { ReactNode } from "react";
import globals from "../../../styles/globals.module.scss";

interface MoneyInputProps {
  value: number;
  onChange: (value: number) => void;
  error?: ReactNode;
  disabled?: boolean;
  label?: string;
}

export const MoneyInput = ({ value, onChange, error, label, disabled }: MoneyInputProps) => {
  return (
    <NumberInput
      min={0}
      hideControls
      precision={2}
      decimalSeparator=","
      disabled={disabled}
      label={label}
      classNames={{ input: globals.inputTest }}
      value={value}
      onChange={onChange}
      error={error}
    />
  );
};

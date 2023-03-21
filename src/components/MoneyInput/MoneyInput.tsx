import { NumberInput } from "@mantine/core";
import { IconCurrencyEuro } from "@tabler/icons-react";
import { ReactNode } from "react";

interface MoneyInputProps {
  readOnly?: boolean;
  required?: boolean;
  value: number;
  onChange: (value: number) => void;
  error?: ReactNode;
  disabled?: boolean;
  label?: string;
}

export const MoneyInput = ({
  readOnly,
  required,
  value,
  onChange,
  error,
  label,
  disabled,
}: MoneyInputProps) => {
  return (
    <NumberInput
      withAsterisk={required}
      icon={<IconCurrencyEuro size={16} />}
      readOnly={readOnly}
      min={0}
      hideControls
      precision={2}
      decimalSeparator=","
      disabled={disabled}
      label={label}
      value={value}
      onChange={onChange}
      error={error}
    />
  );
};

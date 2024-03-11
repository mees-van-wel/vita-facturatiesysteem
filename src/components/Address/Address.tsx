import { Group, Popover, ScrollArea, Text, TextInput } from "@mantine/core";
import axios from "axios";
import { useRef, useState } from "react";

type AddressProps = {
  disabled: boolean;
  required: boolean;
  values: {
    address: string;
    postalCode: string;
    city: string;
  };
  onChange: (address: string, postalCode: string, city: string) => void;
};

type Result = {
  id: string;
  resultType: string;
  address: {
    label: string;
    street: string;
    houseNumber: string;
    postalCode: string;
    city: string;
  };
};

type HereResponse = {
  items: Result[];
};

export const Address = ({
  required,
  disabled,
  values,
  onChange,
}: AddressProps) => {
  const [address, setAddress] = useState(values.address);
  const [postalCode, setPostalCode] = useState(values.postalCode);
  const [city, setCity] = useState(values.city);
  const [results, setResults] = useState<Result[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const findResults = async (address: string, postalCode: string) => {
    const q = [];

    if (address) q.push(address);
    if (postalCode) q.push(postalCode);

    if (!q.length) return;

    const params = new URLSearchParams({
      apiKey: process.env.NEXT_PUBLIC_HERE_API_KEY!,
      in: "countryCode:NLD",
      q: q.join(" "),
    });

    const { data } = await axios.get<HereResponse>(
      `https://autocomplete.search.hereapi.com/v1/autocomplete?${params}`,
      {}
    );

    setResults(
      data.items.filter(({ resultType }) => resultType === "houseNumber")
    );
  };

  const selectHandler = (address: string, postalCode: string, city: string) => {
    setAddress(address);
    setPostalCode(postalCode);
    setCity(city);

    onChange(address, postalCode, city);
  };

  const changeHandler = (address: string, postalCode: string, city: string) => {
    selectHandler(address, postalCode, city);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      findResults(address, postalCode);
    }, 500);
  };

  return (
    <Group grow>
      <Popover
        opened={!!results.length}
        position="bottom"
        withArrow
        shadow="md"
        width="target"
      >
        <Popover.Target>
          <TextInput
            label="Adres"
            value={address}
            onChange={(e) => {
              changeHandler(e.target.value, postalCode, city);
            }}
            onBlur={() => {
              setTimeout(() => {
                setResults([]);
              }, 150);
            }}
            readOnly={disabled}
            withAsterisk={required}
          />
        </Popover.Target>
        <Popover.Dropdown p={0}>
          <ScrollArea.Autosize mah={200}>
            {results.map(
              ({
                id,
                address: { label, street, houseNumber, postalCode, city },
              }) => (
                <Text
                  key={id}
                  onClick={() => {
                    selectHandler(`${street} ${houseNumber}`, postalCode, city);
                  }}
                  style={{
                    cursor: "pointer",
                    fontSize: "1.1rem",
                    borderBottom: "solid 1px gray",
                    padding: "0.5rem",
                  }}
                >
                  {label}
                </Text>
              )
            )}
          </ScrollArea.Autosize>
        </Popover.Dropdown>
      </Popover>
      <TextInput
        label="Postcode"
        value={postalCode}
        onChange={(e) => {
          changeHandler(address, e.target.value, city);
        }}
        readOnly={disabled}
        withAsterisk={required}
      />
      <TextInput
        label="Stad"
        value={city}
        onChange={(e) => {
          changeHandler(address, postalCode, e.target.value);
        }}
        readOnly={disabled}
        withAsterisk={required}
      />
    </Group>
  );
};

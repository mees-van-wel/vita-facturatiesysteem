import {
  Group,
  Pagination,
  Select,
  Text,
  Table as TableComponent,
  ScrollArea,
  Aside,
  Loader,
  Title,
  Button,
  NumberInput,
  TextInput,
} from "@mantine/core";
import { useMemo, useState } from "react";
import { TableCount, tableCount } from "../../enums/tableCount.enum";
import get from "lodash.get";
import { useDebouncedState } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { Route } from "../../enums/route.enum";
import { query } from "../../lib/query.lib";
import { ApiCollectionResponse } from "../../interfaces/apiCollectionResponse.interface";
import { IconEye, IconEyeOff, IconFileExport, IconPlus } from "@tabler/icons";
import { FilterType } from "../../enums/filterType.enum";

export interface TableHeader {
  key: string;
  label: string;
  format?: (value: any) => string | number;
  filterType?: FilterType;
}

export type TableHeaders = TableHeader[];

interface TableProps {
  title: string;
  route: Route;
  headers: TableHeaders;
}

type Filter = Record<string, Record<string, any>>;

const Table = ({ title, route, headers }: TableProps) => {
  const [showFilter, setShowFilter] = useState(false);

  const [filter, setFilter] = useDebouncedState<Filter>({}, 250);

  const filterHandler =
    (key: string) => (filterKey: string, value: Record<string, any>) => {
      const clone = { ...filter };
      if (!value) delete clone[key];
      else clone[key] = { [filterKey]: value };
      setFilter(clone);
    };

  return (
    <div>
      <Group mb="md">
        <Title>{title}</Title>
        <Button leftIcon={<IconPlus />}>Nieuw</Button>
        <Button
          leftIcon={showFilter ? <IconEyeOff /> : <IconEye />}
          onClick={() => {
            setShowFilter(!showFilter);
          }}
        >
          Filters {showFilter ? "verbergen" : "tonen"}
        </Button>
        <Button leftIcon={<IconFileExport />}>Exporteren</Button>
      </Group>
      <DataTable route={route} headers={headers} filter={filter} />
      {showFilter && (
        <Aside p="md" hiddenBreakpoint="sm" width={{ sm: 200, lg: 300 }}>
          {headers.map(
            (tableHeader) =>
              tableHeader.filterType && (
                <FilterInput
                  tableHeader={tableHeader}
                  onChange={filterHandler}
                />
              )
          )}
        </Aside>
      )}
    </div>
  );
};

interface DataTableProps {
  route: Route;
  headers: TableHeaders;
  filter: Record<string, any>;
}

const DataTable = ({ route, headers, filter }: DataTableProps) => {
  const [page, setPage] = useState(1);
  const [take, setTake] = useState(TableCount.Fifty);
  const { error, data } = useQuery(
    query<ApiCollectionResponse>(route, {
      page,
      take: parseInt(take),
      filter,
    })
  );

  const filtering = useMemo(() => !!Object.keys(filter).length, [filter]);

  if (data)
    return (
      <div>
        <ScrollArea offsetScrollbars>
          <TableComponent highlightOnHover>
            <thead>
              <tr>
                {headers.map(({ label }) => (
                  <th key={label}>{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.collection.map((row) => (
                <tr key={row.id}>
                  {Object.values(headers).map(({ key, format }) => {
                    let value = get(row, key);
                    if (format) value = format(value);
                    return <td key={key}>{value}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </TableComponent>
        </ScrollArea>
        {data.count ? (
          <div>
            <Group align="end">
              <Pagination
                total={Math.round(data.count / parseInt(take))}
                page={page}
                onChange={setPage}
                withEdges
              />
              <Select
                value={take}
                label="Resultaten weergeven"
                data={tableCount.map(({ value }) => value)}
                onChange={(value: TableCount) => {
                  if (value) setTake(value);
                }}
              />
            </Group>
            {filtering && (
              <Text mt="md">
                Gefilterde resultaten: {data.collection.length}
              </Text>
            )}
            <Text mt="md">Totale resultaten: {data.count}</Text>
          </div>
        ) : (
          <p>Geen resultaten</p>
        )}
      </div>
    );

  return <Loader />;
};

const FilterInput = ({
  tableHeader,
  onChange,
}: {
  tableHeader: TableHeader;
  onChange: (key: string) => (filter: string, value?: any) => void;
}) => {
  const update = onChange(tableHeader.key);

  if (tableHeader.filterType === FilterType.Number)
    return (
      <NumberInput
        precision={0}
        label={tableHeader.label}
        onChange={(value) => {
          update("equals", value ? Math.round(value) : undefined);
        }}
      />
    );

  if (tableHeader.filterType === FilterType.String)
    return (
      <TextInput
        label={tableHeader.label}
        onChange={(e) => {
          update("contains", e.target.value);
        }}
      />
    );

  return null;
};

export default Table;

import {
  Group,
  Pagination,
  Select,
  Text,
  Table as TableComponent,
  ScrollArea,
  Loader,
  Title,
  Button,
  NumberInput,
  TextInput,
  ColorScheme,
} from "@mantine/core";
import { ReactNode, useMemo, useState } from "react";
import { TableCount, tableCount } from "../../enums/tableCount.enum";
import get from "lodash.get";
import { useDebouncedState, useLocalStorage } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { Route } from "../../enums/route.enum";
import { query } from "../../lib/query.lib";
import { ApiCollectionResponse } from "../../interfaces/apiCollectionResponse.interface";
import {
  IconSortAscending,
  IconSortDescending,
  IconArrowsSort,
  IconFileExport,
  IconPlus,
  IconAdjustments,
  IconAdjustmentsOff,
} from "@tabler/icons";
import { FilterExtraType, FilterType } from "../../enums/filterType.enum";
import { DatePicker, DateRangePicker } from "@mantine/dates";
import { useRouter } from "next/router";
import { utils, writeFile } from "xlsx";
import Link from "next/link";
import "dayjs/locale/nl";

export interface TableHeader {
  key: string;
  label: string;
  format?: (value: any) => ReactNode;
  filterType?: FilterType;
  show?: boolean;
  sort?: SortOption;
}

export type TableHeaders = TableHeader[];

interface TableProps {
  title: string;
  dataRoute: Route;
  route: Route;
  headers: TableHeaders;
  canCreate?: boolean;
}

type Filter = Record<string, Record<string, any>>;

export enum SortOption {
  Ascending = "asc",
  Descending = "desc",
}

type Sort = Record<string, SortOption>;

const Table = ({
  title,
  route,
  dataRoute,
  headers,
  canCreate = true,
}: TableProps) => {
  const [showFilter, setShowFilter] = useState(false);
  const [filter, setFilter] = useDebouncedState<Filter>({}, 250);
  const [sort, setSort] = useState<Sort>({});
  const [colorScheme] = useLocalStorage<ColorScheme>({
    key: "color-scheme",
    defaultValue: "dark",
  });

  const filterHandler = (key: string) => (value: Record<string, any>) => {
    const clone = { ...filter };

    const hasValue =
      value &&
      Object.values(value).length &&
      Object.values(value).every((value) => !!value);
    if (!hasValue) delete clone[key];
    else clone[key] = value;

    setFilter(clone);
  };

  const sortHandler = (key: string) => {
    const current = sort[key];
    const clone = { ...sort };

    if (!current) clone[key] = SortOption.Ascending;
    if (current === SortOption.Ascending) clone[key] = SortOption.Descending;
    if (current === SortOption.Descending) delete clone[key];

    setSort(clone);
  };

  return (
    <div>
      <Group mb="md">
        <Title>{title}</Title>
        {canCreate && (
          <Link href={`${route}/new`}>
            <Button leftIcon={<IconPlus />}>Nieuw</Button>
          </Link>
        )}
        <Button
          leftIcon={showFilter ? <IconAdjustmentsOff /> : <IconAdjustments />}
          onClick={() => {
            setShowFilter(!showFilter);
          }}
        >
          Verfijning {showFilter ? "verbergen" : "tonen"}
        </Button>
      </Group>
      <DataTable
        title={title}
        route={route}
        dataRoute={dataRoute}
        headers={headers}
        filter={filter}
        sort={sort}
      />

      <div
        style={{
          position: "absolute",
          top: 64,
          bottom: 0,
          transition: "transform 250ms",
          transform: !showFilter ? "translateX(400px)" : undefined,
          right: 0,
          backgroundColor: colorScheme === "dark" ? "#1A1B1E" : "white",
          boxShadow: "-10px 0px 25px -4px rgba(0,0,0,0.5)",
          padding: 16,
          width: 400,
        }}
      >
        <ScrollArea
          offsetScrollbars
          style={{
            height: "calc(100% - 60px)",
          }}
        >
          {headers.map(
            (tableHeader) =>
              tableHeader.filterType && (
                <Group key={tableHeader.key} align={"end"}>
                  <FilterInput
                    tableHeader={tableHeader}
                    onChange={filterHandler}
                  />
                  <Button
                    variant={sort[tableHeader.key] ? "filled" : "light"}
                    onClick={() => sortHandler(tableHeader.key)}
                  >
                    {sort[tableHeader.key] ? (
                      sort[tableHeader.key] === SortOption.Ascending ? (
                        <IconSortAscending size={16} />
                      ) : (
                        <IconSortDescending size={16} />
                      )
                    ) : (
                      <IconArrowsSort size={16} />
                    )}
                  </Button>
                </Group>
              )
          )}
        </ScrollArea>
      </div>
    </div>
  );
};

interface DataTableProps {
  title: string;
  route: Route;
  dataRoute: Route;
  headers: TableHeaders;
  filter: Filter;
  sort: Sort;
}

const DataTable = ({
  title,
  route,
  dataRoute,
  headers,
  filter,
  sort,
}: DataTableProps) => {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [take, setTake] = useState(TableCount.Fifty);
  const { data } = useQuery(
    query<ApiCollectionResponse>({
      route: dataRoute,
      method: "POST",
      params: {
        page,
        take: parseInt(take),
        filter,
        sort,
      },
    })
  );

  const filtering = useMemo(() => !!Object.keys(filter).length, [filter]);

  const exportHandler = () => {
    // if (!data?.collection) return;
    // const workbook = utils.book_new();
    // utils.book_append_sheet(workbook, utils.json_to_sheet(data.collection));
    const workbook = utils.table_to_book(document.getElementById("table"), {
      sheet: title,
    });

    writeFile(workbook, `${title}.xlsx`);
  };

  if (data)
    return (
      <div>
        <ScrollArea offsetScrollbars>
          <TableComponent id="table" highlightOnHover>
            <thead>
              <tr>
                {headers.map(({ label, show = true }) => (
                  <th
                    key={label}
                    style={{
                      display: !show ? "none" : undefined,
                    }}
                  >
                    <p
                      style={{
                        whiteSpace: "nowrap",
                      }}
                    >
                      {label}
                    </p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.collection.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => {
                    router.push(`${route}/${row.id}`);
                  }}
                  style={{
                    cursor: "pointer",
                  }}
                >
                  {Object.values(headers).map(
                    ({ key, format, show = true }) => {
                      let value = get(row, key);
                      if (format) value = format(value);
                      return (
                        <td
                          key={key}
                          style={{
                            display: !show ? "none" : undefined,
                          }}
                        >
                          <p
                            title={value}
                            style={{
                              maxWidth: 150,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {value}
                          </p>
                        </td>
                      );
                    }
                  )}
                </tr>
              ))}
            </tbody>
          </TableComponent>
        </ScrollArea>
        {data.count ? (
          <div>
            <Group align="end">
              <Pagination
                total={Math.round(data.count / parseInt(take)) + 1}
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
              <Button
                variant="light"
                leftIcon={<IconFileExport />}
                onClick={exportHandler}
              >
                Exporteren
              </Button>
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
  onChange: (key: string) => (value?: any) => void;
}) => {
  const [filterDateType, setFilterDateType] = useState<FilterExtraType>(
    FilterExtraType.Equals
  );
  const update = onChange(tableHeader.key);

  if (tableHeader.filterType === FilterType.Number)
    return (
      <>
        <Select
          defaultValue={FilterExtraType.Equals}
          label={tableHeader.label}
          data={[
            {
              label: "Is gelijk aan",
              value: FilterExtraType.Equals,
            },
            {
              label: "Is groter dan",
              value: FilterExtraType.Greater,
            },
            {
              label: "Is kleiner dan",
              value: FilterExtraType.Lesser,
            },
            {
              label: "Is tussen",
              value: FilterExtraType.Between,
            },
          ]}
          style={{
            flex: 1,
          }}
          onChange={(value: FilterExtraType) => {
            update();
            if (value) setFilterDateType(value);
          }}
        />
        {filterDateType === FilterExtraType.Between ? (
          <NumberRangeInput
            onChange={(value) => {
              update({
                gt: value[0],
                lt: value[1],
              });
            }}
          />
        ) : (
          <NumberInput
            style={{
              flex: 1,
            }}
            precision={0}
            onChange={(value) => {
              update({
                [filterDateType]: value,
              });
            }}
          />
        )}
      </>
    );

  if (tableHeader.filterType === FilterType.String)
    return (
      <TextInput
        style={{
          flex: 1,
        }}
        label={tableHeader.label}
        onChange={(e) => {
          update({ contains: e.target.value });
        }}
      />
    );

  if (tableHeader.filterType === FilterType.Date)
    return (
      <>
        <Select
          defaultValue={FilterExtraType.Equals}
          label={tableHeader.label}
          data={[
            {
              label: "Is gelijk aan",
              value: FilterExtraType.Equals,
            },
            {
              label: "Is later dan",
              value: FilterExtraType.Greater,
            },
            {
              label: "Is eerder dan",
              value: FilterExtraType.Lesser,
            },
            {
              label: "Is tussen",
              value: FilterExtraType.Between,
            },
          ]}
          style={{
            flex: 1,
          }}
          onChange={(value: FilterExtraType) => {
            update();
            if (value) setFilterDateType(value);
          }}
        />
        {filterDateType === FilterExtraType.Between ? (
          <DateRangePicker
            style={{
              flex: 1,
            }}
            clearable
            onChange={(value) => {
              update({
                gte: value[0],
                lte: value[1],
              });
            }}
          />
        ) : (
          <DatePicker
            inputFormat="DD-MM-YYYY"
            locale="nl"
            style={{
              flex: 1,
            }}
            clearable
            onChange={(value) => {
              update({
                [filterDateType]: value,
              });
            }}
          />
        )}
      </>
    );

  if (tableHeader.filterType === FilterType.Decimal)
    return (
      <>
        <Select
          defaultValue={FilterExtraType.Equals}
          label={tableHeader.label}
          data={[
            {
              label: "Is gelijk aan",
              value: FilterExtraType.Equals,
            },
            {
              label: "Is groter dan",
              value: FilterExtraType.Greater,
            },
            {
              label: "Is kleiner dan",
              value: FilterExtraType.Lesser,
            },
            {
              label: "Is tussen",
              value: FilterExtraType.Between,
            },
          ]}
          style={{
            flex: 1,
          }}
          onChange={(value: FilterExtraType) => {
            update();
            if (value) setFilterDateType(value);
          }}
        />
        {filterDateType === FilterExtraType.Between ? (
          <NumberRangeInput
            precision={2}
            onChange={(value) => {
              update({
                gt: value[0],
                lt: value[1],
              });
            }}
          />
        ) : (
          <NumberInput
            precision={2}
            style={{
              flex: 1,
            }}
            onChange={(value) => {
              update({
                [filterDateType]: value,
              });
            }}
          />
        )}
      </>
    );

  return null;
};

const NumberRangeInput = ({
  value = [undefined, undefined],
  onChange,
  precision = 0,
}: {
  value?: [number | undefined, number | undefined];
  onChange: (values: [number | undefined, number | undefined]) => void;
  precision?: number;
}) => {
  const [values, setValues] = useState(value);

  return (
    <>
      <NumberInput
        hideControls
        style={{
          width: 64,
        }}
        precision={precision}
        value={values[0]}
        onChange={(value) => {
          setValues([value, values[1]]);
          onChange([value, values[1]]);
        }}
      />
      <NumberInput
        hideControls
        style={{
          width: 64,
        }}
        precision={precision}
        value={values[1]}
        onChange={(value) => {
          setValues([values[0], value]);
          onChange([values[0], value]);
        }}
      />
    </>
  );
};

export default Table;

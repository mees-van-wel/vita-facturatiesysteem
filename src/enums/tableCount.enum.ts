export enum TableCount {
  Ten = "10",
  TwentyFive = "25",
  Fifty = "50",
  Hunderd = "100",
}

const enumToArray = (value: any) =>
  Object.keys(value).map((key) => ({
    key: key as string,
    value: value[key],
  }));

export const tableCount = enumToArray(TableCount);

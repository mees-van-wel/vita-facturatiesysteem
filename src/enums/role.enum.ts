import { enumToArray } from "./tableCount.enum";

export enum Role {
  Administrator = "ADMINISTRATOR",
  FinancialWorker = "FINANCIAL_WORKER",
  InternalConsultant = "INTERNAL_CONSULTANT",
  InternalEmployee = "INTERNAL_EMPLOYEE",
  ExternalConsultant = "EXTERNAL_CONSULTANT",
}

export const roleLabel = {
  [Role.Administrator]: "Administrator",
  [Role.FinancialWorker]: "Financieel medewerker",
  [Role.InternalConsultant]: "Adviseur loondienst",
  [Role.InternalEmployee]: "Binnendienst medewerker",
  [Role.ExternalConsultant]: "Adviseur zelfstandig",
};

export const role = enumToArray(Role);

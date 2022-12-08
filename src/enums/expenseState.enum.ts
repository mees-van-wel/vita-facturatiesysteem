export const enum ExpenseState {
  Submitted = "SUBMITTED",
  Approved = "APPOVED",
  Rejected = "REJECTED",
  Resubmitted = "RESUBMITTED",
  Completed = "COMPLETED",
}

export const expenseStateLabel = {
  [ExpenseState.Submitted]: "Ingediend",
  [ExpenseState.Approved]: "Goedgekeurd",
  [ExpenseState.Rejected]: "Afgekeurd",
  [ExpenseState.Resubmitted]: "Opnieuw ingediend",
  [ExpenseState.Completed]: "Uitgevoerd",
};

export const expenseStateColor = {
  [ExpenseState.Submitted]: "yellow",
  [ExpenseState.Approved]: "green",
  [ExpenseState.Rejected]: "red",
  [ExpenseState.Resubmitted]: "orange",
  [ExpenseState.Completed]: "green",
};

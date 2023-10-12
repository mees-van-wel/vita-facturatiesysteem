import {
  Button,
  FileInput,
  Group,
  Loader,
  Select,
  Textarea,
  TextInput,
  Text,
  Title,
  Aside,
  Timeline,
  Badge,
  Stack,
  Checkbox,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { closeModal, openModal } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import {
  Company,
  Expense as ExpenseInterface,
  Prisma,
  State,
  User,
} from "@prisma/client";
import {
  IconArrowBack,
  IconCheck,
  IconX,
  IconDeviceFloppy,
  IconFileText,
  IconSend,
} from "@tabler/icons-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { ReactElement, useEffect, useMemo, useState } from "react";
import { queryClient } from "../../../pages/_app";
import { MoneyInput } from "../../components/MoneyInput";
import {
  ExpenseState,
  expenseStateColor,
  expenseStateLabel,
} from "../../enums/expenseState.enum";
import { Role } from "../../enums/role.enum";
import { Route } from "../../enums/route.enum";
import { enumToArray } from "../../enums/tableCount.enum";
import { ApiCollectionResponse } from "../../interfaces/apiCollectionResponse.interface";
import { MainLayout } from "../../layouts/Main";
import { query } from "../../lib/query.lib";
import { getChangedFields } from "../../utilities/getChangedFields.utility";
import "dayjs/locale/nl";

export const NEW = "new";

export enum PaymentMethod {
  Notary = "NOTARY",
  Invoice = "INVOICE",
  Spread = "SPREAD",
}

export const PaymentMethodLabel = {
  [PaymentMethod.Notary]: "Betaling via de notaris",
  [PaymentMethod.Invoice]: "Rechtstreeks op factuurbasis",
  [PaymentMethod.Spread]: "Gespreid betalen conform OTDV",
};

const paymentMethodData = enumToArray(PaymentMethod).map(({ value }) => ({
  label: PaymentMethodLabel[value as PaymentMethod],
  value,
}));

export enum IBDeclaration {
  No = "NO",
  Yes = "YES",
}

export const IBDeclarationLabel = {
  [IBDeclaration.No]: "Nee, klant heeft geen interesse",
  [IBDeclaration.Yes]:
    "Ja, stuur klantgegevens op passeerdatum door naar partner",
};

const IBDeclarationData = enumToArray(IBDeclaration).map(({ value }) => ({
  label: IBDeclarationLabel[value as IBDeclaration],
  value,
}));

export const Expense = () => {
  const router = useRouter();
  const id = router.query.id as string;

  const { data: expense } = useQuery({
    ...query<
      ExpenseInterface & {
        states: State[];
      }
    >({
      route: `${Route.ApiExpenses}/${id}`,
      method: "GET",
    }),
    enabled: id !== NEW,
  });

  const { data: users } = useQuery(
    query<ApiCollectionResponse<User>>({
      route: Route.ApiUsers,
      method: "POST",
    })
  );

  const { data: companies } = useQuery(
    query<ApiCollectionResponse<Company>>({
      route: Route.ApiCompanies,
      method: "POST",
    })
  );

  return (
    <div>
      {users && companies && (expense || id === NEW) ? (
        <Form
          expense={expense}
          users={users.collection}
          companies={companies.collection}
        />
      ) : (
        <Loader />
      )}
    </div>
  );
};

interface FormProps {
  users: User[];
  companies: Company[];
  expense?: ExpenseInterface & {
    states: State[];
  };
}

interface FormValues {
  handlerId: string;
  customerSalutation: string;
  customerInitials: string;
  customerPrefix: string;
  customerLastName: string;
  customerEmail: string;
  secondCustomerSalutation: string;
  secondCustomerInitials: string;
  secondCustomerPrefix: string;
  secondCustomerLastName: string;
  secondCustomerEmail: string;
  invoiceAddress: string;
  postalCode: string;
  city: string;
  passingDate: Date | null;
  notaryName: string;
  companyId: string;
  starterLoan: boolean;
  objectAddress: string;
  objectPostalCode: string;
  objectCity: string;
  mortgageInvoiceAmount: number | undefined;
  insuranceInvoiceAmount: number | undefined;
  otherInvoiceAmount: number | undefined;
  signedOTDV: File | null;
  zzpInvoice: File | null;
  paymentMethod: string;
  spreadPaymentAgreement: File | null;
  notes: string;
  IBDeclaration: string;
}

export const requiredValidation = (value: any) =>
  !value ? "Dit veld is verplicht" : null;

const fileValidation = (file: File | null) =>
  !file ? "Dit veld is verplicht" : file.size > 4000000 ? "Maximaal 4MB" : null;

const Form = ({ expense, users, companies }: FormProps) => {
  const session = useSession();
  const router = useRouter();
  const id = router.query.id as string;
  const [passingDateOptional, setPassingDateOptional] = useState(false);

  const createExpense = useMutation({
    mutationFn: (params: FormData) =>
      axios.post<ExpenseInterface>(`${Route.ApiExpenses}/${id}`, params, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }),
  });

  const updateExpense = useMutation({
    mutationFn: (params: FormData) =>
      axios.put<ExpenseInterface>(`${Route.ApiExpenses}/${id}`, params, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }),
  });

  const initialValues = useMemo(
    () => ({
      handlerId: expense?.handlerId
        ? expense.handlerId.toString()
        : session.data?.user.role !== Role.InternalEmployee
        ? session.data?.user.id.toString() ?? ""
        : "",
      customerSalutation: expense?.customerSalutation ?? "",
      customerInitials: expense?.customerInitials ?? "",
      customerPrefix: expense?.customerPrefix ?? "",
      customerLastName: expense?.customerLastName ?? "",
      customerEmail: expense?.customerEmail ?? "",
      secondCustomerSalutation: expense?.secondCustomerSalutation ?? "",
      secondCustomerInitials: expense?.secondCustomerInitials ?? "",
      secondCustomerPrefix: expense?.secondCustomerPrefix ?? "",
      secondCustomerLastName: expense?.secondCustomerLastName ?? "",
      secondCustomerEmail: expense?.secondCustomerEmail ?? "",
      invoiceAddress: expense?.invoiceAddress ?? "",
      postalCode: expense?.postalCode ?? "",
      city: expense?.city ?? "",
      passingDate: expense?.passingDate ? new Date(expense.passingDate) : null,
      notaryName: expense?.notaryName ?? "",
      companyId: expense?.companyId.toString() ?? "",
      starterLoan: expense?.starterLoan ?? false,
      objectAddress: expense?.objectAddress ?? "",
      objectPostalCode: expense?.objectPostalCode ?? "",
      objectCity: expense?.objectCity ?? "",
      mortgageInvoiceAmount: expense?.mortgageInvoiceAmount
        ? new Prisma.Decimal(expense.mortgageInvoiceAmount).toNumber()
        : undefined,
      insuranceInvoiceAmount: expense?.insuranceInvoiceAmount
        ? new Prisma.Decimal(expense.insuranceInvoiceAmount).toNumber()
        : undefined,
      otherInvoiceAmount: expense?.otherInvoiceAmount
        ? new Prisma.Decimal(expense.otherInvoiceAmount).toNumber()
        : undefined,
      signedOTDV: expense?.signedOTDV
        ? new File([], expense.signedOTDV, { type: "application/pdf" })
        : null,
      zzpInvoice: expense?.zzpInvoice
        ? new File([], expense.zzpInvoice, { type: "application/pdf" })
        : null,
      paymentMethod: expense?.paymentMethod ?? "",
      spreadPaymentAgreement: expense?.spreadPaymentAgreement
        ? new File([], expense.spreadPaymentAgreement, {
            type: "application/pdf",
          })
        : null,
      notes: expense?.notes ?? "",
      IBDeclaration: expense?.IBDeclaration ?? "",
    }),
    [expense, session]
  );

  const form = useForm<FormValues>({
    initialValues: initialValues,
    validate: (values) => {
      const secondCustomerRequired = !!(
        values.secondCustomerSalutation ||
        values.secondCustomerInitials ||
        values.secondCustomerPrefix ||
        values.secondCustomerLastName ||
        values.secondCustomerEmail
      );

      const obj = {
        handlerId: requiredValidation,
        customerSalutation: requiredValidation,
        customerInitials: requiredValidation,
        customerLastName: requiredValidation,
        customerEmail: requiredValidation,
        secondCustomerSalutation: secondCustomerRequired
          ? requiredValidation
          : undefined,
        secondCustomerInitials: secondCustomerRequired
          ? requiredValidation
          : undefined,
        secondCustomerLastName: secondCustomerRequired
          ? requiredValidation
          : undefined,
        secondCustomerEmail: secondCustomerRequired
          ? requiredValidation
          : undefined,
        invoiceAddress: requiredValidation,
        postalCode: requiredValidation,
        city: requiredValidation,
        passingDate: !passingDateOptional ? requiredValidation : undefined,
        notaryName: requiredValidation,
        companyId: requiredValidation,
        objectAddress: requiredValidation,
        objectPostalCode: requiredValidation,
        objectCity: requiredValidation,
        signedOTDV: fileValidation,
        zzpInvoice:
          session.data?.user.role === Role.ExternalConsultant
            ? fileValidation
            : undefined,
        paymentMethod: requiredValidation,
        spreadPaymentAgreement: (value: File | null) =>
          values.paymentMethod === PaymentMethod.Spread
            ? fileValidation(value)
            : undefined,
        IBDeclaration: requiredValidation,
      };

      return Object.keys(obj).reduce((object, key) => {
        const value = obj[key as keyof typeof obj];

        return {
          ...object,
          [key]: value
            ? value(values[key as keyof FormValues] as any)
            : undefined,
        };
      }, {});
    },
  });

  const secondCustomerRequired = useMemo(
    () =>
      !!(
        form.values.secondCustomerSalutation ||
        form.values.secondCustomerInitials ||
        form.values.secondCustomerPrefix ||
        form.values.secondCustomerLastName ||
        form.values.secondCustomerEmail
      ),
    [
      form.values.secondCustomerEmail,
      form.values.secondCustomerInitials,
      form.values.secondCustomerLastName,
      form.values.secondCustomerPrefix,
      form.values.secondCustomerSalutation,
    ]
  );

  const lastState = useMemo(
    () => expense?.states[expense.states.length - 1],
    [expense?.states]
  );

  const isLocked = useMemo(
    () =>
      !!(
        session.data?.user.role === Role.FinancialWorker ||
        (lastState?.type && lastState.type !== ExpenseState.Rejected)
      ),
    [lastState?.type, session.data?.user.role]
  );

  useEffect(() => {
    if (isLocked || id !== NEW)
      setPassingDateOptional(!form.values.passingDate);
  }, []);

  const state = useMemo(
    () => (expense ? expense.states[expense.states.length - 1] : undefined),
    [expense]
  );

  const handlerSelectData = useMemo(
    () =>
      users
        .filter(({ role }) =>
          isLocked ? true : role === Role.InternalConsultant
        )
        .map(({ name, id }) => ({ label: name, value: id.toString() })),
    [isLocked, users]
  );

  const companieSelectData = useMemo(
    () =>
      companies
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(({ name, id }) => ({ label: name, value: id.toString() })),
    [companies]
  );

  const submitHandler = async (values: FormValues) => {
    const formValues = expense
      ? getChangedFields(values, initialValues)
      : values;

    const formData = new FormData();
    Object.keys(formValues).forEach((key) => {
      // @ts-ignore
      formData.append(key, formValues[key]);
    });

    if (
      initialValues.signedOTDV?.lastModified !== values.signedOTDV?.lastModified
    ) {
      formData.delete("signedOTDV");
      formData.append("signedOTDV", values.signedOTDV ?? "");
    }

    if (
      initialValues.zzpInvoice?.lastModified !== values.zzpInvoice?.lastModified
    ) {
      formData.delete("zzpInvoice");
      formData.append("zzpInvoice", values.zzpInvoice ?? "");
    }

    if (
      initialValues.spreadPaymentAgreement?.lastModified !==
      values.spreadPaymentAgreement?.lastModified
    ) {
      formData.delete("spreadPaymentAgreement");
      formData.append(
        "spreadPaymentAgreement",
        values.spreadPaymentAgreement ?? ""
      );
    }

    if (expense)
      updateExpense.mutate(formData, {
        onSuccess: ({ data: updatedExpense }) => {
          form.resetDirty();
          showNotification({
            message: "Opgeslagen",
            color: "green",
          });

          queryClient.setQueryData(
            [`${Route.ApiExpenses}/${id}`],
            updatedExpense
          );
        },
      });
    else
      createExpense.mutate(formData, {
        onSuccess: async ({ data: expense }) => {
          form.resetDirty();
          await router.push(`${Route.Expenses}/${expense.id}`);

          showNotification({
            message: "Ingediend",
            color: "green",
          });
        },
      });
  };

  const approveHandler = () => {
    updateExpense.mutate(
      {
        // @ts-ignore
        states: {
          create: {
            type: ExpenseState.Approved,
          },
        },
      },
      {
        onSuccess: ({ data: updatedExpense }) => {
          queryClient.setQueryData(
            [`${Route.ApiExpenses}/${id}`],
            updatedExpense
          );
        },
      }
    );
  };

  const rejectHandler = (notes: string, onSuccess: () => void) => {
    updateExpense.mutate(
      {
        // @ts-ignore
        states: {
          create: {
            type: ExpenseState.Rejected,
            notes,
          },
        },
      },
      {
        onSuccess: ({ data: updatedExpense }) => {
          onSuccess();
          queryClient.setQueryData(
            [`${Route.ApiExpenses}/${id}`],
            updatedExpense
          );
        },
      }
    );
  };

  const completeHandler = () => {
    updateExpense.mutate(
      {
        // @ts-ignore
        states: {
          create: {
            type: ExpenseState.Completed,
          },
        },
      },
      {
        onSuccess: ({ data: updatedExpense }) => {
          queryClient.setQueryData(
            [`${Route.ApiExpenses}/${id}`],
            updatedExpense
          );
        },
      }
    );
  };

  return (
    <div>
      <form onSubmit={form.onSubmit(submitHandler)}>
        <Group>
          <Title>Verzoek</Title>
          <Link href={Route.Expenses}>
            <Button leftIcon={<IconArrowBack />}>Terug</Button>
          </Link>
          {!isLocked && (
            <Button
              leftIcon={expense ? <IconDeviceFloppy /> : <IconSend />}
              type="submit"
            >
              {expense ? "Opnieuw indienen" : "Indienen"}
            </Button>
          )}
          {session.data?.user.role === Role.FinancialWorker && (
            <>
              {(state?.type === ExpenseState.Submitted ||
                state?.type === ExpenseState.Resubmitted) && (
                <>
                  <Button
                    color="green"
                    leftIcon={<IconCheck />}
                    onClick={approveHandler}
                  >
                    Goedkeuren
                  </Button>
                  <Button
                    color="red"
                    leftIcon={<IconX />}
                    onClick={() => {
                      openModal({
                        title: "Verzoek afkeuren",
                        modalId: "reject-expense",
                        children: <RejectModal onSubmit={rejectHandler} />,
                      });
                    }}
                  >
                    Afkeuren
                  </Button>
                </>
              )}
              {state?.type === ExpenseState.Approved && (
                <Button
                  color="green"
                  leftIcon={<IconCheck />}
                  onClick={completeHandler}
                >
                  Uitvoeren
                </Button>
              )}
            </>
          )}
        </Group>
        {expense && (
          <Stack my="md" spacing="sm">
            <Text>
              Ingediend:{" "}
              <Badge size="lg">
                {new Date(expense.createdAt).toLocaleString("nl-NL")}
              </Badge>
            </Text>
            <Text>
              Gefactureerd:{" "}
              <Badge size="lg">
                {expense.completedAt
                  ? new Date(expense.completedAt).toLocaleString("nl-NL")
                  : "Nog niet"}
              </Badge>
            </Text>
          </Stack>
        )}
        {(session.data?.user.role === Role.InternalEmployee ||
          session.data?.user.role === Role.FinancialWorker ||
          session.data?.user.role === Role.Administrator) && (
          <Select
            searchable
            readOnly={isLocked}
            withAsterisk={!isLocked}
            data={handlerSelectData}
            label="Behandelaar"
            {...form.getInputProps("handlerId")}
          />
        )}
        <Group grow>
          <Select
            data={["De heer", "Mevrouw"]}
            readOnly={isLocked}
            withAsterisk={!isLocked}
            label="Aanhef klant"
            {...form.getInputProps("customerSalutation")}
          />
          <TextInput
            readOnly={isLocked}
            withAsterisk={!isLocked}
            label="Voorletters klant"
            {...form.getInputProps("customerInitials")}
            onChange={(e) => {
              let inputValue = e.target.value;
              const lastValue = inputValue.at(-1);

              if (lastValue === ".") inputValue = inputValue.slice(0, -1);

              if (inputValue.length > form.values.customerInitials.length) {
                const array = inputValue.trim().split("");
                const value = array.reduce((string, current, index) => {
                  if (current === "." || array[index + 1] === ".")
                    return (string += current.toUpperCase());

                  return (string += `${current.toUpperCase()}.`);
                }, "");

                form.setFieldValue("customerInitials", value);
              } else form.setFieldValue("customerInitials", inputValue);
            }}
          />
          <TextInput
            readOnly={isLocked}
            label="Tussenvoegsel klant"
            {...form.getInputProps("customerPrefix")}
          />
          <TextInput
            readOnly={isLocked}
            withAsterisk={!isLocked}
            label="Achternaam klant"
            {...form.getInputProps("customerLastName")}
          />
          <TextInput
            readOnly={isLocked}
            withAsterisk={!isLocked}
            label="E-mail klant"
            {...form.getInputProps("customerEmail")}
          />
        </Group>
        <Group grow>
          <Select
            data={["De heer", "Mevrouw"]}
            readOnly={isLocked}
            clearable
            label="Aanhef 2e klant"
            withAsterisk={secondCustomerRequired}
            {...form.getInputProps("secondCustomerSalutation")}
          />
          <TextInput
            readOnly={isLocked}
            label="Voorletters 2e klant"
            withAsterisk={secondCustomerRequired}
            {...form.getInputProps("secondCustomerInitials")}
            onChange={(e) => {
              if (
                e.target.value.length >
                form.values.secondCustomerInitials.length
              ) {
                const array = e.target.value.trim().split("");
                const value = array.reduce((string, current, index) => {
                  if (current === "." || array[index + 1] === ".")
                    return (string += current.toUpperCase());

                  return (string += `${current.toUpperCase()}.`);
                }, "");

                form.setFieldValue("secondCustomerInitials", value);
              } else
                form.setFieldValue("secondCustomerInitials", e.target.value);
            }}
          />
          <TextInput
            readOnly={isLocked}
            label="Tussenvoegsel 2e klant"
            {...form.getInputProps("secondCustomerPrefix")}
          />
          <TextInput
            readOnly={isLocked}
            withAsterisk={secondCustomerRequired}
            label="Achternaam 2e klant"
            {...form.getInputProps("secondCustomerLastName")}
          />
          <TextInput
            readOnly={isLocked}
            withAsterisk={secondCustomerRequired}
            label="E-mail 2e klant"
            {...form.getInputProps("secondCustomerEmail")}
          />
        </Group>
        <Group grow>
          <TextInput
            readOnly={isLocked}
            withAsterisk={!isLocked}
            label="Factuuradres"
            {...form.getInputProps("invoiceAddress")}
          />
          <TextInput
            readOnly={isLocked}
            withAsterisk={!isLocked}
            label="Postcode"
            {...form.getInputProps("postalCode")}
          />
          <TextInput
            readOnly={isLocked}
            withAsterisk={!isLocked}
            label="Stad"
            {...form.getInputProps("city")}
          />
        </Group>
        <Group>
          <DatePickerInput
            readOnly={isLocked}
            valueFormat="DD-MM-YYYY"
            locale="nl"
            withAsterisk={!isLocked && !passingDateOptional}
            label="Passeerdatum"
            {...form.getInputProps("passingDate")}
            onChange={(value) => {
              form.setFieldValue("passingDate", value);
              if (value) setPassingDateOptional(false);
            }}
          />
          <Checkbox
            mt={30}
            disabled={!!isLocked}
            checked={passingDateOptional}
            label="N.V.T."
            onChange={(e) => {
              setPassingDateOptional(e.target.checked);
              if (e.target.checked) form.setFieldValue("passingDate", null);
            }}
          />
        </Group>
        <TextInput
          readOnly={isLocked}
          withAsterisk={!isLocked}
          label="Notarisnaam"
          {...form.getInputProps("notaryName")}
        />
        <Group>
          <Select
            searchable
            readOnly={isLocked}
            withAsterisk={!isLocked}
            label="Maatschappij"
            data={companieSelectData}
            {...form.getInputProps("companyId")}
          />
          <Checkbox
            mt={30}
            disabled={!!isLocked}
            checked={form.values.starterLoan}
            label="SVn Starterslening"
            onChange={(e) => {
              form.setFieldValue("starterLoan", e.target.checked);
            }}
          />
        </Group>
        <Group grow>
          <TextInput
            readOnly={isLocked}
            withAsterisk={!isLocked}
            label="Adres object"
            {...form.getInputProps("objectAddress")}
          />
          <TextInput
            readOnly={isLocked}
            withAsterisk={!isLocked}
            label="Postcode object"
            {...form.getInputProps("objectPostalCode")}
          />
          <TextInput
            readOnly={isLocked}
            withAsterisk={!isLocked}
            label="Stad object"
            {...form.getInputProps("objectCity")}
          />
        </Group>
        <Group grow>
          <MoneyInput
            readOnly={isLocked}
            required={!isLocked}
            label="Bedrag hypotheek"
            {...form.getInputProps("mortgageInvoiceAmount")}
          />
          <MoneyInput
            readOnly={isLocked}
            required={!isLocked}
            label="Bedrag verzekering"
            {...form.getInputProps("insuranceInvoiceAmount")}
          />
          <MoneyInput
            readOnly={isLocked}
            required={!isLocked}
            label="Bedrag overige"
            {...form.getInputProps("otherInvoiceAmount")}
          />
        </Group>
        {!isLocked ? (
          <>
            <FileInput
              withAsterisk={!isLocked}
              label="Ondertekende OTDV"
              description="PDF, Max 4MB"
              accept="application/pdf"
              {...form.getInputProps("signedOTDV")}
            />
            {session.data?.user.role === Role.ExternalConsultant && (
              <FileInput
                withAsterisk={!isLocked}
                label="Factuur ZZP-er"
                description="PDF, Max 4MB"
                accept="application/pdf"
                {...form.getInputProps("zzpInvoice")}
              />
            )}
          </>
        ) : (
          <Group mt="md" mb="xs">
            {expense?.signedOTDV && (
              <Link
                href={`/api/pdf?fileName=${expense.signedOTDV}`}
                target="_blank"
              >
                <Button leftIcon={<IconFileText />}>Ondertekende OTDV</Button>
              </Link>
            )}
            {expense?.zzpInvoice && (
              <Link
                href={`/api/pdf?fileName=${expense.zzpInvoice}`}
                target="_blank"
              >
                <Button leftIcon={<IconFileText />}>Factuur ZZP-er</Button>
              </Link>
            )}
          </Group>
        )}
        <Textarea
          readOnly={isLocked}
          label="Opmerkingen"
          autosize
          minRows={3}
          {...form.getInputProps("notes")}
        />
        <Select
          searchable
          withAsterisk={!isLocked}
          readOnly={isLocked}
          data={paymentMethodData}
          label="Betaalwijze"
          {...form.getInputProps("paymentMethod")}
        />
        {form.values.paymentMethod === PaymentMethod.Spread &&
          (!isLocked ? (
            <FileInput
              withAsterisk={!isLocked}
              label="Overeenkomst Gespreide Betaling"
              description="PDF, Max 4MB"
              accept="application/pdf"
              {...form.getInputProps("spreadPaymentAgreement")}
            />
          ) : (
            expense?.spreadPaymentAgreement && (
              <Group mt="md" mb="xs">
                <Link
                  href={`/api/pdf?fileName=${expense.spreadPaymentAgreement}`}
                  target="_blank"
                >
                  <Button leftIcon={<IconFileText />}>
                    Overeenkomst Gespreide Betaling
                  </Button>
                </Link>
              </Group>
            )
          ))}
        <Select
          searchable
          withAsterisk={!isLocked}
          readOnly={isLocked}
          data={IBDeclarationData}
          label="IB-aangifte door partner"
          {...form.getInputProps("IBDeclaration")}
        />
      </form>
      {!!expense?.states.length && (
        <Aside p="md" width={{ sm: 300 }}>
          <Timeline
            active={expense.states.length - 1}
            bulletSize={24}
            lineWidth={2}
          >
            {expense.states.map((state) => (
              <Timeline.Item
                bullet
                color={expenseStateColor[state.type as ExpenseState]}
                key={state.id}
                title={expenseStateLabel[state.type as ExpenseState]}
              >
                {state.notes && (
                  <Text color="dimmed" size="sm">
                    {state.notes}
                  </Text>
                )}
                <Text size="xs" mt={4}>
                  {new Date(state.createdAt).toLocaleString("nl-NL")}
                </Text>
              </Timeline.Item>
            ))}
          </Timeline>
        </Aside>
      )}
    </div>
  );
};

interface RejectModalProps {
  onSubmit: (notes: string, onSuccess: () => void) => void;
}

const RejectModal = ({ onSubmit }: RejectModalProps) => {
  const [notes, setNotes] = useState("");

  return (
    <Stack>
      <Textarea
        required
        withAsterisk
        label="Reden"
        autosize
        value={notes}
        style={{
          flexGrow: 1,
        }}
        onChange={(e) => {
          setNotes(e.target.value);
        }}
      />
      <Button
        style={{
          flexGrow: 0,
        }}
        onClick={() => {
          onSubmit(notes, () => {
            setNotes("");
            closeModal("reject-expense");
            showNotification({
              message: "Verzoek afgekeurd",
              color: "green",
            });
          });
        }}
        disabled={!notes}
      >
        Afkeuren
      </Button>
    </Stack>
  );
};

Expense.getLayout = function getLayout(page: ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};

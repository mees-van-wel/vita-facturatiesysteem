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
} from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import { useForm } from "@mantine/form";
import {
  Company,
  Expense as ExpenseInterface,
  Prisma,
  State,
  User,
} from "@prisma/client";
import { IconArrowBack, IconFileText, IconSend } from "@tabler/icons";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { ReactElement, useMemo } from "react";
import { MoneyInput } from "../../components/MoneyInput";
import { Role } from "../../enums/role.enum";
import { Route } from "../../enums/route.enum";
import { ApiCollectionResponse } from "../../interfaces/apiCollectionResponse.interface";
import { MainLayout } from "../../layouts/Main";
import { query } from "../../lib/query.lib";

export const NEW = "new";

export const Expense = () => {
  const router = useRouter();
  const id = router.query.id as string;

  const { data: expence } = useQuery({
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
      {users && companies && (expence || id === NEW) ? (
        <Form
          expence={expence}
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
  expence?: ExpenseInterface & {
    states: State[];
  };
}

interface FormValues {
  handlerId: string;
  customerName: string;
  invoiceAddress: string;
  postalCode: string;
  city: string;
  passingDate: Date | null;
  notaryName: string;
  companyId: string;
  objectAddress: string;
  objectPostalCode: string;
  objectCity: string;
  mortgageInvoiceAmount: number | undefined;
  insuranceInvoiceAmount: number | undefined;
  otherInvoiceAmount: number | undefined;
  signedOTDV: File | null;
  zzpInvoice: File | null;
  paymentMethod: string;
  notes: string;
  IBDeclaration: string;
}

const Form = ({ expence, users, companies }: FormProps) => {
  const form = useForm<FormValues>({
    initialValues: {
      handlerId: expence?.handlerId.toString() ?? "",
      customerName: expence?.customerName ?? "",
      invoiceAddress: expence?.invoiceAddress ?? "",
      postalCode: expence?.postalCode ?? "",
      city: expence?.city ?? "",
      passingDate: expence?.passingDate ? new Date(expence.passingDate) : null,
      notaryName: expence?.notaryName ?? "",
      companyId: expence?.companyId.toString() ?? "",
      objectAddress: expence?.objectAddress ?? "",
      objectPostalCode: expence?.objectPostalCode ?? "",
      objectCity: expence?.objectCity ?? "",
      mortgageInvoiceAmount: expence?.mortgageInvoiceAmount
        ? new Prisma.Decimal(expence.mortgageInvoiceAmount).toNumber()
        : undefined,
      insuranceInvoiceAmount: expence?.insuranceInvoiceAmount
        ? new Prisma.Decimal(expence.insuranceInvoiceAmount).toNumber()
        : undefined,
      otherInvoiceAmount: expence?.otherInvoiceAmount
        ? new Prisma.Decimal(expence.otherInvoiceAmount).toNumber()
        : undefined,
      signedOTDV: expence?.signedOTDV ? new File([], expence.signedOTDV) : null,
      zzpInvoice: expence?.zzpInvoice ? new File([], expence.zzpInvoice) : null,
      paymentMethod: expence?.paymentMethod ?? "",
      notes: expence?.notes ?? "",
      IBDeclaration: expence?.IBDeclaration ?? "",
    },
  });

  const session = useSession();

  const isLocked = false;

  const handlerSelectData = useMemo(
    () => users.map(({ name, id }) => ({ label: name, value: id.toString() })),
    [users]
  );

  console.log(expence, handlerSelectData);

  const companieSelectData = useMemo(
    () =>
      companies.map(({ name, id }) => ({ label: name, value: id.toString() })),
    [companies]
  );

  return (
    <div>
      <form>
        <Group>
          <Title>Verzoek</Title>
          <Link href={Route.Expenses}>
            <Button leftIcon={<IconArrowBack />}>Terug</Button>
          </Link>
          {!isLocked && (
            <Button leftIcon={<IconSend />} type="submit">
              Indienen
            </Button>
          )}
        </Group>
        {expence && (
          <Stack my="md" spacing="sm">
            <Text>
              Ingedient:{" "}
              <Badge>
                {new Date(expence.createdAt).toLocaleString("nl-NL")}
              </Badge>
            </Text>
            <Text>
              Gefactureerd:{" "}
              <Badge>
                {expence.completedAt
                  ? new Date(expence.completedAt).toLocaleString("nl-NL")
                  : "Nog niet"}
              </Badge>
            </Text>
          </Stack>
        )}
        <Select
          readOnly={isLocked}
          withAsterisk={!isLocked}
          data={handlerSelectData}
          label="Behandelaar"
          {...form.getInputProps("handlerId")}
        />
        <TextInput
          readOnly={isLocked}
          withAsterisk={!isLocked}
          label="Naam klant"
          {...form.getInputProps("customerName")}
        />
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
        {isLocked && expence?.passingDate ? (
          <p>
            Passeerdatum:{" "}
            <Badge>
              {new Date(expence.passingDate).toLocaleDateString("nl-NL")}
            </Badge>
          </p>
        ) : (
          <DatePicker
            withAsterisk={!isLocked}
            label="Passeerdatum"
            {...form.getInputProps("passingDate")}
          />
        )}
        <TextInput
          readOnly={isLocked}
          withAsterisk={!isLocked}
          label="Notarisnaam"
          {...form.getInputProps("notaryName")}
        />
        <Select
          readOnly={isLocked}
          withAsterisk={!isLocked}
          label="Maatschappij"
          data={companieSelectData}
          {...form.getInputProps("companyId")}
        />
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
        <MoneyInput
          readOnly={isLocked}
          withAsterisk={!isLocked}
          label="Bedrag hypotheek"
          {...form.getInputProps("mortgageInvoiceAmount")}
        />
        <MoneyInput
          readOnly={isLocked}
          withAsterisk={!isLocked}
          label="Bedrag verzekering"
          {...form.getInputProps("insuranceInvoiceAmount")}
        />
        <MoneyInput
          readOnly={isLocked}
          withAsterisk={!isLocked}
          label="Bedrag overige"
          {...form.getInputProps("otherInvoiceAmount")}
        />
        {!isLocked ? (
          <>
            <FileInput
              withAsterisk={!isLocked}
              label="Ondertekende OTDV"
              accept="application/pdf"
              {...form.getInputProps("signedOTDV")}
            />
            {session.data?.user.role === Role.ExternalConsultant && (
              <FileInput
                withAsterisk={!isLocked}
                label="Factuur ZZP-er"
                accept="application/pdf"
                {...form.getInputProps("zzpInvoice")}
              />
            )}
          </>
        ) : (
          <Group mt="md" mb="xs">
            {expence?.signedOTDV && (
              <Link
                href={`/public/uploads/${expence.signedOTDV}.pdf`}
                target="_blank"
              >
                <Button leftIcon={<IconFileText />}>Ondertekende OTDV</Button>
              </Link>
            )}
            {expence?.zzpInvoice && (
              <Link
                href={`/public/uploads/${expence.zzpInvoice}.pdf`}
                target="_blank"
              >
                <Button leftIcon={<IconFileText />}>Factuur ZZP-er</Button>
              </Link>
            )}
          </Group>
        )}
        <Textarea
          readOnly={isLocked}
          withAsterisk={!isLocked}
          label="Opmerkingen"
          autosize
          minRows={3}
          {...form.getInputProps("notes")}
        />
        <Select
          withAsterisk={!isLocked}
          readOnly={isLocked}
          data={[]}
          label="Betaalwijze"
        />
        <Select
          withAsterisk={!isLocked}
          readOnly={isLocked}
          data={[]}
          label="IB-aangifte door partner"
        />
      </form>
      {!!expence?.states.length && (
        <Aside p="md" width={{ sm: 300 }}>
          <Timeline
            active={expence.states.length - 1}
            bulletSize={24}
            lineWidth={2}
          >
            {expence.states.map((state) => (
              <Timeline.Item key={state.id} title={state.type}>
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

Expense.getLayout = function getLayout(page: ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};

import { QueryFunctionContext } from "@tanstack/react-query";
import axios from "axios";

interface QueryParams {
  route: string;
  method: string;
  params?: Record<string, any>;
}

export const query = <T>({ route, method, params }: QueryParams) => {
  const queryKey = [route];

  if (params) queryKey.push(...Object.values(params));

  return {
    queryKey,
    queryFn: async (context: QueryFunctionContext<string[], any>) =>
      await (
        await axios<T>(route, { method, data: params })
      ).data,
  };
};

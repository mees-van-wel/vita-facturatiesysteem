import { QueryFunctionContext } from "@tanstack/react-query";
import axios from "axios";
import { Route } from "../enums/route.enum";

export const query = <T>(route: Route, params: Record<string, any>) => ({
  queryKey: [route, ...Object.values(params)],
  queryFn: async (context: QueryFunctionContext<string[], any>) =>
    await (
      await axios.post<T>(route, params)
    ).data,
});

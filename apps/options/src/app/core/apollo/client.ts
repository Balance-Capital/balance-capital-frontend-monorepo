import { ApolloClient, InMemoryCache, gql } from "@apollo/client";

import { GRAPH_URL } from "../constants/basic";

export enum ApolloActionType {
  QUERY,
  MUTATE,
}

export const clientInstance = () => {
  return new ApolloClient({
    uri: GRAPH_URL(),
    cache: new InMemoryCache(),
    queryDeduplication: true,
    defaultOptions: {
      watchQuery: {
        fetchPolicy: "no-cache",
      },
      query: {
        fetchPolicy: "no-cache",
        errorPolicy: "all",
      },
    },
  });
};

export const apolloClient = async (
  apolloActionType: ApolloActionType,
  queryString: string
) => {
  return apolloActionType === ApolloActionType.QUERY
    ? clientInstance()
        .query({
          query: gql(queryString),
        })
        .then((response?: any) => {
          return response.data;
        })
        .catch()
    : clientInstance()
        .mutate({
          mutation: gql(queryString),
        })
        .then((response?: any) => {
          return response.data;
        })
        .catch();
};

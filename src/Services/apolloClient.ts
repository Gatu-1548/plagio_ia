import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";

const httpLink = createHttpLink({
  uri: "https://gateway-microservice-d5ccehh0ajaqgcd0.canadacentral-01.azurewebsites.net/graphql", // <-- aquí va tu endpoint GraphQL
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

export default client;
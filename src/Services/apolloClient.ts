import { ApolloClient, InMemoryCache, createHttpLink, ApolloLink, Observable } from "@apollo/client";

const httpLink = createHttpLink({
  uri: "https://gateway-microservice-d5ccehh0ajaqgcd0.canadacentral-01.azurewebsites.net/graphql", // <-- aquí va tu endpoint GraphQL
});

// Link de logging temporal para depuración: muestra query, variables y respuesta
const logLink = new ApolloLink((operation, forward) => {
  try {
    console.log("[APOLLO REQUEST] operationName:", operation.operationName);
    // Query como string (si está disponible)
    const queryStr = (operation.query && (operation.query.loc as any)?.source?.body) || operation.query?.definitions;
    console.log("[APOLLO REQUEST] query:", queryStr);
    console.log("[APOLLO REQUEST] variables:", operation.variables);
  } catch (e) {
    console.warn("[APOLLO REQUEST] error serializing request for log", e);
  }

  // forward puede ser undefined si este link es el final de la cadena; manejar ese caso
  if (!forward) {
    return new Observable((observer) => {
      // no hay siguiente link, simplemente completamos
      observer.complete();
    });
  }

  const forwarded = forward(operation);
  return new Observable((observer) => {
    const subscription = forwarded.subscribe({
      next(result: any) {
        try {
          console.log("[APOLLO RESPONSE] operationName:", operation.operationName, "result:", result);
        } catch (e) {
          console.warn("[APOLLO RESPONSE] error logging result", e);
        }
        observer.next(result);
      },
      error(err: any) {
        observer.error(err);
      },
      complete() {
        observer.complete();
      },
    });

    return () => {
      try {
        subscription.unsubscribe();
      } catch (e) {
        /* ignore */
      }
    };
  });
});

const client = new ApolloClient({
  link: ApolloLink.from([logLink, httpLink]),
  cache: new InMemoryCache(),
});

export default client;
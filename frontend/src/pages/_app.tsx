import { App } from "next/app";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "./state";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, fetchUser } = useAuthStore();

  React.useEffect(() => {
    if (isAuthenticated) {
      fetchUser();
    }
  }, [isAuthenticated, fetchUser]);

  return <>{children}</>;
}

export default function MyApp({ Component, pageProps }: any) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthInitializer>
        <Component {...pageProps} />
      </AuthInitializer>
    </QueryClientProvider>
  );
}

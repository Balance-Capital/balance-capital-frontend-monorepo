import type { ReactNode } from "react";
import { createContext, Suspense, useContext, useState } from "react";
import { useUnmount } from "react-use";
import { LoadingScreen } from "./LoadingScreen";

interface LoadingBoundaryContextValues {
  fallback: NonNullable<ReactNode>;
  isLoading: boolean;
  hideLoading: () => void;
}

const LoadingBoundaryContext = createContext<LoadingBoundaryContextValues>({
  fallback: <div />,
  isLoading: true,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  hideLoading: () => {},
});

export function useLoadingBoundary() {
  return useContext(LoadingBoundaryContext);
}

interface LoadingProviderProps {
  children: ReactNode;
}

export function LoadingProvider({ children }: LoadingProviderProps) {
  const [isLoading, setLoading] = useState(true);
  const hideLoading = () => setLoading(false);
  const fallback = isLoading ? (
    <FirstLoadFallback onUnmount={hideLoading} />
  ) : (
    <LoadingScreen />
  );

  return (
    <LoadingBoundaryContext.Provider value={{ fallback, hideLoading, isLoading }}>
      {children}
    </LoadingBoundaryContext.Provider>
  );
}

interface FirstLoadFallbackProps {
  onUnmount: () => void;
}

function FirstLoadFallback({ onUnmount }: FirstLoadFallbackProps) {
  useUnmount(() => onUnmount());

  return null;
}

interface LoadingBoundaryProps {
  children: ReactNode;
}

export function LoadingBoundary({ children }: LoadingBoundaryProps) {
  const { fallback } = useLoadingBoundary();

  return <Suspense fallback={fallback}>{children}</Suspense>;
}

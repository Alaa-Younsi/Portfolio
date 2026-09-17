import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "react-error-boundary";
import { App } from "@/App";
import { ErrorFallback } from "@/components/ErrorFallback";
import "@/index.css";

const container = document.getElementById("root");
if (!container) throw new Error("Missing #root element in index.html");

createRoot(container).render(
  <StrictMode>
    <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => window.location.reload()}>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

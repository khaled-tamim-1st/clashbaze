import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AuthProvider } from "@/contexts/AuthContext";

import Home from "@/pages/Home";
import ClashOfClans from "@/pages/ClashOfClans";
import ClashRoyale from "@/pages/ClashRoyale";
import AccountDetail from "@/pages/AccountDetail";
import Blog from "@/pages/Blog";
import BlogDetail from "@/pages/BlogDetail";
import Login from "@/pages/Login";
import Dashboard from "@/pages/admin/Dashboard";
import AdminAccounts from "@/pages/admin/AdminAccounts";
import AdminBlog from "@/pages/admin/AdminBlog";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/clash-of-clans" component={ClashOfClans} />
      <Route path="/clash-royale" component={ClashRoyale} />
      <Route path="/account/:slug" component={AccountDetail} />
      <Route path="/blog" component={Blog} />
      <Route path="/blog/:slug" component={BlogDetail} />
      <Route path="/login" component={Login} />

      <Route path="/admin" component={Dashboard} />
      <Route path="/admin/accounts" component={AdminAccounts} />
      <Route path="/admin/blog" component={AdminBlog} />

      <Route component={NotFound} />
    </Switch>
  );
}

import { CurrencyProvider } from "@/contexts/CurrencyContext";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CurrencyProvider>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </CurrencyProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

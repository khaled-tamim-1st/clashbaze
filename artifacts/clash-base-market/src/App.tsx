import { Switch, Route, Redirect, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AuthProvider } from "@/contexts/AuthContext";

import Home from "@/pages/Home";
import ClashOfClans from "@/pages/ClashOfClans";
import ClashRoyale from "@/pages/ClashRoyale";
import AccountDetail from "@/pages/AccountDetail";
import TownHallCategory from "@/pages/TownHallCategory";
import Blog from "@/pages/Blog";
import BlogDetail from "@/pages/BlogDetail";
import Guarantee from "@/pages/Guarantee";
import HowItWorks from "@/pages/HowItWorks";
import About from "@/pages/About";
import Login from "@/pages/Login";
import Dashboard from "@/pages/admin/Dashboard";
import AdminAccounts from "@/pages/admin/AdminAccounts";
import AdminBlog from "@/pages/admin/AdminBlog";
import WhatsAppAnalytics from "@/pages/admin/WhatsAppAnalytics";
import Reviews from "@/pages/Reviews";
import AdminReviews from "@/pages/admin/AdminReviews";

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
      <Route path="/clash-of-clans/town-hall-18">{() => <TownHallCategory level={18} />}</Route>
      <Route path="/clash-of-clans/town-hall-17">{() => <TownHallCategory level={17} />}</Route>
      <Route path="/clash-of-clans/town-hall-16">{() => <TownHallCategory level={16} />}</Route>
      <Route path="/clash-of-clans/town-hall-15">{() => <TownHallCategory level={15} />}</Route>
      <Route path="/town-hall-18"><Redirect to="/clash-of-clans/town-hall-18" replace /></Route>
      <Route path="/town-hall-17"><Redirect to="/clash-of-clans/town-hall-17" replace /></Route>
      <Route path="/town-hall-16"><Redirect to="/clash-of-clans/town-hall-16" replace /></Route>
      <Route path="/town-hall-15"><Redirect to="/clash-of-clans/town-hall-15" replace /></Route>
      <Route path="/clash-royale" component={ClashRoyale} />
      <Route path="/account"><Redirect to="/clash-of-clans" replace /></Route>
      <Route path="/account/"><Redirect to="/clash-of-clans" replace /></Route>
      <Route path="/account/:slug" component={AccountDetail} />
      <Route path="/blog" component={Blog} />
      <Route path="/blog/:slug" component={BlogDetail} />
      <Route path="/guarantee" component={Guarantee} />
      <Route path="/how-it-works" component={HowItWorks} />
      <Route path="/about" component={About} />
      <Route path="/reviews" component={Reviews} />
      <Route path="/login" component={Login} />

      <Route path="/admin" component={Dashboard} />
      <Route path="/admin/whatsapp" component={WhatsAppAnalytics} />
      <Route path="/admin/accounts" component={AdminAccounts} />
      <Route path="/admin/blog" component={AdminBlog} />
      <Route path="/admin/reviews" component={AdminReviews} />

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

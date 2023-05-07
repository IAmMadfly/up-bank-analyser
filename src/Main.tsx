import { Component } from "solid-js";
import { Route, Routes } from "@solidjs/router";
import { TokenInput } from "./pages/TokenInput";
import { Accounts } from "./pages/Accounts";
import { Account } from "./pages/Account";
import { Transactions } from "./pages/Transactions";



export const Main: Component = () => {

  console.log("Path:", location.pathname)
  return (
    <Routes>
      <Route path="/" component={TokenInput} />
      <Route path="/accounts" component={Accounts} />
      <Route path="/account/:id" component={Account} />
      <Route path="/transactions" component={Transactions} />
    </Routes>
  );
}


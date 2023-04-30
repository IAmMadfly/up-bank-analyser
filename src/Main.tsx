import { Component } from "solid-js";
import { Route, Routes } from "@solidjs/router";
import { TokenInput } from "./components/TokenInput";
import { Accounts } from "./components/Accounts";
import { Account } from "./components/Account";



export const Main: Component = () => {

  console.log("Path:", location.pathname)
  return (
    <Routes>
      <Route path="/" component={TokenInput} />
      <Route path="/accounts" component={Accounts} />
      <Route path="/account/:id" component={Account} />
    </Routes>
  );
}


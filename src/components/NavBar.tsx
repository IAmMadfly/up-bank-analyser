import { Link } from "@solidjs/router";
import { Component } from "solid-js";

export const NavBar: Component = () => {


  return (
    <div class="navbar bg-slate-800 space-x-4 justify-center">
      <Link class="btn" href="/accounts">Accounts</Link>
      <Link class="btn" href="/transactions">Transactions</Link>
    </div>
  )
}




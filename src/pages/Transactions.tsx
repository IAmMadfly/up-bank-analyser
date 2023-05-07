import { Component } from "solid-js";
import { NavBar } from "../components/NavBar";
import { useClient } from "../controller";
import { State } from "../helper/signal";
import { ListTransactionsResponse } from "up-bank-api";







export const Transactions: Component = () => {

  const transactionListState = new State(new Array<ListTransactionsResponse>());
  const transactions = () => transactionListState.state.flatMap(trans => trans.data);

  useClient((client) => {
    client.transactions.list().then((transactionsRes) => {
      transactionsRes
    })
  })

  return (
    <>
      <NavBar />
      <div>
        Transactions
      </div>
    </>
  )
}


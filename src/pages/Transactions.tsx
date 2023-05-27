import { Component, For, createEffect, onMount } from "solid-js";
import { NavBar } from "../components/NavBar";
import { useClient } from "../controller";
import { State } from "../helper/signal";
import { ListTransactionsResponse } from "up-bank-api";
import { Transaction } from "../components/Transaction";







export const Transactions: Component = () => {

  const transactionListState = new State(new Array<ListTransactionsResponse>());
  const transactions = () => transactionListState.state.flatMap(trans => trans.data);

  createEffect(() => {
    useClient((client) => {
      client.transactions.list().then((transactionsRes) => {
        transactionListState.state = [transactionsRes];
      })
    })
  });

  return (
    <>
      <NavBar />
      <div class="flex justify-center">
        <div class="space-y-4 mt-4">
          <For each={transactions()}>
            {(transaction) => {

              return (
                <div>
                  <Transaction transactionData={transaction} />
                </div>
              )
            }}
          </For>
        </div>
      </div>
    </>
  )
}


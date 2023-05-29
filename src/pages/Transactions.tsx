import { Component, For, Show, createEffect, onMount } from "solid-js";
import { NavBar } from "../components/NavBar";
import { useClient } from "../controller";
import { State } from "../helper/signal";
import { ListTransactionsResponse } from "up-bank-api";
import { Transaction } from "../components/Transaction";







export const Transactions: Component = () => {

  const transactionListState = new State(new Array<ListTransactionsResponse>());
  const transactions = () => transactionListState.state
    .flatMap(trans => trans.data)
    .filter(t => !t.relationships.transferAccount.data);

  createEffect(() => {
    useClient((client) => {
      client.transactions.list().then((transactionsRes) => {
        transactionListState.state = [transactionsRes];
      })
    })
  });

  function loadMoreHandler() {
    const index = transactionListState.state.length - 1;

    if (index < 0) {
      throw new Error("Transactions not loaded");
    }

    const nextFn = transactionListState.state[index]?.links.next;
    if (!nextFn) {
      throw new Error("No next values");
    }

    nextFn().then(res => {
      transactionListState.state = [...transactionListState.state, res];
    })
  }

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
          <Show when={true}>
            <div class="flex justify-center">
              <button class="btn" onClick={() => loadMoreHandler()}>
                Load more
              </button>
            </div>
          </Show>
        </div>
      </div>
    </>
  )
}


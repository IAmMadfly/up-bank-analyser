import { Component, For } from "solid-js";
import { NavBar } from "../components/NavBar";
import { useApi } from "../controller";
import { State } from "../helper/signal";
import { ListTransactionsResponse } from "up-bank-api";
import { Transaction } from "../components/Transaction";
import { LoadMoreButton } from "../components/LoadMoreButton";


export const Transactions: Component = () => {

  const loading = new State(false);
  const transactionListState = new State(new Array<ListTransactionsResponse>());
  const transactions = () => transactionListState.state
    .flatMap(trans => trans.data)
    .filter(t => !t.relationships.transferAccount.data);

  useApi(client => {
    loading.state = true;
    client.transactions.list().then((transactionsRes) => {
      transactionListState.state = [transactionsRes];
      loading.state = false;
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

    loading.state = true
    nextFn().then(res => {
      transactionListState.state = [...transactionListState.state, res];
    }).finally(() => {
      loading.state = false;
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
          <div class="flex justify-center">
            <LoadMoreButton loading={loading} loadMoreHandler={loadMoreHandler} />
          </div>
        </div>
      </div>
    </>
  )
}


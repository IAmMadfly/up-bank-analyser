import { useParams } from "@solidjs/router";
import { Component, For, Show, createEffect } from "solid-js";
import { State } from "../helper/signal";
import { AccountResource, ListTransactionsResponse } from "up-bank-api";
import { useClient } from "../controller";

export const Account: Component = () => {

  const accountId = useParams().id as string;

  const account = new State<AccountResource | null>(null);
  const transactions = new State<ListTransactionsResponse | null>(null);

  createEffect(() => {
    useClient((client) => {
      client.accounts.retrieve(accountId).then(accountRes => {
        account.state = accountRes.data
      })

      client.transactions.listByAccount(accountId).then(transactionsRes => {
        transactions.state = transactionsRes
      })
    })
  })

  return (
    <div>
      <Show when={account.state !== null} fallback={<div>loading...</div>}>
        <div class="flex justify-center">
          <h3 class="text-2xl">{account.state?.attributes.displayName} - ${account.state?.attributes.balance.value}</h3>
        </div>
        <div class="flex flex-col items-center space-y-4">
          <For each={transactions.state?.data}>
            {(transaction) => {
              const createDate = new Date(transaction.attributes.createdAt);
              const neg = transaction.attributes.amount.valueInBaseUnits < 0;
              const amount = transaction.attributes.amount.valueInBaseUnits;
              const roundUp = transaction.attributes.roundUp
              const totalAmount = amount + (roundUp ? roundUp?.amount.valueInBaseUnits : 0);
              const amountDisplay = `${neg ? '-' : ''}$${(Math.abs(totalAmount / 100)).toFixed(2)}`

              return (
                <div class="card w-96 bg-slate-900 drop-shadow-lg">
                  <div class="card-body">
                    <div class="flex justify-between">
                      <div class="flex flex-col">
                        <span>{transaction.attributes.description}</span>
                        <span class="text-xs">{transaction.attributes.message}</span>
                      </div>
                      <div class="flex flex-col">
                        <span class={`${neg ? "text-red-400" : "text-green-400"}`}>{amountDisplay}</span>
                        <span class="text-xs">{createDate.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            }}
          </For>
        </div>
      </Show>
    </div>
  )
}





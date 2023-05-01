import { useParams } from "@solidjs/router";
import { Component, For, Show, createEffect } from "solid-js";
import { State } from "../helper/signal";
import { AccountResource, ListTransactionsResponse } from "up-bank-api";
import { useClient } from "../controller";

const dayWeekMap = {
  0: "Mon",
  1: "Tue",
  2: "Wed",
  3: "Thu",
  4: "Fri",
  5: "Sat",
  6: "Sun"
}

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
            {(transaction, index) => {
              const prevDateString = transactions.state!.data[index() - 1]?.attributes.createdAt
              const prevDate = prevDateString ? new Date(prevDateString) : undefined
              const createDate = new Date(transaction.attributes.createdAt);
              const settleDate = transaction.attributes.settledAt ? new Date(transaction.attributes.settledAt) : undefined;
              const newDay = prevDate ? prevDate.getDay() != createDate.getDay() : true;

              const neg = transaction.attributes.amount.valueInBaseUnits < 0;
              const amount = transaction.attributes.amount.valueInBaseUnits;
              const roundUp = transaction.attributes.roundUp
              const totalAmount = amount + (roundUp ? roundUp?.amount.valueInBaseUnits : 0);
              const amountDisplay = `${neg ? '-' : ''}$${(Math.abs(totalAmount / 100)).toFixed(2)}`

              let newDayElem = <></>
              if (newDay) {
                newDayElem = (
                  <div class="card bg-slate-800 w-80 h-12">
                    <div class="flex h-full justify-center items-center align-bottom">
                      <span>{`${dayWeekMap[createDate.getDay()]}, ${createDate.toLocaleDateString()}`}</span>
                    </div>
                  </div>
                )
              }

              return (
                <>
                  {newDayElem}
                  <div class="card w-96 bg-slate-900 drop-shadow-lg">
                    <div class="card-body">
                      <div class="flex justify-between">
                        <div class="flex flex-col">
                          <span>{transaction.attributes.description}</span>
                          <span class="text-xs">{transaction.attributes.message}</span>
                        </div>
                        <div class="flex flex-col">
                          <span class={`${neg ? "text-red-400" : "text-green-400"}`}>{amountDisplay}</span>
                          <span class="text-xs">{createDate.toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )
            }}
          </For>
        </div>
      </Show>
    </div>
  )
}





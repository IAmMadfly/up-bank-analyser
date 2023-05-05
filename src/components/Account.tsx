import { useParams } from "@solidjs/router";
import { Component, For, Show, createEffect } from "solid-js";
import { State } from "../helper/signal";
import { AccountResource, ListTransactionsResponse, TagInputResourceIdentifier, TagResource, TransactionResource } from "up-bank-api";
import { HiOutlineArrowCircleUp } from 'solid-icons/hi'
import { useClient } from "../controller";
import { LoadingIcon } from "./LoadingIcon";
import { NavBar } from "./NavBar";

const dayWeekMap = {
  0: "Mon",
  1: "Tue",
  2: "Wed",
  3: "Thu",
  4: "Fri",
  5: "Sat",
  6: "Sun"
}

const categoryIdToName: { [key: string]: string } = {
  "home-maintenance-and-improvements": "Maintenance & Improvements",
  "health-and-medical": "Health",
  "internet": "Internet",
  "car-insurance-and-maintenance": "Car Stuff",
  "fuel": "Fuel",
  "tv-and-music": "TV & Music",
  "groceries": "Groceries",
  "utilities": "Utilities"
}

function differentDay(a: Date, b: Date) {
  if (
    a.getDate() != b.getDate() ||
    a.getMonth() != b.getMonth() ||
    a.getFullYear() != b.getFullYear()
  ) {
    return true
  }

  return false
}

export const Account: Component = () => {

  const accountId = useParams().id as string;

  const account = new State<AccountResource | null>(null);
  const transactions = new State<ListTransactionsResponse | null>(null);
  const transactionData = new State<Array<TransactionResource>>(new Array());
  const loadingMore = new State(false);

  createEffect(() => {
    useClient((client) => {
      client.accounts.retrieve(accountId).then(accountRes => {
        account.state = accountRes.data
      })

      client.transactions.listByAccount(accountId).then(transactionsRes => {
        transactions.state = transactionsRes
        transactionData.state = transactionsRes.data
      })
    })
  })

  async function removeTag(transaction: TransactionResource, tag: TagInputResourceIdentifier) {
    useClient((client) => {
      client.tags.removeTagsFromTransaction(transaction.id, [tag])
        .catch((err) => {
          console.error(`Failed to remove tag. Error:`, err);
        })
    })
  }

  async function loadMore() {
    if (loadingMore.state) {
      console.warn(`Already loading more. Cannot request again`);
      return;
    }
    useClient((client) => {
      loadingMore.state = true;
      const nextLink = transactions.state?.links.next;
      if (!nextLink) {
        throw new Error("Next not available");
      }
      nextLink().then((transactionsRes) => {
        transactions.state = transactionsRes;
        transactionData.state = [...transactionData.state, ...transactionsRes.data]
      }).finally(() => { loadingMore.state = false })
    })
  }

  return (
    <>
      <NavBar />
      <div class="flex flex-col items-center mt-2">
        <Show when={account.state !== null} fallback={<div>loading...</div>}>
          <div class="card flex flex-col w-96 bg-slate-700 mb-2">
            <div class="card-title justify-center">
              <h3 class="text-2xl">{account.state?.attributes.displayName} - ${account.state?.attributes.balance.value}</h3>
            </div>
            <div class="card-body">
              <h4>{account.state ? new Date(account.state?.attributes.createdAt).toDateString() : ""}</h4>
            </div>
          </div>
          <div class="flex flex-col items-center space-y-4">
            <For each={transactionData.state} fallback={<div class="animation-spin">Loading</div>}>
              {(transaction, index) => {
                const prevDateString = transactions.state!.data[index() - 1]?.attributes.createdAt
                const prevDate = prevDateString ? new Date(prevDateString) : undefined
                const createDate = new Date(transaction.attributes.createdAt);
                const settleDate = transaction.attributes.settledAt ? new Date(transaction.attributes.settledAt) : undefined;
                const newDay = prevDate ? differentDay(createDate, prevDate) : true;

                const neg = transaction.attributes.amount.valueInBaseUnits < 0;
                const amount = transaction.attributes.amount.valueInBaseUnits;
                const roundUp = transaction.attributes.roundUp
                const totalAmount = amount + (roundUp ? roundUp?.amount.valueInBaseUnits : 0);
                const amountDisplay = `${neg ? '-' : ''}$${(Math.abs(totalAmount / 100)).toFixed(2)}`;

                const categoryName = transaction.relationships.category.data?.id ?
                  (categoryIdToName[transaction.relationships.category.data.id] ?? transaction.relationships.category.data.id) :
                  "N/A"

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
                    <div class="card bg-slate-900 drop-shadow-lg">
                      <div class="card-body w-96">
                        <div class="flex justify-between">
                          <div class="flex flex-col">
                            <span class="text-sm">{transaction.attributes.description}</span>
                            <span class="text-xs">{transaction.attributes.message}</span>
                          </div>
                          <div class="flex flex-col items-end">
                            <div class="flex flex-row items-center space-x-1">
                              <Show when={transaction.attributes.roundUp}>
                                <div class="tooltip" data-tip={`$${Math.abs(roundUp ? parseFloat(roundUp.amount.value) : NaN).toFixed(2)}`}>
                                  <HiOutlineArrowCircleUp color="red" />
                                </div>
                              </Show>
                              <span class={`${neg ? "text-red-400" : "text-green-400"} text-right`}>{amountDisplay}</span>
                            </div>
                            <Show when={transaction.relationships.category.data != null}>
                              <div class="flex justify-end">
                                <span class="text-xs">{categoryName}</span>
                              </div>
                            </Show>
                            <div class="badge tooltip tooltip-bottom flex justify-end" data-tip={settleDate ? `Settled: ${settleDate.toLocaleString()}` : "Held"}>
                              <span class="text-xs whitespace-nowrap">{`${createDate.toLocaleTimeString()}`}</span>
                            </div>
                          </div>
                        </div>
                        <div class="space-x-1">
                          <For each={transaction.relationships.tags.data}>
                            {(tag, index) => {
                              return (
                                <div class="badge badge-info hover:badge-error" onClick={() => {
                                  removeTag(transaction, tag);
                                  transaction.relationships.tags.data = transaction.relationships.tags.data.filter((_, i) => index() != i);
                                }}>
                                  <span class="text-xs">{tag.id}</span>
                                </div>
                              )
                            }}
                          </For>
                          <div class="btn btn-xs btn-outline btn-accent btn-circle">
                            <span>+</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )
              }}
            </For>
            <Show when={transactionData.state.length > 0}>
              <div class="btn" onClick={loadMore} >
                <span class={loadingMore.state ? "mr-2" : ""}>Load More</span>
                <Show when={loadingMore.state}>
                  <LoadingIcon />
                </Show>
              </div>
            </Show>
          </div>
        </Show>
      </div>
    </>
  )
}





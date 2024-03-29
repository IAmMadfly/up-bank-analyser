import { useParams } from "@solidjs/router";
import { Component, For, Show } from "solid-js";
import { State } from "../helper/signal";
import { AccountResource, ListTransactionsResponse, TagInputResourceIdentifier, TransactionResource } from "up-bank-api";
import { useApi, useClient } from "../controller";
import { NavBar } from "../components/NavBar";
import { Transaction } from "../components/Transaction"
import { LoadMoreButton } from "../components/LoadMoreButton";

const dayWeekMap = {
  0: "Mon",
  1: "Tue",
  2: "Wed",
  3: "Thu",
  4: "Fri",
  5: "Sat",
  6: "Sun"
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

  useApi(client => {
    client.accounts.retrieve(accountId).then(accountRes => {
      account.state = accountRes.data
    })

    client.transactions.listByAccount(accountId).then(transactionsRes => {
      transactions.state = transactionsRes
      transactionData.state = transactionsRes.data
    })
  });

  async function removeTag(transaction: TransactionResource, tag: TagInputResourceIdentifier) {
    return new Promise((resolve, reject) => {
      useClient((client) => {
        client.tags.removeTagsFromTransaction(transaction.id, [tag])
          .then(res => {
            resolve(res)
          })
          .catch((err) => {
            console.error(`Failed to remove tag. Error:`, err);
            reject(err);
          })
      })
    })
  }

  async function addTag(transaction: TransactionResource, tagName: string) {
    return new Promise((resolve, reject) => {
      useClient((client) => {
        client.tags.addTagsToTransaction(transaction.id, [{ id: tagName, type: "tags" }])
          .then(res => resolve(res))
          .catch(err => reject(err))
      })
    });
  }

  async function loadMore() {
    if (loadingMore.state) {
      console.warn(`Already loading more. Cannot request again`);
      return;
    }

    loadingMore.state = true;
    const nextLink = transactions.state?.links.next;
    if (!nextLink) {
      throw new Error("Next not available");
    }
    nextLink().then((transactionsRes) => {
      transactions.state = transactionsRes;
      transactionData.state = [...transactionData.state, ...transactionsRes.data]
    }).finally(() => { loadingMore.state = false })
  }

  return (
    <>
      <div class="h-screen">
        <NavBar />
        <div class="flex flex-col items-center mt-2 grow overflow-y-scroll">
          <Show when={account.state !== null} fallback={<div>loading...</div>}>
            {/* The Transations */}
            <div class="flex flex-col grow shrink">
              <div class="col-span-1">
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
                      const newDay = prevDate ? differentDay(createDate, prevDate) : true;

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
                          <Transaction transactionData={transaction} removeTag={removeTag} addTag={addTag} />
                        </>
                      )
                    }}
                  </For>
                  <div class="flex justify-center">
                    <LoadMoreButton loading={loadingMore} loadMoreHandler={loadMore} />
                  </div>
                </div>
              </div>
            </div>
          </Show>
        </div>
      </div>
    </>
  )
}


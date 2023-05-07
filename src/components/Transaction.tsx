import { HiOutlineArrowCircleUp } from "solid-icons/hi";
import { Component, For, Show, createSignal } from "solid-js";
import { TransactionResource, TagInputResourceIdentifier } from "up-bank-api";


const categoryIdToName: { [key: string]: string } = {
  "home-maintenance-and-improvements": "Maintenance & Improvements",
  "health-and-medical": "Health",
  "internet": "Internet",
  "car-insurance-and-maintenance": "Car Stuff",
  "fuel": "Fuel",
  "tv-and-music": "TV & Music",
  "groceries": "Groceries",
  "utilities": "Utilities",
  "restaurants-and-cafes": "Restaurants & Cafes",
  "holidays-and-travel": "Holidays & Travel"
}


class TransactionData {


  constructor(data: TransactionResource) {
    this.setData(data);
  }

  setData(data: TransactionResource) {

  }
}


export const Transaction: Component<{
  transactionData: TransactionResource,
  removeTag?: (transaction: TransactionResource, tag: TagInputResourceIdentifier) => Promise<void>,
  addTag?: (transaction: TransactionResource, tag: TagInputResourceIdentifier) => Promise<void>
}> = ({ transactionData, removeTag, addTag }) => {
  const [transaction, setTransaction] = createSignal(transactionData);
  const createDate = new Date(transaction().attributes.createdAt);
  const settleDate = transaction().attributes.settledAt ? new Date(transaction().attributes.settledAt) : undefined;

  const neg = transaction().attributes.amount.valueInBaseUnits < 0;
  const amount = transaction().attributes.amount.valueInBaseUnits;
  const roundUp = transaction().attributes.roundUp
  const totalAmount = amount + (roundUp ? roundUp?.amount.valueInBaseUnits : 0);
  const amountDisplay = `${neg ? '-' : ''}$${(Math.abs(totalAmount / 100)).toFixed(2)}`;

  const categoryName = transaction().relationships.category.data?.id ?
    (categoryIdToName[transaction().relationships.category.data!.id] ?? transaction().relationships.category.data!.id) :
    "N/A"

  function removeTagHandler(tag: TagInputResourceIdentifier, index: number) {
    if (removeTag) {
      removeTag(transaction(), tag);
      const newTransaction = transaction();
      newTransaction.relationships.tags.data = transaction().relationships.tags.data.filter((_, i) => index != i);
      setTransaction(newTransaction);
    }
  }

  return (
    <div class="card bg-slate-900 drop-shadow-lg">
      <div class="card-body w-96">
        <div class="flex justify-between">
          <div class="flex flex-col">
            <span class="text-sm">{transaction().attributes.description}</span>
            <span class="text-xs">{transaction().attributes.message}</span>
          </div>
          <div class="flex flex-col items-end">
            <div class="flex flex-row items-center space-x-1">
              <Show when={transaction().attributes.roundUp}>
                <div class="tooltip" data-tip={`$${Math.abs(roundUp ? parseFloat(roundUp.amount.value) : NaN).toFixed(2)}`}>
                  <HiOutlineArrowCircleUp color="red" />
                </div>
              </Show>
              <span class={`${neg ? "text-red-400" : "text-green-400"} text-right`}>{amountDisplay}</span>
            </div>
            <Show when={transaction().relationships.category.data != null}>
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
          <For each={transaction().relationships.tags.data}>
            {(tag, index) => {
              return (
                <div class="badge badge-info hover:badge-error" onClick={() => { removeTagHandler(tag, index()) }}>
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
  )
}


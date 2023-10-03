import { HiOutlineArrowCircleUp } from "solid-icons/hi";
import { Component, For, JSX, Show, createEffect, createSignal } from "solid-js";
import { createStore } from "solid-js/store"
import { TransactionResource, TagInputResourceIdentifier } from "up-bank-api";
import { State } from "../helper/signal";
import { useClient } from "../controller";


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
  "holidays-and-travel": "Holidays & Travel",
  "takeaway": "Takeaway",
  "technology": "Technology",
  "homeware-and-appliances": "Home & Appliances",
  "games-and-software": "Games & Software",
  "public-transport": "Public Transport",
  "booze": "Booze",
  "pubs-and-bars": "Pubs & Bars",
  "hair-and-beauty": "Hair & Beauty"
}

export const Transaction: Component<{
  transactionData: TransactionResource,
  removeTag?: (transaction: TransactionResource, tag: TagInputResourceIdentifier) => Promise<any>,
  addTag?: (transaction: TransactionResource, tag: string) => Promise<any>
}> = ({ transactionData, removeTag, addTag }) => {
  let buttonRef: HTMLInputElement | undefined = undefined;
  const creatingTag = new State(false);
  const allTags = new State(new Array<string>());
  const [transaction, setTransaction] = createStore(transactionData);
  const createDate = new Date(transaction.attributes.createdAt);
  const settleDate = transaction.attributes.settledAt ? new Date(transaction.attributes.settledAt) : undefined;

  const neg = transaction.attributes.amount.valueInBaseUnits < 0;
  const amount = transaction.attributes.amount.valueInBaseUnits;
  const roundUp = transaction.attributes.roundUp
  const totalAmount = amount + (roundUp ? roundUp?.amount.valueInBaseUnits : 0);
  const amountDisplay = `${neg ? '-' : ''}$${(Math.abs(totalAmount / 100)).toFixed(2)}`;
  const timeDisplay = `${createDate.getHours() % 12}:${createDate.getMinutes().toString().padStart(2, '0')}`

  const categoryName = transaction.relationships.category.data?.id ?
    (categoryIdToName[transaction.relationships.category.data!.id] ?? transaction.relationships.category.data!.id) :
    "N/A"

  createEffect(() => {
    if (creatingTag.state) {
      getTags();
    }
  })

  function removeTagHandler(unwantedTag: TagInputResourceIdentifier) {
    if (removeTag) {
      removeTag(transaction, unwantedTag).then(() => {
        setTransaction("relationships", "tags", "data", (d) => d.filter((t) => t.id !== unwantedTag.id));
      })
    }
  }

  function addTagHandler(tagName: string) {
    if (addTag) {
      addTag(transaction, tagName).then(() => {
        setTransaction("relationships", "tags", "data", d => [...d, { type: "tags" as "tags", id: tagName }]);
      });
    }
  }

  function startCreateTag() {
    creatingTag.state = true;
    if (buttonRef) {
      buttonRef.focus()
    }
  }

  function getTags() {
    useClient(async (client) => {
      const tags = await client.tags.list();

      allTags.state = tags.data.map(tag => tag.id);
    })
  }

  const handleTagInput: JSX.ChangeEventHandlerUnion<HTMLInputElement, Event> = (ev) => {
    const newTagName = ev.currentTarget.value.trim();
    addTagHandler(newTagName);
    creatingTag.state = false;
  }

  const createTagButton = (
    <div class="btn btn-xs btn-outline btn-accent btn-circle" onClick={() => { startCreateTag() }}>
      <span>+</span>
    </div>
  )

  return (
    <div class="card card-compact bg-slate-900 drop-shadow-lg">
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
              <span class="text-xs whitespace-nowrap">{timeDisplay}</span>
            </div>
          </div>
        </div>
        <div class="space-x-1">
          <For each={transaction.relationships.tags.data}>
            {(tag) => {
              return (
                <div class="badge badge-info cursor-pointer hover:badge-error" onClick={() => { removeTagHandler(tag) }}>
                  <span class="text-xs">{tag.id}</span>
                </div>
              )
            }}
          </For>
          <Show when={creatingTag.state} fallback={createTagButton}>
            <div>
              <input ref={buttonRef}
                onBlur={() => { creatingTag.state = false }}
                onChange={(ev) => handleTagInput(ev)}
                class="input input-sm" type="text" placeholder="Tag name" list="tagList" />
              <datalist id="tagList">
                <For each={allTags.state}>
                  {(tagName) => {

                    return (
                      <option value={tagName} />
                    )
                  }}
                </For>
              </datalist>
            </div>
          </Show>
        </div>
      </div>
    </div>
  )
}


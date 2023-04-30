import { Component, For, createEffect, onMount } from "solid-js";
import { State } from "../helper/signal";
import { useClient } from "../controller";
import { useNavigate } from "@solidjs/router";
import { AccountResource } from "up-bank-api";

export const Accounts: Component = () => {

  const navigate = useNavigate();
  const accountsState = new State(new Array<AccountResource>());

  createEffect(() => {
    useClient((client) => {
      client.accounts.list().then(accounts => {
        accountsState.state = accounts.data
      })
    })
  })

  return (
    <div class="flex flex-col justify-center w-98">
      <h2 class="text-center text-lg font-bold">Accounts</h2>
      <div class="flex flex-col gap-y-2">
        <For each={accountsState.state}>
          {
            (account) =>
              <div class="flex flex-row justify-between">
                <div class="btn btn-sm flex w-full justify-between" onClick={() => navigate(`/account/${account.id}`)}>
                  <span>{`${account.attributes.displayName}`}</span>
                  <span class="">{`${account.attributes.balance.value}`}</span>
                </div>
              </div>
          }
        </For>
      </div>
    </div>
  )
}


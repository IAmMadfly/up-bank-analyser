import { Component, For, createEffect, onMount } from "solid-js";
import { State } from "../helper/signal";
import { useClient } from "../controller";
import { useNavigate } from "@solidjs/router";
import { AccountResource, AccountTypeEnum } from "up-bank-api";
import { NavBar } from "../components/NavBar";


const accountTypeMap = new Map<AccountTypeEnum, number>();
accountTypeMap.set(AccountTypeEnum.transactional, 0);
accountTypeMap.set(AccountTypeEnum.saver, 1);

export const Accounts: Component = () => {

  const navigate = useNavigate();
  const accountsState = new State(new Array<AccountResource>());

  createEffect(() => {
    useClient((client) => {
      client.accounts.list().then(accounts => {
        accounts.data.sort((a, b) => b.attributes.balance.valueInBaseUnits - a.attributes.balance.valueInBaseUnits);
        accounts.data.sort((a, b) => (accountTypeMap.get(a.attributes.accountType) ?? 0) - (accountTypeMap.get(b.attributes.accountType) ?? 0))
        accountsState.state = accounts.data
      })
    })
  })

  return (
    <>
      <NavBar />
      <div class="flex flex-col justify-center w-98">
        <h2 class="text-center text-lg font-bold">Accounts</h2>
        <div class="flex flex-col gap-y-2 items-center">
          <For each={accountsState.state}>
            {
              (account) =>
                <div class="flex flex-row justify-between w-96">
                  <div class="btn btn-sm flex w-full justify-between" onClick={() => navigate(`/account/${account.id}`)}>
                    <span>{`${account.attributes.displayName}`}</span>
                    <span class="">{`${account.attributes.balance.value}`}</span>
                  </div>
                </div>
            }
          </For>
        </div>
      </div>
    </>
  )
}


import { Component, createSignal } from "solid-js";
import { State } from "../helper/signal";
import { Logo } from "../components/Logo";
import { useNavigate } from "@solidjs/router";
import { useApi, setClient } from "../controller";


export const TokenInput: Component = () => {

  const navigate = useNavigate();
  const [key, setKey] = createSignal("");

  useApi((_api) => {
    navigate("accounts")
  })

  function submitApiKey() {
    setClient(key())
  }

  return (
    <div class="flex flex-row w-full">
      <Logo />
      <div class="flex flex-col items-center w-full">
        <div class="flex flex-col items-center">
          <span>Please enter your Up Bank API key:</span>
          <input onChange={(e) => setKey(e.currentTarget.value)} type="text" placeholder="API Key" class="input input-bordered w-full max-w-sm" />
          <button class="btn m-2" onClick={() => submitApiKey()}>Ok</button>
        </div>
      </div>
    </div>
  )
}


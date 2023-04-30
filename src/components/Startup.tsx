import { Component, Show, createSignal } from "solid-js";
import { haveClient, setClient } from "../controller";
import { State } from "../helper/signal";



export const StartUp: Component<{ clientHave: State<boolean> }> = ({ clientHave }) => {

  const [key, setKey] = createSignal("");
  const submitApiKey = () => {
    setClient(key()).then(() => {
      clientHave.state = haveClient();
    })
  }

  return (
    <div class="flex flex-col items-center">
      <span>Please enter your Up Bank API key:</span>
      <input onChange={(e) => setKey(e.currentTarget.value)} type="text" placeholder="API Key" class="input input-bordered w-full max-w-sm" />
      <button class="btn m-2" onClick={() => submitApiKey()}>Ok</button>
      <Show when={clientHave.state}>
        <span>SUCCESS</span>
      </Show>
    </div>
  )
}







import { Component, Show, createEffect } from "solid-js";
import { State } from "../helper/signal";
import { StartUp } from "../components/Startup";
import { Logo } from "../components/Logo";
import { useNavigate } from "@solidjs/router";




export const TokenInput: Component = () => {

  const navigate = useNavigate();

  const clientHave = new State(false);

  createEffect(() => {
    const haveClient = clientHave.state
    if (haveClient) {
      navigate('accounts')
    }
  })

  return (
    <div class="flex flex-row w-full">
      <Logo />
      <div class="flex flex-col items-center w-full">
        <StartUp clientHave={clientHave} />
      </div>
    </div>
  )
}


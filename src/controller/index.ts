import { createEffect, createRoot } from "solid-js";
import { UpApi } from "up-bank-api";
import { State } from "../helper/signal";

const UP_TOKEN_KEY = "UP_TOKEN";

function createClient(): State<UpApi | null> {
  const upClientState = new State<UpApi | null>(null);

  return upClientState;
}

export async function setClient(token: string) {
  const newClient = new UpApi(token);

  const res = await newClient.util.ping().catch((err) => {
    console.error(`Token invalid!`);
  });

  if (res) {
    client.state = newClient;
    localStorage.setItem(UP_TOKEN_KEY, token);
    return true;
  }
  return false;
}

export function useClient(func: (api: UpApi) => void) {
  if (!client.state) {
    console.warn(`No client available`);
    return;
  }

  func(client.state);
}

export function useApi(fn: (api: UpApi) => void) {
  createEffect(() => {
    useClient((client) => {
      fn(client);
    });
  });
}

export const client = createRoot(createClient);

// check if there is a local key, then set the client if there is
const prevToken = localStorage.getItem(UP_TOKEN_KEY);
if (prevToken) {
  const api = new UpApi(prevToken);

  api.util.ping().then(() => {
    client.state = api;
    console.log("Found key!");
  });
}

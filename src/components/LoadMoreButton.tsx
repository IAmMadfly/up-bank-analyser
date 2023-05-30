import { Component, Show } from "solid-js";
import { State } from "../helper/signal";




export const LoadMoreButton: Component<{ loading: State<boolean>, loadMoreHandler: () => void }> = ({ loading, loadMoreHandler }) => {


  return (
    <Show when={!loading.state} fallback={<span>Loading</span>}>
      <button class="btn" onClick={() => loadMoreHandler()}>
        Load more
      </button>
    </Show>
  )
}



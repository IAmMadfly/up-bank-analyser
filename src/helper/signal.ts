import { Accessor, Setter, SignalOptions, createSignal } from "solid-js";

export class State<T> {
  private _signal: Accessor<T>;
  private _setSignal: Setter<T>;

  constructor(initState: T, options?: SignalOptions<T>) {
    const [signal, setSignal] = createSignal(initState, options);

    this._signal = signal;
    this._setSignal = setSignal;
  }

  set state(value: T) {
    this._setSignal(value as any);
  }

  get state(): T {
    return this._signal();
  }
}

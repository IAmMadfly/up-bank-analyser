import { Component, createSignal } from "solid-js";

import logo_1 from "../assets/up_bank_logo_1.png"
import logo_2 from "../assets/up_bank_logo_2.png"


export const Logo: Component = () => {

  const [imageState, setImageState] = createSignal(logo_1);
  const interval = setInterval(() => {
    const newImage = imageState() == logo_1 ? logo_2 : logo_1;
    setImageState(newImage);
  }, 500)

  return (
    <div class="h-12 w-12 flex justify-center items-center">
      <img class="h-10 w-10" src={imageState()}></img>
    </div>
  )
}



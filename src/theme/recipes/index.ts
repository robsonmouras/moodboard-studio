import { spinner } from "./spinner";
import { absoluteCenter } from "./absolute-center";
import { group } from "./group";
import { button } from "./button";
import { menu } from "./menu";

export const recipes = {
  button,
  group,
  absoluteCenter,
  spinner,
};

// `menu` (Park UI / Ark UI) é slot recipe — parts: trigger, content, item, separator…
export const slotRecipes = {
  menu,
};

import { Gdk } from "astal";

/*
 * 		value must between 0 and 1
 * @param {number} value
 */

export const winheight = (value: number) => {
  const screenHeight = Gdk.Screen.get_default()?.get_height()!;
  const winheight = screenHeight * value;
  return winheight;
};

export const winwidth = (value: number) => {
  const screenWidth = Gdk.Screen.get_default()?.get_width()!;
  const winwidth = screenWidth * value;
  return winwidth;
};

/* replaced "WIDGET" with Gtk widget name */

import { Astal, Widget, Gtk, Gdk } from "astal";

export type [WIDGET]Props = Widget.ConstructProps<Gtk.[WIDGET], Gtk.[WIDGET].ConstructorProps>;

export const [WIDGET] = Widget.astalify<typeof Gtk.[WIDGET], [WIDGET]Props, "[WIDGET]">(Gtk.[WIDGET]);
export type [WIDGET] = ReturnType<typeof [WIDGET]>;

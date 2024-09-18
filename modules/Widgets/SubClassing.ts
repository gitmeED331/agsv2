import { Widget, Gtk } from "astal"

const Switch = Widget.subclass(Gtk.Switch, "AgsSwitch");
const TextView = Widget.subclass(Gtk.TextView, "AgsTextView");
const ComboBoxText = Widget.subclass(Gtk.ComboBoxText, "AgsComboBoxText");
const ComboBox = Widget.subclass(Gtk.ComboBox, "AgsComboBox");

export {
  Switch,
  TextView,
  ComboBox,
  ComboBoxText,
};

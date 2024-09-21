import { App, Widget, Utils } from "imports";
import SearchBox from "./search";
import RoundedCorner from "lib/roundedCorner";
import Categories from "./categories";
import HyprlandBox from "./hyprlands";
import StackState from "./stackState";
import icons from "lib/icons";
import { winwidth } from "lib/screensizeadjust";

const { Box, Button, Label, Icon } = Widget;
const { timeout, exec } = Utils;
const LauncherState = new StackState("Search");

/**
 * @param {string} item
 */
const StackSwitcherButton = (item) =>
  Button({
    class_name: "launcher-switcher-button",
    tooltip_text: item,
    child: Icon(icons.launcher[item.toLowerCase()] || "image-missing"),
    on_clicked: () => (LauncherState.value = item),
  }).hook(LauncherState, (button) => {
    button.toggleClassName("focused", LauncherState.value == item);
    const focusedID = LauncherState.items.indexOf(LauncherState.value);
    button.toggleClassName(
      "before-focused",
      LauncherState.items[focusedID - 1] == item,
    );
    button.toggleClassName(
      "after-focused",
      LauncherState.items[focusedID + 1] == item,
    );
  });

/**
 * @param {boolean} start
 */
const StackSwitcherPadding = (start) =>
  Box({
    class_name: "launcher-switcher-button",
    vexpand: true,
    children: [Icon()],
  }).hook(LauncherState, (box) => {
    const focusedID = LauncherState.items.indexOf(LauncherState.value);
    box.toggleClassName("before-focused", start && focusedID === 0);
    box.toggleClassName(
      "after-focused",
      !start && focusedID === LauncherState.items.length - 1,
    );
  });
/**
 * @param {string[]} items
 */
const StackSwitcher = (items) =>
  Box({
    vertical: true,
    class_name: "launcher-switcher",
    children: [
      StackSwitcherPadding(true),
      ...items.map((i) => StackSwitcherButton(i)),
      StackSwitcherPadding(false),
    ],
  });

const LauncherStack = () => {
  const children = {
    Search: SearchBox(LauncherState),
    ...Categories(),
    Hyprland: HyprlandBox(LauncherState),
  };
  const stack = Widget.Stack({
    visible_child_name: LauncherState.bind(),
    transition: "over_right",
    class_name: "launcher",
    css: `
      min-width: ${winwidth(0.25)}px;
    `,

    children,
  });
  return stack;
};

function toggle(value) {
  const current = LauncherState.value;
  if (current == value && App.getWindow("launcher").visible)
    App.closeWindow("launcher");
  else {
    App.openWindow("launcher");
    LauncherState.value = value;
  }
}

globalThis.toggleLauncher = () => toggle("Search");
globalThis.toggleHyprlandSwitcher = () => toggle("Hyprland");

/*
 * @param {number} value
 */
export default () => {
  const stack = LauncherStack();
  LauncherState.items = Object.keys(stack.children);
  const stackSwitcher = StackSwitcher(Object.keys(stack.children));
  const window = Widget.Window({
    keymode: "on-demand",
    visible: false,
    anchor: ["left", "top", "bottom"],
    name: "launcher",
    className: "launcher-window",
    child: Box({
      css: "padding-right: 2px",
      children: [
        Widget.Revealer({
          reveal_child: false,
          transition: "crossfade",
          transition_duration: 350,
          child: stackSwitcher,
        }).hook(App, (revealer, name, visible) => {
          if (name === "launcher") {
            if (visible) revealer.reveal_child = visible;
            else timeout(100, () => (revealer.reveal_child = visible));
          }
        }),
        Box({
          children: [
            Widget.Overlay({
              child: Box({
                children: [
                  Widget.Revealer({
                    reveal_child: false,
                    child: stack,
                    transition_duration: 350,
                    transition: "crossfade",
                  }).hook(App, (revealer, name, visible) => {
                    if (name === "launcher") {
                      if (visible)
                        timeout(100, () => (revealer.reveal_child = visible));
                      else revealer.reveal_child = visible;
                    }
                  }),
                  Box({ css: "min-width: 1rem" }),
                ],
              }),
              overlays: [
                RoundedCorner("topleft", { class_name: "corner" }),
                RoundedCorner("bottomleft", { class_name: "corner" }),
              ],
            }),
          ],
        }),
      ],
    }),
  });
  const mods = ["MOD1", "MOD2"];
  window.keybind("Escape", () => App.closeWindow("launcher"));
  window.keybind(mods, "Tab", () => LauncherState.next());
  for (let i = 0; i < 10; i++) {
    window.keybind(mods, `${i}`, () => LauncherState.setIndex(i));
    window.keybind(mods, `KP_${i}`, () => LauncherState.setIndex(i));
  }
  return window;
};

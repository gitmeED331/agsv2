import { App, Widget, Astal, Gdk, Gtk, execAsync } from "astal";
import SearchBox from "./search";
import Categories from "./categories";
import HyprlandBox from "./hyprlands";
import StackState from "./stackState";
import Icon, { Icons } from "../../lib/icons";
import { winwidth } from "../../lib/screensizeadjust";

const LauncherState = new StackState("Search");

/**
 * @param {string} item
 */
const StackSwitcherButton = (item) => {
  <button
    className={"launcher-switcher-button"}
    tooltip_text={item}
    on_clicked={() => (LauncherState.value = item).hook(LauncherState, (button) => {
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
    })}
  >
    <icon icon={Icon.launcher[item.toLowerCase()] || "image-missing"} />
    < /button>
}

/**
 * @param {boolean} start
    */
const StackSwitcherPadding = (start) => {
      <box
        className={"launcher-switcher-button"}
        vexpand={true}
      >
        [Icon()]
      .hook(LauncherState, (box) => {
        const focusedID = LauncherState.items.indexOf(LauncherState.value);
        box.toggleClassName("before-focused", start && focusedID === 0);
        box.toggleClassName(
        "after-focused",
        !start && focusedID === LauncherState.items.length - 1,
        )
      })
        < /button>
}
/**
 * @param {string[]} items
        */
const StackSwitcher = (items) => {
          <box
            vertical={true}
            className={"launcher-switcher"}
          >
            {StackSwitcherPadding(true)}
            {...items.map((i) => StackSwitcherButton(i))}
            {StackSwitcherPadding(false)}
          </box>
        }

const LauncherStack = () => {
  const children = {
          Search: SearchBox(LauncherState),
        ...Categories(),
        Hyprland: HyprlandBox(LauncherState),
  };
        const stack = {
          < stack
            visible_child_name={bind(LauncherState)}
            transitionType={Gtk.RevealerTransitionType.SLIDE_RIGHT}
            className={"launcher"}
            css:={`
      min-width: ${winwidth(0.25)}px;
    `}
          >
            {...children}
            < /stack>
            return stack;
};

            function toggle(value) {
  const current = LauncherState.value;
            if (current == value && App.get_window("launcher").visible)
            App.close_window("launcher");
            else {
              App.open_window("launcher");
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

            const window = (
            <window
              name={"launcher"}
              className={"launcher-window"}
              anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.TOP}
              layer={Astal.Layer.OVERLAY}
              exclusivity={Astal.Exclusivity.NORMAL}
              keymode={Astal.Keymode.EXCLUSIVE}
              visible={false}
              application={App}
            >
              <box
                css={"padding-right: 2px"}
              >
                <revealer
                  reveal_child={false}
                  transitionType={Gtk.RevealerTransitionType.CROSSFADE}
                  transition_duration={350}
                >
                  <stackSwitcher />
      .hook(App, (revealer, name, visible) => {
        if (name === "launcher") {
          if (visible) revealer.reveal_child = visible;
          else timeout(100, () => (revealer.reveal_child = visible));
        }
      }),
                  {stack}
                  < /revealer>
                  < /box>
                  < /window>
                  )
  window.keybind("Escape", () => App.closeWindow("launcher"));
  window.keybind(mods, "Tab", () => LauncherState.next());
                  for (let i = 0; i < 10; i++) {
                    window.keybind(mods, `${i}`, () => LauncherState.setIndex(i));
                  window.keybind(mods, `KP_${i}`, () => LauncherState.setIndex(i));
  }

                  return window;
};

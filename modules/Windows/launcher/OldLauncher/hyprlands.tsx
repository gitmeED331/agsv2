import { App, Astal, Widget, Gtk, Gdk } from "astal"
import { Fzf } from "../../../node_modules/fzf/dist/fzf.es.js"
import Icon, { Icons } from "../../lib/icons.js"
import AstalHyprland from "gi://AstalHyprland"
import Pango from "gi://Pango"

const Hyprland = AstalHyprland.get_default()

/**i
 * @typedef {import('node_modules/fzf/dist/types/main').Fzf<import('types/widgets/button.js').default[]>} FzfAppButton
 * @typedef {import('node_modules/fzf/dist/types/main').FzfResultItem<import('types/widgets/button.js').default>}
 * FzfResultAppButton
 */

/**
 * @param {import('types/service/hyprland.js').Client} app
 */
export const AppIcon = app => (
  <icon
    className={"app-icon"}
    icon={Icons(app.class)}
  />
)

/**
 * @param {import('types/service/hyprland.js').Client} app
 */
const AppButton = app => (
  <button
    className={"app-button"}
    on_clicked={() => {
      Hyprland.messageAsync(`dispatch focuswindow address:${app.address}`)
        .catch(logError)
      App.toggle_window("launcher")
    }}
    // attribute={"app": app}
    tooltip_text={app.title}
  >
    <box>
      {AppIcon(app)}
      <box
        vertical={true}
      >
        <label
          class_name={"app-name"}
          xalign={0}
          max_width_chars={28}
          ellipsize={Pango.EllipsizeMode.END}
          use_markup={true}
          label={app.title}
        />
        <label
          className={"app-description"}
          xalign={0}
          max_width_chars={40}
          ellipsize={Pango.EllipsizeMode.END}
          use_markup={true}
          label={app.class}
        />
      </box>
    </box>
  </button >
)

  .on("focus-in-event", (self) => {
    self.toggleClassName("focused", true);
  })
  .on("focus-out-event", (self) => {
    self.toggleClassName("focused", false);
  });

/**
 * @type FzfAppButton
 */
let fzf;

/**
 * @param {string} text
    * @param {import('types/widgets/box').default} results
    */
function searchApps(text, results) {
  results.children.forEach(c => results.remove(c));
  const fzfResults = fzf.find(text);
  const context = results.get_style_context();
  const color = context.get_color(Gtk.StateFlags.NORMAL);
  const hexcolor = "#" + (color.red * 0xff).toString(16).padStart(2, "0")
    + (color.green * 0xff).toString(16).padStart(2, "0")
    + (color.blue * 0xff).toString(16).padStart(2, "0");
  fzfResults.forEach(entry => {
    const classChars = entry.item.attribute.app.class.normalize().split("");
    // @ts-ignore
    entry.item.child.children[1].children[1].label = classChars.map(/** @param {string} char, @param {number} i*/(char, i) => {
      if (entry.positions.has(i))
        return `<span foreground="${hexcolor}">${char}</span>`;
      else
        return char;
    }).join("");
    const titleChars = entry.item.attribute.app.title.normalize().split("");
    // @ts-ignore
    entry.item.child.children[1].children[0].label = titleChars.map(/** @param {string} char, @param {number} i*/(char, i) => {
      if (entry.positions.has(classChars.length + i))
        return `<span foreground="${hexcolor}">${char}</span>`;
      else
        return char;
    }).join("");
  });
  results.children = fzfResults.map(e => e.item);
}

const SearchBox = (launcherState) => {
  const results = (
    <box
      className={"search-results"}
      vertical={true}
      vexpand={true}
    />
  )

  const entry = (
    <entry
      className={"search-entry"}
      placeholder_text={"search"
      } primary_icon_name={Icon.launcher.search}
    />
  ).on("notify::text", (entry) => searchApps(entry.text || "", results))
    .on("activate", () => {
      const address = results.children[0]?.attribute.app.address;
      if (address) Hyprland.messageAsync(`dispatch focuswindow address:${address}`)
        .catch(logError);
      App.toggle_window("launcher");
    })
    .hook(launcherState, () => {
      if (launcherState.value != "Hyprland") return;
      entry.text = "-";
      entry.text = "";
      entry.grab_focus();
    })
    .hook(App, (_, name, visible) => {
      if (name !== "launcher" || !visible) return;
      //explicityly destroy all Buttons to prevent errors
      fzf?.find("").map(e => e.item.destroy());
      fzf = new Fzf(Hyprland.clients.filter(client => client.title != "").map(AppButton), {
        /**
         * @param {import('types/widgets/box').default} item
         * @returns {string}
         */
        selector: (item) => item.attribute.app.class + item.attribute.app.title,
      });
      if (launcherState.value == "Hyprland") {
        entry.text = "-";
        entry.text = "";
        entry.grab_focus();
      }
    }
    )
  return (
    <box
      className={"launcher-search"}
      vertical={true}
    >
      {entry}
      <scrollable
        className={"search-scroll"}
      >
        {results}
      </scrollable>
    </box>
  )
}

export default SearchBox;


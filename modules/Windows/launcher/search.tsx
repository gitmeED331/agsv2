import { App, Widget, Gtk, Gdk, execAsync } from "astal"
import Fzf from "../../../../node_modules/fzf/dist/fzf.es.js"
import Icon, { Icons } from "../../lib/icons"\
import AstalHyprland from "gi://AstalHyprland"
import Pango from "gi://Pango"


const Hyprland = AstalHyprland.get_default()

/**
 * @typedef {import('node_modules/fzf/dist/types/main').Fzf<import('types/widgets/button').default[]>} FzfAppButton
 * @typedef {import('node_modules/fzf/dist/types/main').FzfResultItem<import('types/widgets/button').default>}
 * FzfResultAppButton
 */

/**
 * @param {import('types/service/applications.js').Application} app
 */
export const AppIcon = app => {
  // const icon = app.icon_name && lookUpIcon(app.icon_name)
  //   ? app.icon_name
  //   : "image-missing";

  return (
    <icon
      className={"app-icon"}
      icon={Icons(app.icon_name)}
    />
  )
};

/**
 * @param {import('types/service/applications.js').Application} app
 */
const AppButton = app => (
  <button
    className={"app-button"}
    onClick={() => {
      App.toggle_window("launcher");
      //app.launch();
      execAsync(`${app.executable}`).then(e => print(e)).catch(logError);
      app.frequency++;
    }}
    //attribute: { "app": app },
    tooltip_text={app.description}
  >
    <box>
      {AppIcon(app)}
      <box
        vertical={true}
      >
        <label
          className={"app-name"}
          xalign={0}
          max_width_chars={28}
          ellipsize={Pango.EllipsizeMode.END}
          use_markup={true}
          label={app.name}
        />

        <label
          className={"app-description"}
          xalign={0}
          max_width_chars={40}
          ellipsize={Pango.EllipsizeMode.END}
          use_markup={true}
          label={app.description}
        />

      </box>
    </box>
  </button >
).on("focus-in-event", (self) => {
  self.toggleClassName("focused", true);
})
  .on("focus-out-event", (self) => {
    self.toggleClassName("focused", false);
  });

/**
 * @type FzfAppButton
 */
const fzf = new Fzf(Applications.list.map(AppButton), {
  /**
   * @param {import('types/widgets/box').default} item
   * @returns {string}
   */
  selector: (item) => item.attribute.app.name,
  tiebreakers: [/** @param {FzfResultAppButton} a, @param {FzfResultAppButton} b*/(a, b) => b.item.attribute.app._frequency - a.item.attribute.app._frequency]
});

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
    const nameChars = entry.item.attribute.app.name.normalize().split("");
    // @ts-ignore
    entry.item.child.children[1].children[0].label = nameChars.map(/** @param {string} char, @param {number} i*/(char, i) => {
      if (entry.positions.has(i))
        return `<span foreground="${hexcolor}">${char}</span>`;
      else
        return char;
    }).join("");
  });
  results.children = fzfResults.map(e => e.item);
}

const SearchBox = (launcherState) => {
  const results = (
    < box
      className={"search-results"}
      vertical={true}
      vexpand={true}
    />
  )
  const entry = (
    < entry
      className={"search-entry"}
      placeholder_text={"search"}
      primary_icon_name={Icon.launcher.search}
    />
  ).on("notify::text", (entry) => searchApps(entry.text || "", results))
    .on("activate", () => {
      // @ts-ignore
      results.children[0]?.attribute.app.launch();
      App.toggle_window("launcher");
    })
    .hook(launcherState, () => {
      if (launcherState.value != "Search") return;
      entry.text = "-";
      entry.text = "";
      entry.grab_focus();
    })
    .hook(App, (_, name, visible) => {
      if (name !== "launcher" || !visible) return;
      if (launcherState.value == "Search") {
        entry.text = "-";
        entry.text = "";
        entry.grab_focus();
      }
    }, "window-toggled");

  return (
    <box
      vertical={true}
      className={"launcher-search"}
    >

      {entry}
      <scrollable
        className={"search-scroll"}
      >
        {results}
      </scrollable>
    </box>
  )
};
export default SearchBox;


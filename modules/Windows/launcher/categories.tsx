import { App, Astal, Widget, Gdk, Gtk } from "astal"
import { AppIcon } from "./search";
import Pango from "gi://Pango";

const mainCategories = [
  "AudioVideo",
  "Audio",
  "Video",
  "Development",
  "Education",
  "Game",
  "Graphics",
  "Network",
  "Office",
  "Science",
  "Settings",
  "System",
  "Utility"
];

/**
 * @param {import('types/service/applications').Application} app
 */
const getCategories = app => {
  /** @param {string} cat */
  const substitute = cat => {
    const map = {
      "Audio": "Multimedia",
      "AudioVideo": "Multimedia",
      "Video": "Multimedia",
      "Graphics": "Multimedia",
      "Science": "Education",
      "Settings": "System",
    };
    return map[cat] ?? cat;
  };
  return app.app.get_categories()
    ?.split(";")
    .filter(c => mainCategories.includes(c))
    .map(substitute)
    .filter((c, i, arr) => i === arr.indexOf(c)) ?? [];
};

const CategoryList = () => {

  const catsMap = new Map();

  Applications.list.forEach(app => {
    const cats = getCategories(app);
    cats.forEach(cat => {
      if (!catsMap.has(cat)) catsMap.set(cat, []);
      catsMap.get(cat).push(app);
    });
  });
  return catsMap;
};

/**
 * @param {import('types/service/applications.js').Application} app
 */
const AppButton = app => (
  <button
    className={"app-button"}
    on_clicked={() => {
      app.launch();
      App.toggle_window("launcher");
    }}
    tooltip_text={app.description}

  >
    <box
      vertical={true}
    >
      {AppIcon(app)}
      <label
        className={"app-name"}
        max_width_chars={8}
        ellipsize={Pango.EllipsizeMode.END}
        label={app.name}
        valign={Gtk.Align.CENTER}
      />
    </box>
  </button >
).on("focus-in-event", (self) => {
  self.toggleClassName("focused", true);
})
  .on("focus-out-event", (self) => {
    self.toggleClassName("focused", false);
  });


/**
 * @param {import('types/service/applications').Application[]} list
 * @returns {import('types/widgets/box').default}
 */
const CategoryListWidget = list => {
  const flowBox = <flowbox />
  list.forEach(app => {
    flowBox.add(AppButton(app));
  });
  return (
    <box
      className={"launcher-category"}
    >
      <scrollable
        hscroll={"never"}
        vscroll={"automatic"}
        hexpand={true}
      >
        <box
          vertical={true}
        >
          {flowBox}

          <box vexpand={true} />
        </box>
      </scrollable>
    </box>
  );
};

const Categories = () => {
  return Object.fromEntries([...CategoryList()].map(([key, val]) => [key, CategoryListWidget(val)]));
};

export default Categories;




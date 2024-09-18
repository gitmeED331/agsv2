import { GLib, execAsync, Widget, Gtk, App, Astal } from "astal";
import Pango from "gi://Pango";

type EntryObject = {
  id: string;
  content: string;
  entry: string;
};

const Separator = () => {
  return (
    <box
      className={"clip_divider"}
      heightRequest={1}
      css={`
        background-color: #ccc;
        margin: 10px 0px;
      `}
    />
  );
};

function ClipHistItem(entry: string) {
  let [id, ...content] = entry.split("\t");
  let clickCount = 0;

  const button = (
    <button className={"clip_container"}>
      <box>
        <label label={id} className={"clip_id"} valign={Gtk.Align.CENTER} />
        <label
          label={"・"}
          className={"dot_divider"}
          valign={Gtk.Align.CENTER}
        />
        <label
          label={content.join(" ").trim()}
          className={"clip_label"}
          valign={Gtk.Align.CENTER}
          ellipsize={Pango.EllipsizeMode.END}
        />
      </box>
    </button>
  );

  button.connect("clicked", () => {
    clickCount++;
    if (clickCount === 2) {
      execAsync(
        `${GLib.get_user_config_dir()}/src/scripts/cliphist.sh --copy-by-id ${id}`,
      );
      clickCount = 0;
    }
  });

  button.connect("focus-out-event", () => {
    clickCount = 0;
  });

  return (
    <box orientation={Gtk.Orientation.VERTICAL}>
      {button}
      <Separator />
    </box>
  );
}

function ClipHistWidget({ width = 500, height = 500, spacing = 12 }) {
  let output = "";
  let entries: string[] = [];
  let clipHistItems: EntryObject[] = [];
  let widgets: JSX.Element[] = [];

  const list = <box vertical={true} spacing={spacing} />;

  async function repopulate() {
    try {
      output = await execAsync(
        `${GLib.get_user_config_dir()}/scripts/cliphist.sh --get`,
      );
    } catch (err) {
      print(err);
      output = "";
    }

    entries = output.split("\n").filter((line) => line.trim() !== "");
    clipHistItems = entries.map((entry) => {
      let [id, ...content] = entry.split("\t");
      return { id: id.trim(), content: content.join(" ").trim(), entry };
    });

    // Clear the existing children
    list.remove_all();

    // Create new widgets and add them to the list
    widgets = clipHistItems.map((item) => ClipHistItem(item.entry));
    widgets.forEach((widget) => {
      list.append(widget);
    });
  }

  repopulate();

  const entry = (
    <entry
      hexpand={true}
      className={"cliphistory_entry"}
      placeholder_text={"Search"}
      on_changed={({ text }) => {
        const searchText = (text ?? "").toLowerCase();
        widgets.forEach((item) => {
          const content =
            clipHistItems
              .find((clipItem) => clipItem.entry === item.entry)
              ?.content.toLowerCase() || "";
          item.visible = content.includes(searchText);
        });
      }}
    />
  );

  return (
    <box
      vertical={true}
      className={"cliphistory_box"}
      margin_top={14}
      margin_right={14}
      setup={(self) =>
        self.hook(App, (_, windowName, visible) => {
          if (windowName !== cliphist) return;

          if (visible) {
            repopulate();
            entry.text = "";
          }
        })
      }
    >
      {entry}
      <Separator />
      <scrollable
        hscroll={Gtk.PolicyType.NEVER}
        css={`
          min-width: ${width}px;
          min-height: ${height}px;
        `}
      >
        {list}
      </scrollable>
    </box>
  );
}

const cliphist = (
  <window
    name={"cliphist"}
    className={"cliphistory"}
    visible={false}
    keymode={Astal.Keymode.EXCLUSIVE}
    anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.RIGHT}
    layer={Astal.Layer.OVERLAY}
    application={App}
  >
    <ClipHistWidget />
  </window>
);

export default cliphist;

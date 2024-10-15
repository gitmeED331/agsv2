import { bind, execAsync, Gtk, Gdk, GLib, App, Astal, Variable } from "astal";
import Pango from "gi://Pango";
import Icon from "../lib/icons";
import { Grid } from "../Astalified/index";
import { winwidth, winheight } from "../lib/screensizeadjust";

type EntryObject = {
  id: string;
  content: string;
  entry: string;
};

const binary_data = /\[\[ binary data (\d+) (KiB|MiB) (\w+) (\d+)x(\d+) \]\]/;

let imageRevealer = Variable(false)

function ClipHistItem(entry: string) {
  const [id, ..._content] = entry.split("\t");
  const content = _content.join(" ").trim();
  const matches = content.match(binary_data);
  let _show_image = false;
  let clickCount = 0;

  const show_image = (file: string, width: string, height: string) => {
    if (_show_image) return;

    const box = button.child;
    if (!box) return;

    box.children[2]?.destroy();

    const imageBox = createImageBox(file, Number(width), Number(height));

    box.children.push(imageBox);
    box.show_all();
    _show_image = true
  };


  const hide_image = () => {
    if (!_show_image) return;
    const box = button.child;
    box.children[2]?.destroy();
    box.children.push(
      <label
        label={content}
        className="cliphist label"
        xalign={0}
        valign={Gtk.Align.CENTER}
        ellipsize={Pango.EllipsizeMode.END}
      />
    );
    _show_image = false;
  };

  const createButton = (id: string, content: string, onClick: () => void) => (
    <button className="cliphist item" on_click={onClick}>
      <label
        label={`${id} - ${content}`}
        xalign={0}
        valign={Gtk.Align.CENTER}
        halign={Gtk.Align.START}
        ellipsize={Pango.EllipsizeMode.END}
        widthRequest={winwidth(0.15)}
      />
    </button>
  );

  const createImageBox = (file: string, width: number, height: number) => {
    const maxWidth = 400;
    const widthPx = (width / height) * 150;

    const minHeight = widthPx > maxWidth ? (150 / widthPx) * maxWidth : 150;
    const minWidth = widthPx > maxWidth ? maxWidth : widthPx;

    return (
      <revealer
        revealChild={bind(imageRevealer)}
        transitionType={Gtk.RevealerTransitionType.SLIDE_DOWN}

      >
        <box
          valign={Gtk.Align.CENTER}
          className="cliphist preview"
          css={`
        background-image: url("${file}");
        min-height: ${minHeight}px;
        min-width: ${minWidth}px;
        background-size: cover;
        background-repeat: no-repeat;
      `}
        />
      </revealer>
    );
  };


  const button = createButton(id, content, () => {
    clickCount++;
    if (clickCount === 1) {
      imageRevealer.set(!imageRevealer.get());
    }
    if (clickCount === 2) {
      App.toggle_window("cliphist");
      execAsync(`${GLib.get_user_config_dir()}/ags/scripts/cliphist.sh --copy-by-id ${id}`);
      clickCount = 0;
      entry.set_text("");
    }
  });

  if (matches) {
    const [format, width, height] = matches.slice(3);
    if (format === "png") {
      button.add_class("with_image");
      button.connect("clicked", () => {
        if (!_show_image) {
          execAsync(`${GLib.get_user_config_dir()}/ags/scripts/cliphist.sh --save-by-id ${id}`)
            .then((file) => {
              show_image(file, width, height);
              execAsync(`rm -f /tmp/ags/cliphist/${id}.png`);
            })
            .catch(console.error);
        }
      });
    }
  }

  button.connect("focus-out-event", () => {
    clickCount = 0;
  });

  return (
    <box attribute={{ content, id, hide_image, show_image }} orientation={Gtk.Orientation.VERTICAL} visible={true}>
      {button}
    </box>
  );
}

const list = <box vertical={true} />;
let clipHistItems: EntryObject[] = [];

const monitorClipboard = async () => {
  let lastContent = "";

  setInterval(async () => {
    const currentContent = await execAsync("wl-paste").catch(err => {
      console.error(err);
      return "";
    });

    if (currentContent && currentContent !== lastContent) {
      lastContent = currentContent;
      await execAsync(`${GLib.get_user_config_dir()}/ags/scripts/cliphist.sh --add "${currentContent}"`);
      await repopulate();
    }
  }, 2000);
};

const repopulate = async () => {
  const output = await execAsync(`${GLib.get_user_config_dir()}/ags/scripts/cliphist.sh --get`).catch(err => {
    console.error(err);
    return "";
  });

  clipHistItems = output.split("\n")
    .filter(line => line.trim() !== "")
    .map(entry => {
      const [id, ...content] = entry.split("\t");
      return { id: id.trim(), content: content.join(" ").trim(), entry };
    });

  updateList();
};

const updateList = () => {
  const widget_ids = new Set(clipHistItems.map(item => item.id));

  list.children.forEach(item => {
    if (!widget_ids.has(item.attribute.id)) {
      item.destroy();
    }
  });

  const list_ids = new Set(list.children.map(item => item.attribute.id));

  clipHistItems.forEach(item => {
    if (!list_ids.has(item.id)) {
      const _item = ClipHistItem(item.entry);
      list.pack_end(_item, false, false, 0);
    }
  });

  list.children.sort((a, b) => Number(a.attribute.id) - Number(b.attribute.id)).reverse();
};

repopulate();
monitorClipboard();

const entry = (
  <entry
    className="search"
    placeholder_text="Search"
    hexpand={true}
    halign={Gtk.Align.FILL}
    valign={Gtk.Align.CENTER}
    activates_default={true}
    focusOnClick={true}
    onChanged={({ text }) => {
      const searchText = (text ?? "").toLowerCase();
      list.children.forEach(item => {
        item.visible = item.attribute.content.toLowerCase().includes(searchText);
      });
    }}
  />
);
const clearButton = (
  <button
    className="clear_hist"
    valign={Gtk.Align.CENTER}
    on_clicked={() => {
      execAsync(`${GLib.get_user_config_dir()}/ags/scripts/cliphist.sh --clear`)
        .then(repopulate)
        .catch(console.error);
      entry.set_text("");
    }}
  >
    <icon icon={Icon.cliphist.delete} halign={Gtk.Align.FILL} valign={Gtk.Align.FILL} />
  </button>
);
function ClipHistWidget() {
  const header = (
    <box className="cliphist header">
      {[entry, clearButton]}
    </box>
  );

  const theGrid = new Grid({
    className: "cliphist contentgrid",
    halign: Gtk.Align.FILL,
    valign: Gtk.Align.FILL,
    hexpand: true,
    vexpand: true,
    visible: true,
  });

  theGrid.attach(header, 1, 1, 1, 1);
  theGrid.attach(list, 1, 2, 1, 1);

  return (
    <box orientation={Gtk.Orientation.VERTICAL} className="cliphist container" halign={Gtk.Align.FILL} valign={Gtk.Align.FILL}>
      {theGrid}
    </box>
  );
}

function ClipHist() {
  const eventHandler = (
    <eventbox
      halign={Gtk.Align.FILL}
      valign={Gtk.Align.FILL}
      onClick={(_, event) => {
        const win = App.get_window("cliphist");
        if (event.button === Gdk.BUTTON_PRIMARY && win?.visible) {
          win.visible = false;
        }
      }}
      widthRequest={winwidth(0.75)}
      heightRequest={winheight(0.75)}
    />
  );

  const masterGrid = new Grid({
    className: "cliphist mastergrid",
    halign: Gtk.Align.FILL,
    valign: Gtk.Align.FILL,
    hexpand: true,
    vexpand: true,
    visible: true,
  });

  masterGrid.attach(eventHandler, 1, 1, 1, 1);
  masterGrid.attach(ClipHistWidget(), 2, 1, 1, 1);

  return (
    <window
      name="cliphist"
      className="cliphistory"
      application={App}
      layer={Astal.Layer.OVERLAY}
      exclusivity={Astal.Exclusivity.NORMAL}
      keymode={Astal.Keymode.ON_DEMAND}
      visible={false}
      anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.BOTTOM | Astal.WindowAnchor.LEFT | Astal.WindowAnchor.RIGHT}
      onKeyPressEvent={(_, event) => {
        const win = App.get_window("cliphist");
        if (event.get_keyval()[1] === Gdk.KEY_Escape && win?.visible) {
          win.visible = false;
          entry.set_text("");
        }
      }}
    >
      {masterGrid}
    </window>
  );
}

export default ClipHist;

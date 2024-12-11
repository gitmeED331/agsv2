import { Astal, Gtk, Gdk, App } from "astal/gtk3";
import { GLib, execAsync } from "astal";
import AstalApps from "gi://AstalApps";
import Pango from "gi://Pango";
import { winwidth, winheight } from "../../lib/screensizeadjust";
import { Grid } from "../../Astalified/index";
import FavoritesBar from "./FavoritesBar";
import ClickToClose from "../../lib/ClickToClose";
import entry, { query } from "./search";
import { theStack, Switcher } from "./stackandswitcher";
import { Icons } from "../../lib/icons";

const background = `${SRC}/assets/groot-thin-right.png`;

const Apps = new AstalApps.Apps({
	nameMultiplier: 2,
	entryMultiplier: 0.05,
	executableMultiplier: 0.05,
	descriptionMultiplier: 0.1,
	keywordsMultiplier: 0.1,
	minScore: 0.75,
});

const Applications = Apps.get_list();
const sortedAppList = Applications.sort((a, b) => a.get_name().localeCompare(b.get_name()));
const favorites = Applications.filter((app) => ["Zed", "VSCodium - Wayland", "deezer-enhanced", "Floorp", "KeePassXC"].includes(app.get_name()));

/* keep for looking up app names */
// console.log(Applications.map(app => app.get_name()));

export default function Launchergrid(monitor: Gdk.Monitor) {
	const WINDOWNAME = `launcher${monitor}`

	const contentGrid = (
		<Grid
			className={"launcher contentgrid"}
			halign={FILL}
			valign={FILL}
			hexpand={true}
			vexpand={true}
			visible={true}
			css={`
				background-image: url("${background}");
				background-size: contain;
				background-repeat: no-repeat;
				background-position: center;
				background-color: rgba(0, 0, 0, 1);
			`}
			setup={(self) => {
				self.attach(entry, 0, 0, 2, 1);
				self.attach(<FavoritesBar favorites={favorites} />, 0, 1, 2, 1);
				self.attach(Switcher(), 0, 2, 1, 1);
				self.attach(theStack, 1, 2, 1, 1);
			}}
		/>
	);

	const masterGrid = (
		<Grid
			className={"launcher containergrid"}
			halign={FILL}
			valign={FILL}
			hexpand={true}
			vexpand={true}
			visible={true}
			setup={(self) => {
				self.attach(contentGrid, 0, 0, 1, 1);
				self.attach(<ClickToClose id={1} width={0.8} height={0.8} windowName={WINDOWNAME} />, 1, 0, 1, 1);
			}}
		/>
	);

	App.connect("window-toggled", (_, win) => {
		if (win.visible === false && win.name === WINDOWNAME) {
			query.set("");
			entry.set_text("");
			entry.grab_focus();
			theStack.set_visible_child_name("All Apps");
		}
	});

	return (
		<window
			name={WINDOWNAME}
			className={"launcher window"}
			gdkmonitor={monitor}
			anchor={TOP | BOTTOM | LEFT | RIGHT}
			layer={Astal.Layer.OVERLAY}
			exclusivity={Astal.Exclusivity.NORMAL}
			keymode={Astal.Keymode.ON_DEMAND}
			visible={false}
			application={App}
			clickThrough={false}
			onKeyPressEvent={(_, event) => {
				const win = App.get_window(WINDOWNAME);
				if (event.get_keyval()[1] === Gdk.KEY_Escape) {
					if (win && win.visible === true) {
						query.set("");
						win.visible = false;
					}
				}
			}}
		>
			{masterGrid}
		</window>
	);
}
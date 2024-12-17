import { Astal, Gtk, Gdk, App } from "astal/gtk3";
import AstalApps from "gi://AstalApps";
import { Grid } from "../../Astalified/index";
import FavoritesBar from "./FavoritesBar";
import ClickToClose from "../../lib/ClickToClose";
import entry, { query } from "./search";
import { theStack, Switcher } from "./Design";
import { Icons } from "../../lib/icons";
import { Applications } from "./AppAccess";
import { SysButton } from "modules/Widgets/SessionControls";

const background = `${SRC}/assets/groot-thin-right.png`;

const favorites = Applications.filter((app) => ["Zed", "VSCodium - Wayland", "deezer-enhanced", "Floorp", "KeePassXC"].includes(app.get_name())).sort((a, b) =>
	a.get_name().localeCompare(b.get_name()),
);

/* keep for looking up app names */
// console.log(Applications.map(app => app.get_name()));

const SessCon = (
	<box className={"sessioncontrols launcher pbox"} spacing={10} halign={CENTER} valign={END} vertical>
		<SysButton action={"lock"} visible={false} />
		<SysButton action={"logout"} visible={false} />
		<SysButton action={"reboot"} visible={false} />
		<SysButton action={"shutdown"} visible={false} />
	</box>
);

export default function Launchergrid(monitor: Gdk.Monitor) {
	const WINDOWNAME = `launcher${monitor}`;

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
				self.attach(<Switcher />, 0, 2, 1, 1);
				self.attach(theStack, 1, 2, 1, 2);
				self.attach(SessCon, 0, 3, 1, 1);
			}}
		/>
	);

	// const masterGrid = (
	// 	<Grid
	// 		className={"launcher containergrid"}
	// 		halign={FILL}
	// 		valign={FILL}
	// 		hexpand={true}
	// 		vexpand={true}
	// 		visible={true}
	// 		setup={(self) => {
	// 			self.attach(contentGrid, 0, 0, 1, 1);
	// 			self.attach(<ClickToClose id={1} width={0.8} height={0.8} windowName={WINDOWNAME} />, 1, 0, 1, 1);
	// 		}}
	// 	/>
	// );

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
			<box>
				{contentGrid}
				<ClickToClose id={1} width={0.8} height={0.8} windowName={WINDOWNAME} />
			</box>
		</window>
	);
}

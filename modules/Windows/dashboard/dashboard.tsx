import { Astal, bind, Widget, Gtk, App, Gdk, Variable } from "astal";
import { winheight, winwidth } from "../../lib/screensizeadjust";
import Mpris from "gi://AstalMpris";
import Icon, { Icons } from "../../lib/icons";
import { StackSwitcher } from "../../Astalified/StackSwitcher";

// --- imported widgets ---
import { BrightnessSlider, GridCalendar, Player, PowerProfiles, Tray, BluetoothDevices, EthernetWidget, WifiAPs, AudioMixer, SessionControls } from "../../Widgets/index";
import NotificationList from "./notificationList";
import LeftSide from "./LeftSide";
import RightSide from "./RightSide";

const player = Mpris.Player.new("Deezer");

function Dashboard() {
	const content = (
		<box
			className={"dashboard container"}
			vertical={true}
			vexpand={true}
			hexpand={false}
			valign={Gtk.Align.START}
			halign={Gtk.Align.CENTER}
			heightRequest={winheight(0.5)}
			widthRequest={winwidth(0.25)}
			css={`
				padding: 1.5rem;
			`}
			clickThrough={false}
		>
			<box vertical={true} halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} spacing={10}>
				<Player player={player} />
			</box>
			<box vertical={false} halign={Gtk.Align.FILL} valign={Gtk.Align.FILL} spacing={10}>
				<LeftSide />
				<Tray />
				<RightSide />
			</box>
		</box>
	);
	return (
		<window
			name={"dashboard"}
			className={"dashboard window"}
			anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.LEFT | Astal.WindowAnchor.RIGHT | Astal.WindowAnchor.BOTTOM}
			layer={Astal.Layer.OVERLAY}
			exclusivity={Astal.Exclusivity.NORMAL}
			keymode={Astal.Keymode.EXCLUSIVE}
			visible={false}
			application={App}
		>
			<eventbox
				valign={Gtk.Align.FILL}
				halign={Gtk.Align.FILL}
				onKeyPressEvent={(_, event) => {
					if (event.get_keyval()[1] === Gdk.KEY_Escape) {
						App.toggle_window("dashboard");
					}
				}}
				// onClick={(btn, event) => {
				//   if (event.button === Gdk.BUTTON_PRIMARY) {
				//     App.toggle_window("dashboard");
				//   }
				// }}
			>
				{content}
			</eventbox>
		</window>
	);
}
export default Dashboard;

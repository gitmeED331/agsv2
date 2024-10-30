import { Gtk, Gdk } from "astal/gtk4";
import { timeout, bind } from "astal";
import Icon from "../../lib/icons";
import AstalNotifd from "gi://AstalNotifd";
import { NotifWidget } from "../../Widgets/index";
const Notif = AstalNotifd.get_default();

const NotifBox = (
	<scrollable className="notif container" vscroll={Gtk.PolicyType.AUTOMATIC} hscroll={Gtk.PolicyType.NEVER} vexpand={true} hexpand={false} halign={Gtk.Align.FILL} valign={Gtk.Align.FILL}>
		<box className={"notif"} halign={Gtk.Align.CENTER | Gtk.Align.FILL} valign={Gtk.Align.START} vexpand={true} vertical={true} spacing={10} widthRequest={350}>
			{bind(Notif, "notifications").as((items) => {
				if (items) {
					items.sort((a, b) => b.time - a.time);
				}
				return items.map((item) => <eventbox onClick={() => item.dismiss()}>{NotifWidget({ item })}</eventbox>);
			})}
		</box>
	</scrollable>
)

const Header = (
	<label label="Notifications" valign={Gtk.Align.START} halign={Gtk.Align.END} />
)

const Controls = (
	<box halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} vertical={false} spacing={20}>
		<button
			halign={Gtk.Align.START}
			valign={Gtk.Align.START}
			onClick={(_, event) => {
				if (event.button === Gdk.BUTTON_PRIMARY) {
					Notif.get_notifications().forEach((item, id) => timeout(50 * id, () => item.dismiss()));
				}
			}}
		>
			<icon icon={bind(Notif, "notifications").as((items) => (items.length > 0 ? Icon.trash.full : Icon.trash.empty))} />
		</button>
		<button
			halign={Gtk.Align.END}
			valign={Gtk.Align.START}
			onClick={(_, event) => {
				if (event.button === Gdk.BUTTON_PRIMARY) {
					Notif.set_dont_disturb(!Notif.get_dont_disturb());
				}
			}}
		>
			<icon
				icon={bind(Notif, "dont_disturb").as((d) => (d === false ? "bell-enabled-symbolic" : "bell-disabled-symbolic"))}
				valign={Gtk.Align.CENTER}
				halign={Gtk.Align.CENTER}
			/>
		</button>
	</box>
)

export default function NotificationList() {
	return (
		<box name={"Notifications"} className="notif panel" vertical={true} halign={Gtk.Align.FILL} valign={Gtk.Align.FILL}>
			<centerbox
				className="header"
				spacing={20}
				// valign={Gtk.Align.FILL}
				// halign={Gtk.Align.FILL}
				vertical={false}
				centerWidget={Header}
				endWidget={Controls}
			/>
			{NotifBox}
		</box>
	);
}

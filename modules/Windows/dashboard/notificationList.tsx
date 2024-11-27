import { Gtk, Gdk } from "astal/gtk3";
import { timeout, bind } from "astal";
import Icon from "../../lib/icons";
import AstalNotifd from "gi://AstalNotifd";
import { NotifWidget } from "../../Widgets/index";


export default function NotificationList() {
	const Notif = AstalNotifd.get_default();

	const NotifBox = (
		<scrollable className="notif container" vscroll={Gtk.PolicyType.AUTOMATIC} hscroll={Gtk.PolicyType.NEVER} vexpand={true} hexpand={false} halign={FILL} valign={FILL}>
			<box className={"notif"} halign={CENTER} valign={START} vexpand={true} vertical={true} spacing={10} widthRequest={350}>
				{bind(Notif, "notifications").as((items) => {
					if (items) {
						items.sort((a, b) => b.time - a.time);
					}
					return items.map((item) => <eventbox onClick={() => item.dismiss()}>{NotifWidget({ item })}</eventbox>);
				})}
			</box>
		</scrollable>
	);

	const Header = <label label="Notifications" valign={START} halign={END} />;

	const Controls = (
		<box halign={CENTER} valign={CENTER} vertical={false} spacing={20}>
			<button
				halign={START}
				valign={START}
				onClick={(_, event) => {
					if (event.button === Gdk.BUTTON_PRIMARY) {
						Notif.get_notifications().forEach((item, id) => timeout(50 * id, () => item.dismiss()));
					}
				}}
			>
				<icon icon={bind(Notif, "notifications").as((items) => (items.length > 0 ? Icon.trash.full : Icon.trash.empty))} />
			</button>
			<button
				halign={END}
				valign={START}
				onClick={(_, event) => {
					if (event.button === Gdk.BUTTON_PRIMARY) {
						Notif.set_dont_disturb(!Notif.get_dont_disturb());
					}
				}}
			>
				<icon icon={bind(Notif, "dont_disturb").as((d) => (d === false ? "bell-enabled-symbolic" : "bell-disabled-symbolic"))} valign={CENTER} halign={CENTER} />
			</button>
		</box>
	);

	return (
		<box name={"Notifications"} className="notif panel" vertical={true} halign={FILL} valign={FILL}>
			<centerbox
				className="header"
				spacing={20}
				// valign={FILL}
				// halign={FILL}
				vertical={false}
				centerWidget={Header}
				endWidget={Controls}
			/>
			{NotifBox}
		</box>
	);
}

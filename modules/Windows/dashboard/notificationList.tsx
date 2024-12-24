import { Gtk, Gdk, Widget } from "astal/gtk3";
import { bind, Variable } from "astal";
import Icon from "../../lib/icons";
import AstalNotifd from "gi://AstalNotifd";
import { NotifWidget } from "../../Widgets/index";
import Controls from "Lockscreen/Controls";


export default function NotificationList() {
	const Notif = AstalNotifd.get_default();

	const NotifBox = (
		<scrollable className="notif container" vscroll={Gtk.PolicyType.AUTOMATIC} hscroll={Gtk.PolicyType.NEVER} vexpand={true} hexpand={false} halign={FILL} valign={FILL}>
			<box className={"notif"} halign={FILL} valign={START} vexpand={true} vertical={true} hexpand={false} spacing={10} widthRequest={350} >
				{bind(Notif, "notifications").as((items) => {
					if (items) {
						items.sort((a, b) => b.time - a.time);
					}
					return items.map((item) => <eventbox halign={FILL} valign={FILL} onClick={() => item.dismiss()}>{NotifWidget({ item })}</eventbox>);
				})}
			</box>
		</scrollable>
	);

	const Controls = ({ btn, ...props }: { btn: "trash" | "dnd" } & Widget.ButtonProps) => {

		const Bindings = Variable.derive([bind(Notif, "notifications"), bind(Notif, "dont_disturb")], (items, DND) => ({
			command: {
				trash: () => { items.length > 0 ? Notif.get_notifications().forEach((item) => item.dismiss()) : null },
				dnd: () => { DND ? Notif.set_dont_disturb(false) : Notif.set_dont_disturb(true) }
			}[btn],
			icon: {
				trash: items.length > 0 ? Icon.trash.full : Icon.trash.empty,
				dnd: DND ? "bell-disabled-symbolic" : "bell-enabled-symbolic"
			}[btn]
		}));


		return <button
			onClick={(_, event) => {
				if (event.button === Gdk.BUTTON_PRIMARY) {
					Bindings.get().command();
				}
			}}
			{...props}
		>
			<icon icon={bind(Bindings).as((i) => i.icon)} valign={CENTER} halign={CENTER} />
		</button >
	}

	return (
		<box name={"Notifications"} className="notif panel" vertical={true} halign={FILL} valign={FILL}>
			<centerbox
				className="header"
				spacing={20}
				centerWidget={<label label="Notifications" valign={START} halign={END} />}
				endWidget={<box halign={CENTER} valign={CENTER} vertical={false} spacing={20}>
					<Controls btn="trash" halign={START} />
					<Controls btn="dnd" halign={END} />
				</box>}
			/>
			{NotifBox}
		</box>
	);
}

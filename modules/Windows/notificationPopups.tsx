import { Astal, Gdk, App, Widget } from "astal/gtk3";
import { timeout, Variable } from "astal";
import AstalNotifd from "gi://AstalNotifd";
import { NotifWidget } from "../Widgets/index";

const Notif = AstalNotifd.get_default();
const waitTime = new Variable(2000);
const expireTime = new Variable(20000);

function removeItem(box: Widget.Box, notificationItem: any) {
	box.remove(notificationItem);
}

function isDoNotDisturbEnabled() {
	return Notif.get_dont_disturb();
}

function NotifItem() {
	const box = new Widget.Box({
		vertical: true,
		spacing: 10,
		hexpand: true,
		vexpand: true,
	});

	Notif.connect("notified", (_, id) => {
		if (isDoNotDisturbEnabled()) {
			print("Notification blocked due to Do Not Disturb mode.");
			return;
		}

		const notification = Notif.get_notification(id);
		if (notification) {
			const notificationItem = (
				<eventbox
					onClick={(_, event) => {
						if (event.button === Gdk.BUTTON_PRIMARY) {
							removeItem(box, notificationItem);
						}
						if (event.button === Gdk.BUTTON_SECONDARY) {
							notification.dismiss();
						}
					}}
					onHover={() => {
						expireTime.set(0);
						waitTime.set(0);
					}}
					onHoverLost={() => {
						waitTime.set(3000);
						timeout(waitTime.get(), () => removeItem(box, notificationItem));
					}}
				>
					<NotifWidget item={notification} />
				</eventbox>
			);

			box.add(notificationItem);

			notification.connect("dismissed", () => removeItem(box, notificationItem));

			timeout(expireTime.get(), () => removeItem(box, notificationItem));
		}
	});

	return box;
}

export default (monitor: Gdk.Monitor) => (
	<window name={`notifications${monitor}`} className={"notifications notif"} widthRequest={450} anchor={TOP | RIGHT} hexpand={true} layer={Astal.Layer.OVERLAY} application={App} gdkmonitor={monitor}>
		<NotifItem />
	</window>
);
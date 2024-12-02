import { Astal, Gdk, App, Widget } from "astal/gtk3";
import { timeout, Variable } from "astal";
import AstalNotifd from "gi://AstalNotifd";
import { NotifWidget } from "../Widgets/index";

function NotifItem() {
	const Notif = AstalNotifd.get_default();
	const waitTime = new Variable(2000);
	const expireTime = new Variable(20000);

	function removeItem(box: Widget.Box, notificationItem: any) {
		box.remove(notificationItem);
	}

	function isDoNotDisturbEnabled() {
		return Notif.get_dont_disturb();
	}

	const box = <box
		vertical={true}
		spacing={10}
		expand
	/> as Widget.Box;

	Notif.connect("notified", (_, id) => {
		if (isDoNotDisturbEnabled()) {
			print("Notification blocked due to Do Not Disturb mode.");
			return;
		}

		const notification = Notif.get_notification(id);
		if (!notification) return;

		const notificationItem = (
			<eventbox
				onClick={(_, event) => {
					switch (event.button) {
						case Gdk.BUTTON_PRIMARY:
							removeItem(box, notificationItem);
							break;
						case Gdk.BUTTON_SECONDARY:
							notification.dismiss();
							break;
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

		// setTimeout(() => removeItem(box, notificationItem), expireTime.get());
	})
	return box;
}

export default (monitor: Gdk.Monitor) => (
	<window
		name={`notifications${monitor}`}
		className={"notifications notif"}
		widthRequest={450}
		anchor={TOP | RIGHT}
		hexpand={true}
		layer={OVERLAY_LAYER}
		gdkmonitor={monitor}>
		<NotifItem />
	</window>
);
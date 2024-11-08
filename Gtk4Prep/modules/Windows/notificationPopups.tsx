/**
 * MIT License
 *
 * Copyright (c) 2024 TopsyKrets
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction...
 *
 */

import { Astal, Gtk, Gdk, App, Widget } from "astal/gtk4";
import { GLib, timeout } from "astal";
import AstalNotifd from "gi://AstalNotifd";
import Icon, { Icons } from "../lib/icons";
import { NotifWidget } from "../Widgets/index";

const Notif = AstalNotifd.get_default();
const waitTime = 3000;
const expireTime = 20000;

function removeItem(box, notificationItem) {
	box.remove(notificationItem);
}

function isDoNotDisturbEnabled() {
	return Notif.get_dont_disturb();
}

function NotifItem() {
	const box = new Widget.Box({
		orientation: Gtk.Orientation.VERTICAL,
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
				<box
					onClick={(_, event) => {
						if (event.button === Gdk.BUTTON_PRIMARY) {
							removeItem(box, notificationItem);
						}
						if (event.button === Gdk.BUTTON_SECONDARY) {
							notification.dismiss();
						}
					}}
					onHoverLost={() => {
						timeout(waitTime, () => removeItem(box, notificationItem));
					}}
				>
					<NotifWidget item={notification} />
				</box>
			);

			box.add(notificationItem);

			notification.connect("dismissed", () => {
				removeItem(box, notificationItem);
			});

			timeout(expireTime, () => {
				removeItem(box, notificationItem);
			});
		}
	});

	return box;
}

function NotifPopup() {
	return (
		<box cssClasses={"notif"} halign={Gtk.Align.FILL} valign={Gtk.Align.START} vexpand={true} orientation={Gtk.Orientation.VERTICAL} spacing={10} widthRequest={450}>
			<NotifItem />
		</box>
	);
}

export default ({ monitor }: { monitor: number }) => (
	<window name={`notifications${monitor}`} anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.RIGHT} cssClasses={"notifications"} hexpand={true} layer={Astal.Layer.OVERLAY} application={App}>
		<NotifPopup />
	</window>
);

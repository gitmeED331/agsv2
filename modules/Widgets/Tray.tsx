/**
 * MIT License
 *
 * Copyright (c) 2024 TopsyKrets
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction...
 *
 */

import { Astal, Gtk, Gdk, App, Widget } from "astal/gtk3";
import { bind } from "astal";
import AstalTray from "gi://AstalTray";

const SystemTray = AstalTray.Tray.get_default();

const SysTrayItem = (item) => {
	const menu = item.create_menu?.();
	let clickTimeout: any = null;
	let clickCount = 0;
	return (
		<button
			className={"systray-item"}
			halign={Gtk.Align.CENTER}
			valign={Gtk.Align.CENTER}
			onClick={(btn, event) => {
				if (event.button === Gdk.BUTTON_PRIMARY) {
					clickCount++;
					if (clickCount === 1) {
						clickTimeout = setTimeout(() => {
							clickCount = 0;
						}, 400);
					} else if (clickCount === 2) {
						clearTimeout(clickTimeout);
						clickCount = 0;
						item.activate(0, 0);
					}
				}
				if (event.button === Gdk.BUTTON_SECONDARY) {
					menu?.popup_at_widget(btn, Gdk.Gravity.EAST, Gdk.Gravity.WEST, null);
				}
			}}
			tooltip_markup={bind(item, "tooltip_markup")}
		>
			<icon halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} g_icon={bind(item, "gicon")} />
		</button>
	);
};

function traySetup(box) {
	const items = new Map();

	const addItem = (id: number) => {
		const item = SystemTray.get_item(id);
		if (item) {
			const trayItem = SysTrayItem(item);
			items.set(id, trayItem);
			box.add(trayItem);
			trayItem.show();
		}
	};

	const removeItem = (id) => {
		const trayItem = items.get(id);
		if (trayItem) {
			trayItem.destroy();
			items.delete(id);
		}
	};

	SystemTray.get_items().forEach((item) => addItem(item.item_id));
	SystemTray.connect("item_added", (SystemTray, id) => addItem(id));
	SystemTray.connect("item_removed", (SystemTray, id) => removeItem(id));
}

function Tray() {
	return <box className={"tray container"} setup={traySetup} halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} vertical={true} />;
}
export default Tray;

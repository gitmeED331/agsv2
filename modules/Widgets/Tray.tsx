/** 
 * MIT License
 * 
 * Copyright (c) 2024 TopsyKrets
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software 
 * and associated documentation files (the "Software"), to deal in the Software without restriction.
 */

import { Gtk, Gdk, Widget } from "astal/gtk3";
import { bind } from "astal";
import AstalTray from "gi://AstalTray";
import { Icons } from "../lib/icons";

type TrayItem = ReturnType<ReturnType<typeof AstalTray.Tray.get_default>["get_item"]>;
// const resolveIcon = (item: TrayItem) => {
// 	if (item.gicon) {
// 		return (
// 			<icon
// 				g_icon={bind(item, "gicon")}
// 				halign={Gtk.Align.CENTER}
// 				valign={Gtk.Align.CENTER}
// 			/>
// 		);
// 	} else if (item.icon_name) {
// 		return (
// 			<icon
// 				icon={Icons(bind(item, "icon_name").toString())}
// 				halign={Gtk.Align.CENTER}
// 				valign={Gtk.Align.CENTER}
// 			/>
// 		);
// 	} else if (item.icon_pixbuf) {
// 		return (
// 			<icon
// 				pixbuf={item.get_icon_pixbuf()}
// 				halign={Gtk.Align.CENTER}
// 				valign={Gtk.Align.CENTER}
// 			/>
// 		);
// 	} else {
// 		return (
// 			<icon
// 				g_icon={bind(item, "gicon")}
// 				halign={Gtk.Align.CENTER}
// 				valign={Gtk.Align.CENTER}
// 			/>
// 		);
// 	}
// };


const SysTrayItem = (item: TrayItem) => {
	const menu = item.create_menu();
	let clickTimeout: any = null;
	let clickCount = 0;

	const button = <button
		className="systray-item"
		halign={Gtk.Align.CENTER}
		valign={Gtk.Align.CENTER}
		tooltip_markup={bind(item, "tooltip_markup")}
		focus_on_click={false}
		use_underline={false}
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
	>
		<icon
			g_icon={bind(item, "gicon")}
			halign={Gtk.Align.CENTER}
			valign={Gtk.Align.CENTER}
		/>
	</button>

	return button
};

const setupTray = (box: Widget.Box) => {
	const systemTray = AstalTray.Tray.get_default();
	const items = new Map<string, ReturnType<typeof SysTrayItem>>();

	const addItem = (id: string) => {
		const item = systemTray.get_item(id);
		if (item) {
			const trayItem = SysTrayItem(item);
			items.set(id, trayItem);
			box.add(trayItem);
			trayItem.show();
		}
	};

	const removeItem = (id: string) => {
		const trayItem = items.get(id);
		if (trayItem) {
			trayItem.destroy();
			items.delete(id);
		}
	};

	systemTray.get_items().forEach((item) => addItem(item.item_id));
	systemTray.connect("item_added", (_, id) => addItem(id));
	systemTray.connect("item_removed", (_, id) => removeItem(id));
};

const Tray = () => {
	return (
		<box
			className="tray container"
			halign={Gtk.Align.CENTER}
			valign={Gtk.Align.CENTER}
			vertical={true}
			setup={setupTray}
		/>
	);
};

export default Tray;

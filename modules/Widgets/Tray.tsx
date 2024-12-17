import { Gdk, Widget, App } from "astal/gtk3";
import { bind, Variable, timeout, GLib, AstalIO } from "astal";
import AstalTray from "gi://AstalTray";

type TrayItem = ReturnType<ReturnType<typeof AstalTray.Tray.get_default>["get_item"]>;

const SysTrayItem = (item: TrayItem) => {
	const menu = item.create_menu();
	let clickTimeout: AstalIO.Time;
	let clickCount = 0;

	const button = (
		<button
			className="systray-item"
			halign={CENTER}
			valign={CENTER}
			tooltip_markup={bind(item, "tooltip_markup")}
			focus_on_click={false}
			use_underline={false}
			onClick={(btn, event) => {
				if (event.button === Gdk.BUTTON_PRIMARY) {
					clickCount++;
					if (clickCount === 1) {
						clickTimeout = timeout(400, () => {
							clickCount = 0;
						});
					} else if (clickCount === 2) {
						clickTimeout.cancel();
						clickCount = 0;
						item.activate(0, 0);
						App.toggle_window(`dashboard${App.get_monitors()[0]}`);
					}
				}
				if (event.button === Gdk.BUTTON_SECONDARY) {
					menu?.popup_at_widget(btn, Gdk.Gravity.EAST, Gdk.Gravity.WEST, null);
				}
			}}
		>
			<icon gIcon={bind(item, "gicon")} halign={CENTER} valign={CENTER} />
		</button>
	);

	return button;
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

	systemTray
		.get_items()
		.sort((a, b) => a.item_id.localeCompare(b.item_id))
		.forEach((item) => addItem(item.item_id));
	systemTray.connect("item_added", (_, id) => addItem(id));
	systemTray.connect("item_removed", (_, id) => removeItem(id));
};

export default () => <box className={"tray container"} halign={CENTER} valign={CENTER} expand vertical={true} setup={setupTray} />;

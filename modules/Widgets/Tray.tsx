import { Gdk, Widget, Gtk, App } from "astal/gtk3";
import { bind, Variable, timeout, Gio, GLib, AstalIO } from "astal";
import AstalTray from "gi://AstalTray";

// export default function () {
// 	const tray = AstalTray.get_default()
// 	let clickTimeout: AstalIO.Time;
// 	let clickCount = 0;

// 	return <box className={"tray container"} halign={CENTER} valign={CENTER} expand vertical={true}>
// 		{bind(tray, "items").as(items => items.map(item => (
// 			<menubutton
// 				tooltipMarkup={bind(item, "tooltipMarkup")}
// 				usePopover={false} // do not change, will cause crash
// 				actionGroup={bind(item, "action-group").as(ag => ["dbusmenu", ag])}
// 				menuModel={bind(item, "menu-model")}
// 				direction={Gtk.ArrowType.RIGHT}
// 			>
// 				<icon gIcon={bind(item, "gicon")} />
// 			</menubutton>
// 		)))}
// 	</box>
// }

type TrayItem = ReturnType<ReturnType<typeof AstalTray.Tray.get_default>["get_item"]>;

function createMenu(menuModel: Gio.MenuModel, actionGroup: Gio.ActionGroup): Gtk.Menu {
	const menu: Gtk.Menu = Gtk.Menu.new_from_model(menuModel);
	menu.insert_action_group("dbusmenu", actionGroup);
	return menu;
}

const SysTrayItem = (item: TrayItem) => {
	let menu: Gtk.Menu = createMenu(item.menu_model, item.action_group);
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

	menu.connect("notify::menu-model", () => {
		const newMenu = createMenu(item.menu_model, item.action_group);
		menu.destroy();
		menu = newMenu;
	});

	menu.connect("notify::action-group", () => {
		const newMenu = createMenu(item.menu_model, item.action_group);
		menu.destroy();
		menu = newMenu;
	});

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

export default () => <box className={"tray container"} halign={CENTER} valign={CENTER} expand vertical setup={setupTray} />;

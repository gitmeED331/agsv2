import { Astal, Gtk, Gdk, App } from "astal/gtk3";
import { GLib } from "astal";
import AstalApps from "gi://AstalApps";
import Pango from "gi://Pango";
import { winwidth, winheight } from "../../lib/screensizeadjust";
import { Grid } from "../../Astalified/index";
import FavoritesBar from "./FavoritesBar";
import ClickToClose from "../../lib/ClickToClose";
import entry, { query } from "./search";
import { theStack, Switcher } from "./stackandswitcher";

const background = `${SRC}/assets/groot-thin-right.png`;

const Apps = new AstalApps.Apps({
	nameMultiplier: 2,
	entryMultiplier: 0.05,
	executableMultiplier: 0.05,
	descriptionMultiplier: 0.1,
	keywordsMultiplier: 0.1,
	minScore: 0.75,
});

const Applications = Apps.get_list();
const sortedAppList = Applications.sort((a, b) => a.get_name().localeCompare(b.get_name()));
const favorites = Applications.filter((app) => ["Zed", "VSCodium - Wayland", "deezer-enhanced", "Floorp", "KeePassXC"].includes(app.get_name()));

/* keep for looking up app names */
// console.log(Applications.map(app => app.get_name()));

function createAppGrid(appList: typeof Applications) {
	const columnCount = 1;

	const grid = (
		<Grid
			hexpand={true}
			vexpand={true}
			halign={FILL}
			valign={FILL}
			visible={true}
			setup={(self) => {
				appList.forEach((app, index) => {
					const appButton = createAppButton(app);
					self.attach(appButton, index % columnCount, Math.floor(index / columnCount), 1, 1);
				});
			}}
		/>
	);

	function createAppButton(app: AstalApps.Application) {
		const iconName = app.get_icon_name();
		const validIcon = validateIcon(iconName);

		return (
			<button
				className="launcher app"
				name={app.get_name()}
				tooltip_text={app.get_description()}
				on_clicked={() => {
					app.launch();
					App.toggle_window("launcher");
				}}
				onKeyPressEvent={(_, event) => {
					if (event.get_keyval()[1] === Gdk.KEY_Return) {
						app.launch();
						App.toggle_window("launcher");
					}
				}}
			>
				<box vertical={false} halign={FILL} valign={FILL} spacing={5} widthRequest={winwidth(0.15)}>
					{validIcon && <icon icon={iconName} halign={CENTER} valign={CENTER} />}
					<label label={app.get_name()} halign={CENTER} valign={CENTER} ellipsize={Pango.EllipsizeMode.END} maxWidthChars={30} lines={1} wrap={true} xalign={0} yalign={0} />
				</box>
			</button>
		);
	}

	function validateIcon(iconName: string | null): boolean {
		if (!iconName) return false;

		const iconTheme = Gtk.IconTheme.get_default();

		if (iconTheme.has_icon(iconName)) return true;

		const iconPath = GLib.find_program_in_path(iconName);
		if (iconPath && GLib.file_test(iconPath, GLib.FileTest.EXISTS)) return true;

		return false;
	}

	return grid;
}

const createScrollablePage = (appList: any) => (
	<scrollable
		visible={true}
		vscroll={Gtk.PolicyType.AUTOMATIC}
		hscroll={Gtk.PolicyType.NEVER}
		vexpand={true}
		hexpand={true}
		halign={FILL}
		valign={FILL}
		heightRequest={winheight(0.9)}
		css={`
			padding: 1rem;
		`}
	>
		{createAppGrid(appList)}
	</scrollable>
);

function getCategories(app: any) {
	const mainCategories = ["AudioVideo", "Audio", "Video", "Development", "Education", "Game", "Graphics", "Network", "Office", "Science", "Settings", "System", "Utility"];
	const categoryMap: { [key: string]: string } = {
		Audio: "Multimedia",
		AudioVideo: "Multimedia",
		Video: "Multimedia",
		Graphics: "Multimedia",
		Science: "Education",
		Settings: "System",
	};

	const substitute = (cat: keyof typeof categoryMap) => {
		return categoryMap[cat] ?? cat;
	};

	return (
		app.app
			.get_categories()
			?.split(";")
			.filter((c: any) => mainCategories.includes(c))
			.map(substitute)
			.filter((c: any, i: any, arr: any) => i === arr.indexOf(c)) ?? []
	);
}

const uniqueCategories = Array.from(new Set(Applications.flatMap((app) => getCategories(app)))).sort((a, b) => a.localeCompare(b));

const allAppsPage = (
	// @ts-expect-error
	<box key="All Apps" name="All Apps" halign={FILL} valign={FILL}>
		{createScrollablePage(sortedAppList)}
	</box>
);

const categoryPages = uniqueCategories.map((category) => {
	const sortedAppsInCategory = sortedAppList.filter((app) => getCategories(app).includes(category)).sort((a, b) => a.get_name().localeCompare(b.get_name()));

	return (
		// @ts-expect-error
		<box key={category} name={category.toLowerCase()} halign={FILL} valign={FILL}>
			{createScrollablePage(sortedAppsInCategory)}
		</box>
	);
});

function Launchergrid(monitor: Gdk.Monitor) {
	const contentGrid = (
		<Grid
			className={"launcher contentgrid"}
			halign={FILL}
			valign={FILL}
			hexpand={true}
			vexpand={true}
			visible={true}
			css={`
				background-image: url("${background}");
				background-size: contain;
				background-repeat: no-repeat;
				background-position: center;
				background-color: rgba(0, 0, 0, 1);
			`}
			setup={(self) => {
				self.attach(entry, 0, 0, 2, 1);
				self.attach(<FavoritesBar favorites={favorites} />, 0, 1, 2, 1);
				self.attach(Switcher(), 0, 2, 1, 1);
				self.attach(theStack, 1, 2, 1, 1);
			}}
		/>
	);

	const masterGrid = (
		<Grid
			className={"launcher containergrid"}
			halign={FILL}
			valign={FILL}
			hexpand={true}
			vexpand={true}
			visible={true}
			setup={(self) => {
				self.attach(contentGrid, 1, 1, 1, 1);
				self.attach(ClickToClose(1, 0.8, 0.8, "launcher"), 2, 1, 1, 1);
			}}
		/>
	);

	return (
		<window
			name={"launcher"}
			className={"launcher window"}
			gdkmonitor={monitor}
			anchor={TOP | BOTTOM | LEFT | RIGHT}
			layer={Astal.Layer.OVERLAY}
			exclusivity={Astal.Exclusivity.NORMAL}
			keymode={Astal.Keymode.ON_DEMAND}
			visible={false}
			application={App}
			clickThrough={false}
			onKeyPressEvent={(_, event) => {
				const win = App.get_window("launcher");
				if (event.get_keyval()[1] === Gdk.KEY_Escape) {
					if (win && win.visible === true) {
						query.set("");
						win.visible = false;
					}
				}
			}}
		>
			{masterGrid}
		</window>
	);
}

App.connect("window-toggled", (_, win) => {
	if (win.visible === false && win.name === "launcher") {
		query.set("");
		entry.set_text("");
		entry.grab_focus();
		theStack.set_visible_child_name("All Apps");
	}
});

export default Launchergrid;

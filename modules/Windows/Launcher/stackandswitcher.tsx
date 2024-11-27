import { Astal, Gtk, Gdk, App } from "astal/gtk3";
import { GLib, bind, execAsync } from "astal";
import AstalApps from "gi://AstalApps";
import Pango from "gi://Pango";
import Icon, { Icons } from "../../lib/icons";
import { Stack, Grid } from "../../Astalified/index";
import entry, { query } from "./search";
import { winheight, winwidth } from "../../lib/screensizeadjust";

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

export const createScrollablePage = (appList: any) => (
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
			.filter((c) => mainCategories.includes(c))
			.map(substitute)
			.filter((c, i, arr) => i === arr.indexOf(c)) ?? []
	);
}

const uniqueCategories = Array.from(new Set(Applications.flatMap((app) => getCategories(app)))).sort((a, b) => a.localeCompare(b));

const allAppsPage = (
	<box key="All Apps" name="All Apps" halign={FILL} valign={FILL}>
		{createScrollablePage(sortedAppList)}
	</box>
);

const categoryPages = uniqueCategories.map((category) => {
	const sortedAppsInCategory = sortedAppList.filter((app) => getCategories(app).includes(category)).sort((a, b) => a.get_name().localeCompare(b.get_name()));

	return (
		<box key={category} name={category.toLowerCase()} halign={FILL} valign={FILL}>
			{createScrollablePage(sortedAppsInCategory)}
		</box>
	);
});

export const theStack = (
	<Stack
		className={"launcher stack"}
		transitionDuration={300}
		transitionType={STACK_SLIDE_LEFT_RIGHT}
		halign={FILL}
		valign={FILL}
		hhomogeneous={true}
		vhomogeneous={false}
		visible={true}
		hexpand={false}
		vexpand={true}
		setup={(self) => {
			[allAppsPage, ...categoryPages].forEach((page) => {
				self.add_named(page, page.name);
			});
		}}
	/>
) as Stack;

export const Switcher = () => {
	const handleSwitch = (name: string) => {
		theStack.set_visible_child_name(name);
		query.set("");
		entry.set_text("");
	};

	const allAppsButton = (
		<button
			className={bind(theStack as Stack, "visible_child_name").as((name) => (name === "All Apps" ? "active" : ""))}
			onClick={(_, event) => {
				if (event.button === Gdk.BUTTON_PRIMARY) {
					handleSwitch("All Apps");
				}
			}}
			onKeyPressEvent={(_, event) => {
				if (event.get_keyval()[1] === Gdk.KEY_Return) {
					handleSwitch("All Apps");
				}
			}}
			tooltip_text={"All Apps"}
		>
			<icon icon={Icon.launcher.allapps} />
		</button>
	);

	const categoryButtons = uniqueCategories.map((category) => {
		const iconName = Icon.launcher[category.toLowerCase() as keyof typeof Icon.launcher] || Icon.launcher.system;

		return (
			<button
				className={bind(theStack as Stack, "visible_child_name").as((name) => (name === category.toLowerCase() ? "active" : ""))}
				key={category}
				onClick={(_, event) => {
					if (event.button === Gdk.BUTTON_PRIMARY) {
						handleSwitch(category.toLowerCase());
					}
				}}
				onKeyPressEvent={(_, event) => {
					if (event.get_keyval()[1] === Gdk.KEY_Return) {
						handleSwitch(category.toLowerCase());
					}
				}}
				tooltip_text={category}
			>
				<icon icon={iconName} />
			</button>
		);
	});

	return (
		<box className={"launcher switcher"} vertical halign={CENTER} valign={FILL}>
			{[allAppsButton, categoryButtons]}
		</box>
	);
};

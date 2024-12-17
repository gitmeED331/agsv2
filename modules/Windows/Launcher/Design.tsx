import { Astal, Gtk, Gdk, App } from "astal/gtk3";
import { GLib, bind, monitorFile } from "astal";
import AstalApps from "gi://AstalApps";
import Pango from "gi://Pango";
import Icon, { Icons } from "../../lib/icons";
import { Stack, Grid } from "../../Astalified/index";
import entry, { query } from "./search";
import { winheight, winwidth } from "../../lib/screensizeadjust";
import { Apps, Applications, AstalApplication } from "./AppAccess";

export function CreateAppGrid({ appList }: { appList: AstalApplication[] }) {
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

	function createAppButton(app: AstalApplication) {
		const iconName = app.get_icon_name();
		const validIcon = validateIcon(iconName);

		return (
			<button
				className="launcher app"
				name={app.get_name()}
				tooltip_text={app.get_description()}
				on_clicked={() => {
					app.launch();
					App.toggle_window(`launcher${App.get_monitors()[0]}`);
				}}
			>
				<box halign={FILL} valign={FILL} spacing={5} widthRequest={winwidth(0.1)}>
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

export const createScrollablePage = (appList: AstalApplication[]) => (
	<scrollable
		visible={true}
		vscroll={Gtk.PolicyType.AUTOMATIC}
		hscroll={Gtk.PolicyType.NEVER}
		vexpand={true}
		hexpand={true}
		halign={FILL}
		valign={FILL}
		// heightRequest={winheight(0.85)}
		css={`
			padding: 1rem;
		`}
	>
		<CreateAppGrid appList={appList} />
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
			.filter((c: string) => mainCategories.includes(c))
			.map(substitute)
			.filter((c: string, i: number, arr: string[]) => i === arr.indexOf(c)) ?? []
	);
}

const uniqueCategories = Array.from(new Set(Applications.flatMap((app) => getCategories(app)))).sort((a, b) => a.localeCompare(b));

const allAppsPage = (
	<box name="All Apps" halign={FILL} valign={FILL}>
		{bind(Apps, "list").as((l) => createScrollablePage(l))}
	</box>
);

const categoryPages = uniqueCategories.map((category) => {
	const sortedAppsInCategory = Applications.filter((app) => getCategories(app).includes(category)).sort((a, b) => a.get_name().localeCompare(b.get_name()));

	return (
		<box name={category.toLowerCase()} halign={FILL} valign={FILL}>
			{bind(Apps, "list").as((l) => createScrollablePage(l.filter((app) => getCategories(app).includes(category)).sort((a, b) => a.get_name().localeCompare(b.get_name()))))}
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
				onClick={(_, event) => {
					if (event.button === Gdk.BUTTON_PRIMARY) {
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

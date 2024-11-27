import { Astal, Gtk, Gdk, App } from "astal/gtk3";
import { bind, execAsync, GLib } from "astal";
import AstalApps from "gi://AstalApps";
import Pango from "gi://Pango";
import Icon, { Icons } from "../../lib/icons";
import { winwidth, winheight } from "../../lib/screensizeadjust";
import { Stack, Grid } from "../../Astalified/index";
import Calculator from "./Calculator";
import FavoritesBar from "./FavoritesBar";
import ClickToClose from "../../lib/ClickToClose";

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
const favorites = Applications.filter((app) => ["Zed", "Code - OSS", "deezer-enhanced", "Floorp", "KeePassXC"].includes(app.get_name()));

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
				<box
					vertical={false}
					halign={FILL}
					valign={FILL}
					spacing={5}
					widthRequest={winwidth(0.15)}
				>
					{validIcon && (
						<icon
							icon={iconName}
							halign={CENTER}
							valign={CENTER}
						/>
					)}
					<label
						label={app.get_name()}
						halign={CENTER}
						valign={CENTER}
						ellipsize={Pango.EllipsizeMode.END}
						maxWidthChars={30}
						lines={1}
						wrap={true}
						xalign={0}
						yalign={0}
					/>
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
			.filter((c) => mainCategories.includes(c))
			.map(substitute)
			.filter((c, i, arr) => i === arr.indexOf(c)) ?? []
	);
}

const uniqueCategories = Array.from(new Set(Applications.flatMap((app) => getCategories(app)))).sort((a, b) => a.localeCompare(b));

let query = "";
function Search(query: string) {
	const results = Apps.fuzzy_query(query)

	const searchResultsPage = theStack.get_child_by_name("search_results");

	if (results.length > 0) {
		if (searchResultsPage) {
			theStack.remove(searchResultsPage);
		}
		const newSearchResultsPage = createScrollablePage(results);
		theStack.add_named(newSearchResultsPage, "search_results");
		theStack.set_visible_child_name("search_results");
	} else {
		theStack.set_visible_child_name("All Apps");
	}
}
// function Search(query: string) {
// 	const apps = new AstalApps.Apps();
// 	const results = apps.fuzzy_query(query);


// 	const sortedResults = results.sort((a, b) => apps.fuzzy_score(query, b) - apps.fuzzy_score(query, a));

// 	const searchResultsPage = theStack.get_child_by_name("search_results");

// 	if (sortedResults.length > 0) {
// 		if (searchResultsPage) {
// 			theStack.remove(searchResultsPage);
// 		}
// 		const newSearchResultsPage = createScrollablePage(sortedResults);
// 		theStack.add_named(newSearchResultsPage, "search_results");
// 		theStack.set_visible_child_name("search_results");
// 	} else {
// 		theStack.set_visible_child_name("All Apps");
// 	}
// }


const handleTerminalCommand = (query: string, state: any, self: any) => {
	const command = query.slice(6).trim();

	if (command) {
		const isShiftPressed = state & Gdk.ModifierType.SHIFT_MASK;
		const cmd = isShiftPressed ? `kitty --hold --directory=$HOME -e ${command}` : command;

		execAsync(cmd);

		self.set_text("");
		App.toggle_window("launcher");
	}
};

const handleCalculatorCommand = (query: string) => {
	const expression = query.slice(6).trim();

	if (expression) {
		const existingChild = theStack.get_child_by_name("calculator");
		if (existingChild) {
			theStack.remove(existingChild);
		}

		const calculatorPage = (
			<box vertical={true} spacing={10} hexpand={true} vexpand={true} name="calculator">
				<Calculator expression={expression} />
			</box>
		);

		theStack.add_named(calculatorPage, "calculator");
		theStack.set_visible_child_name("calculator");
	}
};

let currentQuery = "";
const entry = (
	<entry
		className="launcher search"
		placeholder_text="Search apps, TERM:: for teriminal commands, CALC:: for calculator..."
		on_changed={(self) => {
			const query = self.get_text().trim();
			currentQuery = query;
			if (query.startsWith("CALC::") && theStack.get_visible_child_name() !== "calculator") {
				theStack.set_visible_child_name("calculator");
			} else if (!query.startsWith("TERM::") && !query.startsWith("CALC::")) {
				Search(query);
			}
		}}
		onKeyPressEvent={(self, event) => {
			const keyval = event.get_keyval()[1];
			const state = event.get_state()[1];
			const query = currentQuery.trim();

			if (keyval === Gdk.KEY_Return || keyval === Gdk.KEY_KP_Enter) {
				switch (true) {
					case query.startsWith("TERM::"):
						handleTerminalCommand(query, state, self);
						break;
					case query.startsWith("CALC::"):
						handleCalculatorCommand(query);
						if (theStack.get_visible_child_name() !== "calculator") {
							theStack.set_visible_child_name("calculator");
						}
						break;
					default:
						break;
				}
			}
		}}
		hexpand={true}
		vexpand={false}
		halign={FILL}
		valign={CENTER}
		tooltip_text={"Search applications, or use C:: for terminal commands, CALC:: for calculator"}
		activates_default={true}
		focusOnClick={true}
		primary_icon_name={Icon.launcher.search}
		primary_icon_activatable={false}
		primary_icon_sensitive={false}
		secondary_icon_name={Icon.launcher.clear}
		secondary_icon_sensitive={true}
		secondary_icon_activatable={true}
		secondary_icon_tooltip_text={"Clear input"}
	/> as Gtk.Entry
);

entry.connect("icon-press", (_, event) => {
	entry.set_text("");
	theStack.set_visible_child_name("All Apps");
});

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

const theStack = (
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
	/> as Stack
);

const Switcher = () => {
	const handleSwitch = (name: string) => {
		theStack.set_visible_child_name(name);
		query = "";
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

function Launchergrid({ monitor }: { monitor: number }) {
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
						query = "";
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
		query = "";
		entry.set_text("");
		entry.grab_focus();
		theStack.set_visible_child_name("All Apps");
	}
});

export default Launchergrid;

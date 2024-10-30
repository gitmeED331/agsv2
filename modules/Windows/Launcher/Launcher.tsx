import { Astal, Gtk, Gdk, App } from "astal/gtk3";
import { bind, execAsync, GLib } from "astal";
import AstalApps from "gi://AstalApps";
import Pango from "gi://Pango";
import Icon from "../../lib/icons";
import { winwidth, winheight } from "../../lib/screensizeadjust";
import { Stack, Grid } from "../../Astalified/index";
import Calculator from "./Calculator";
import ClickToClose from "../../lib/ClickToClose";
import terminal from "./Terminal"

const Apps = new AstalApps.Apps({
	include_entry: true,
	include_executable: true,
	include_description: true,
});
const Applications = Apps.get_list();

const background = `${SRC}/assets/groot-thin-right.png`;

function createAppGrid(appList) {
	const columnCount = 1;
	appList = appList.sort((a, b) => {
		return a.get_name().localeCompare(b.get_name());
	});

	const grid = (
		<Grid hexpand={true} vexpand={true} halign={Gtk.Align.FILL} valign={Gtk.Align.FILL} visible={true} />)

	appList.forEach((app, index) => {
		const appButton = (
			<button
				className={"launcher app"}
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
				<box vertical={false} halign={Gtk.Align.FILL} valign={Gtk.Align.FILL} spacing={5} widthRequest={winwidth(0.15)}>
					<icon icon={bind(app, "icon_name").as((i) => i) || app.get_icon_name() || Icon.missing} halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} />
					<label label={app.get_name()} halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} ellipsize={Pango.EllipsizeMode.END}
						maxWidthChars={30} lines={1} wrap={true} xalign={0} yalign={0} />
				</box>
			</button>
		);
		grid.attach(appButton, index % columnCount, Math.floor(index / columnCount), 1, 1);
	});

	return grid;
}

const createScrollablePage = (appList) => (
	<scrollable
		visible={true} vscroll={Gtk.PolicyType.AUTOMATIC} hscroll={Gtk.PolicyType.NEVER}
		vexpand={true} hexpand={true} halign={Gtk.Align.FILL} valign={Gtk.Align.FILL}
		heightRequest={winheight(0.9)} css={`padding: 1rem;`}
	>
		{createAppGrid(appList)}
	</scrollable>
);


function getCategories(app) {
	const mainCategories = ["AudioVideo", "Audio", "Video", "Development", "Education", "Game", "Graphics", "Network", "Office", "Science", "Settings", "System", "Utility"];
	const substitute = (cat) => {
		const map = {
			Audio: "Multimedia",
			AudioVideo: "Multimedia",
			Video: "Multimedia",
			Graphics: "Multimedia",
			Science: "Education",
			Settings: "System",
		};
		return map[cat] ?? cat;
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

function getRelevanceScore(appName, appDescription, query) {
	appName = appName.toLowerCase();
	appDescription = appDescription?.toLowerCase() ?? "";
	query = query.toLowerCase();

	let score = 0;

	if (appName === query) score += 5;
	else if (appName.startsWith(query)) score += 3;
	else if (appName.includes(query)) score += 2;

	if (appDescription.includes(query)) score += 1;

	return score;
}

let query = "";

function Search(query) {
	const results = Applications.filter((app) => getRelevanceScore(app.get_name(), app.get_description(), query) > 0);

	const sortedResults = results.sort((a, b) => {
		const scoreA = getRelevanceScore(a.get_name(), a.get_description(), query);
		const scoreB = getRelevanceScore(b.get_name(), b.get_description(), query);
		return scoreB - scoreA;
	});

	let searchResultsPage = theStack.get_child_by_name("search_results");

	if (sortedResults.length > 0) {
		if (searchResultsPage) {
			theStack.remove(searchResultsPage);
		}

		searchResultsPage = createScrollablePage(sortedResults);
		theStack.add_named(searchResultsPage, "search_results");
		theStack.set_visible_child_name("search_results");
	} else {
		theStack.set_visible_child_name("All Apps");
	}
}

// fuzzy search
// function Search(query) {
// 	const lowerCaseQuery = query.toLowerCase();

// 	const nameResults = Apps.fuzzy_query(query);

// 	const descriptionResults = Applications.filter((app) => {
// 		const description = app.get_description()?.toLowerCase() ?? "";
// 		return description.includes(lowerCaseQuery);
// 	});

// 	const combinedResults = Array.from(new Set([...nameResults, ...descriptionResults]));

// 	if (combinedResults.length > 0) {
// 		let searchResultsPage = theStack.get_child_by_name("search_results");

// 		if (searchResultsPage) {
// 			theStack.remove(searchResultsPage);
// 		}

// 		const searchResultsGrid = createScrollablePage(combinedResults);
// 		theStack.add_named(searchResultsGrid, "search_results");
// 		theStack.set_visible_child_name("search_results");
// 	} else {
// 		theStack.set_visible_child_name("All Apps");
// 	}
// }

const handleTerminalCommand = (query, state, self) => {
	const command = query.slice(6).trim();

	if (command) {
		const isShiftPressed = state & Gdk.ModifierType.SHIFT_MASK;
		const cmd = isShiftPressed ? `kitty --hold --directory=$HOME -e ${command}` : command;

		execAsync(cmd);

		self.set_text("");
		App.toggle_window("launcher");
	}
};

const handleCalculatorCommand = (query, self) => {
	const expression = query.slice(6).trim();

	if (expression) {
		const existingChild = theStack.get_visible_child();
		if (existingChild && theStack.get_visible_child_name() === "calculator") {
			theStack.remove(existingChild);
		}

		const calculatorPage = (
			<Grid name="calculator" columnSpacing={10} rowSpacing={10}>
				<Calculator expression={expression} />
			</Grid>
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
			if (query.startsWith("CALC::")) {
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
						handleCalculatorCommand(query, self);
						theStack.set_visible_child_name("calculator");
						break;
					default:
						break;
				}
			}
		}}
		hexpand={true} vexpand={false} halign={Gtk.Align.FILL} valign={Gtk.Align.CENTER}
		tooltip_text={"Search applications, or use C:: for terminal commands, CALC:: for calculator"}
		activates_default={true} focusOnClick={true}
		primary_icon_name={Icon.launcher.search} primary_icon_activatable={false} primary_icon_sensitive={false}
		secondary_icon_name={Icon.launcher.clear} secondary_icon_sensitive={true} secondary_icon_activatable={true} secondary_icon_tooltip_text={"Clear input"}
	/>
);

entry.connect("icon-press", (_, event) => {
	entry.set_text("");
	theStack.set_visible_child_name("All Apps");
});

const allAppsPage = (
	<box key="All Apps" name="All Apps" halign={Gtk.Align.FILL} valign={Gtk.Align.FILL}>
		{createScrollablePage(Applications)}
	</box>
);


const categoryPages = uniqueCategories.map((category) => {
	const sortedAppsInCategory = Applications.filter((app) => getCategories(app).includes(category))
		.sort((a, b) => a.get_name().localeCompare(b.get_name()));

	return (
		<box key={category} name={category.toLowerCase()} halign={Gtk.Align.FILL} valign={Gtk.Align.FILL}>
			{createScrollablePage(sortedAppsInCategory)}
		</box>
	);
});


const theStack = (
	<Stack
		className={"launcher stack"} transitionDuration={300} transitionType={Gtk.StackTransitionType.SLIDE_LEFT_RIGHT}
		halign={Gtk.Align.FILL} valign={Gtk.Align.FILL} hhomogeneous={true} vhomogeneous={false} visible={true} hexpand={false} vexpand={true}
	/>
)

{
	[allAppsPage, ...categoryPages, terminal()].forEach((page) => {
		theStack.add_named(page, page.name);
	})
}

const Switcher = () => {
	const handleSwitch = (name) => {
		theStack.set_visible_child_name(name);
		query = "";
		entry.set_text("");
	};

	const allAppsButton = (
		<button
			className={bind(theStack, "visible_child_name").as((name) => (name === "All Apps" ? "active" : ""))}
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
				className={bind(theStack, "visible_child_name").as((name) => (name === category.toLowerCase() ? "active" : ""))}
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

	const terminalButton = (
		<button
			className={bind(theStack, "visible_child_name").as((name) => (name === "terminal" ? "active" : ""))}
			onClick={(_, event) => {
				if (event.button === Gdk.BUTTON_PRIMARY) {
					handleSwitch("Terminal");
				}
			}}
			onKeyPressEvent={(_, event) => {
				if (event.get_keyval()[1] === Gdk.KEY_Return) {
					handleSwitch("Terminal");
				}
			}}
			tooltip_text={"Terminal"}
		>
			<icon icon={Icon.launcher.hyprland} />
		</button>
	)
	return (
		<box className={"launcher switcher"} vertical halign={Gtk.Align.CENTER} valign={Gtk.Align.FILL} >
			{[allAppsButton, categoryButtons, terminalButton]}
		</box>
	);
};

function Launcher({ monitor }: { monitor: number }) {
	const contentGrid = (<Grid
		className={"launcher contentgrid"} halign={Gtk.Align.FILL} valign={Gtk.Align.FILL}
		hexpand={true} vexpand={true} visible={true}
		css={`background-image: url('${background}'); 
				background-size: contain;
				background-repeat: no-repeat;
				background-position: center;
				background-color: rgba(0, 0, 0, 1);`}
	/>)

	contentGrid.attach(entry, 0, 0, 2, 1);
	contentGrid.attach(Switcher(), 0, 1, 1, 1);
	contentGrid.attach(theStack, 1, 1, 1, 1);

	const masterGrid = <Grid
		className={"launcher containergrid"} halign={Gtk.Align.FILL} valign={Gtk.Align.FILL}
		hexpand={true} vexpand={true} visible={true}
	/>

	masterGrid.attach(contentGrid, 1, 1, 1, 1);
	masterGrid.attach(ClickToClose(1, 0.8, 0.8, "launcher"), 2, 1, 1, 1);

	return (
		<window
			name={"launcher"}
			className={"launcher window"}
			anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.BOTTOM | Astal.WindowAnchor.LEFT | Astal.WindowAnchor.RIGHT}
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
		query = ""
		entry.set_text("")
		theStack.set_visible_child_name("All Apps")
	}
})

export default Launcher
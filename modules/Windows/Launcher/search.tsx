import { Gtk, Gdk, App } from "astal/gtk3";
import { execAsync, Variable } from "astal";
import AstalApps from "gi://AstalApps";
import Icon, { Icons } from "../../lib/icons";
import { theStack, createScrollablePage } from "./stackandswitcher";
import Calculator from "./Calculator";

const Apps = new AstalApps.Apps({
	nameMultiplier: 2,
	entryMultiplier: 0.05,
	executableMultiplier: 0.05,
	descriptionMultiplier: 0.1,
	keywordsMultiplier: 0.1,
	minScore: 0.75,
});

export let query = new Variable<string>("");

function Search(query: string) {
	const results = Apps.fuzzy_query(query);

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

const handleTerminalCommand = (query: string, state: any, self: any) => {
	const command = query.slice(6).trim();

	if (command) {
		const isShiftPressed = state & Gdk.ModifierType.SHIFT_MASK;
		const cmd = isShiftPressed ? `alacritty --hold -e ${command}` : command;

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
		tooltip_text={"Search applications, or use TERM:: for terminal commands, CALC:: for calculator"}
		activates_default={true}
		focusOnClick={true}
		primary_icon_name={Icon.launcher.search}
		primary_icon_activatable={false}
		primary_icon_sensitive={false}
		secondary_icon_name={Icon.launcher.clear}
		secondary_icon_sensitive={true}
		secondary_icon_activatable={true}
		secondary_icon_tooltip_text={"Clear input"}
	/>
) as Gtk.Entry;

entry.connect("icon-press", (_, event) => {
	entry.set_text("");
	theStack.set_visible_child_name("All Apps");
});

export default entry;

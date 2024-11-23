import { Astal, Gtk, Gdk, App } from "astal/gtk3";
import { bind, execAsync, GLib } from "astal";
import AstalApps from "gi://AstalApps";
import Pango from "gi://Pango";
import Icon, { Icons } from "../../lib/icons";
import { winwidth, winheight } from "../../lib/screensizeadjust";
import { Stack, Grid } from "../../Astalified/index";
import Calculator from "./Calculator";
import { createScrollablePage } from "./ScrollablePage";

let currentQuery = "";

export function createSearchEntry(theStack: Stack) {
    function search(query: string) {
        const apps = new AstalApps.Apps();
        const results = apps.fuzzy_query(query);

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

    function handleTerminalCommand(query: string, state: any, self: any) {
        const command = query.slice(6).trim();
        if (command) {
            const isShiftPressed = state & Gdk.ModifierType.SHIFT_MASK;
            const cmd = isShiftPressed
                ? `kitty --hold --directory=$HOME -e ${command}`
                : command;

            execAsync(cmd);

            self.set_text("");
            App.toggle_window("launcher");
        }
    }

    function handleCalculatorCommand(query: string, self: any) {
        const expression = query.slice(6).trim();

        if (expression) {
            const existingChild = theStack.get_visible_child();
            if (
                existingChild &&
                theStack.get_visible_child_name() === "calculator"
            ) {
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
    }

    const entry = (
        <entry
            className="launcher search"
            placeholder_text="Search apps, TERM:: for terminal commands, CALC:: for calculator..."
            on_changed={(self) => {
                const query = self.get_text().trim();
                currentQuery = query;
                if (query.startsWith("CALC::")) {
                    theStack.set_visible_child_name("calculator");
                } else if (!query.startsWith("TERM::") && !query.startsWith("CALC::")) {
                    search(query);
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
            hexpand={true}
            vexpand={false}
            halign={Gtk.Align.FILL}
            valign={Gtk.Align.CENTER}
            tooltip_text={
                "Search applications, or use TERM:: for terminal commands, CALC:: for calculator"
            }
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
    );

    entry.connect("icon-press", (_, event) => {
        entry.set_text("");
        theStack.set_visible_child_name("All Apps");
    });

    return entry;
}

import { Grid } from "../../Astalified/index";
import { Gtk } from "astal/gtk4";
import { execAsync, readFile, writeFile, GLib } from "astal";

const HISTORY_FILE_PATH = "/tmp/calculator_history.txt";

type CalculatorProps = {
    expression: string;
};

const createButton = (content: string) => {
    const button = <button
        label={content}
        hexpand={true}
        halign={Gtk.Align.START}
    />

    button.attribute = { content }; // Store content as an attribute for filtering
    return button;
};

export const Calculator = ({ expression }: CalculatorProps) => {
    const resultLabel = <label label="" hexpand={true} vexpand={false} halign={Gtk.Align.START} />;
    const list = <box vertical={true} spacing={5} hexpand={true} vexpand={true}></box>;
    let historyEntries: string[] = [];

    const preprocessExpression = (exp: string): string => {
        // Add explicit multiplication where needed, e.g., 5(7-5) => 5*(7-5)
        return exp.replace(/(\d)(\()/g, '$1*(') // Digit followed by parentheses
            .replace(/(\))(\d)/g, ')*$2'); // Parentheses followed by digit
    };

    const evaluateExpression = async (exp: string): Promise<string> => {
        try {
            const processedExp = preprocessExpression(exp);
            // Use calc to evaluate the processed expression
            const command = `calc -p "${processedExp}"`; // -p flag prints the result only
            const result = await execAsync(command);

            // Trim and clean up the output, return only the result
            const cleanedResult = result.trim();
            return cleanedResult;
        } catch (e) {
            return "Error";
        }
    };

    const loadHistory = () => {
        try {
            if (!GLib.file_test(HISTORY_FILE_PATH, GLib.FileTest.EXISTS)) {
                writeFile(HISTORY_FILE_PATH, "");
            }

            const content = readFile(HISTORY_FILE_PATH);
            historyEntries = content.split("\n").filter(line => line.trim() !== "");
            updateHistoryList();
        } catch (e) {
            historyEntries = [];
        }
    };

    const saveHistory = () => {
        const content = historyEntries.join("\n");
        writeFile(HISTORY_FILE_PATH, content);
    };

    const updateHistoryList = () => {
        // Clear existing items
        while (list.get_children().length > 0) {
            const child = list.get_children()[0];
            list.remove(child);
        }

        historyEntries.forEach((entry) => {
            const button = createButton(entry);
            list.pack_start(button, false, false, 0);
        });

        list.show_all();
    };

    const clearHistory = () => {
        historyEntries = [];
        writeFile(HISTORY_FILE_PATH, ""); // Clear the file
        updateHistoryList();
    };

    const addHistoryEntry = async (expr: string) => {
        try {
            if (expr.toUpperCase().trim() === "CLEAR") {
                clearHistory();
                resultLabel.set_text("History cleared");
                return;
            }

            const result = await evaluateExpression(expr);
            // Display the calculated result in the result label
            resultLabel.set_text(result);
            const newEntry = `${expr} = ${result}`;
            historyEntries.unshift(newEntry); // Add the newest entry at the beginning
            if (historyEntries.length > 10) {
                historyEntries.pop(); // Limit history to the latest 10 entries
            }
            updateHistoryList();
            saveHistory();
        } catch (error) {
            console.error("Error adding history entry:", error);
        }
    };

    // Initial load of history
    loadHistory();

    // Evaluate the expression and add it to history
    addHistoryEntry(expression).catch((error) => {
        console.error("Error in addHistoryEntry:", error);
    });

    return (
        <Grid name="calculator" columnSpacing={5} rowSpacing={5} marginTop={10} marginBottom={10} marginStart={10} marginEnd={10}>
            <box vertical={true} spacing={10} hexpand={true} vexpand={true}>
                <box vertical={false} hexpand={true} vexpand={false} halign={Gtk.Align.START}>
                    {resultLabel}
                </box>
                {list}
            </box>
        </Grid>
    );
};

export default Calculator;

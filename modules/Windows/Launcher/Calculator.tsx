/**
 * MIT License
 *
 * Copyright (c) 2024 TopsyKrets
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction...
 *
 */

import { Grid } from "../../Astalified/index";
import { Gtk } from "astal/gtk3";
import { execAsync, readFile, writeFile, GLib } from "astal";

const HISTORY_FILE_PATH = "/tmp/calculator_history.txt";

type CalculatorProps = {
	expression: string;
};

const createButton = (content: string) => {
	const button = <button label={content} hexpand={true} halign={Gtk.Align.START} />;

	button.attribute = { content };
	return button;
};

export const Calculator = ({ expression }: CalculatorProps) => {
	const resultLabel = <label label="" hexpand={true} vexpand={false} halign={Gtk.Align.START} />;
	const list = <box vertical={true} spacing={5} hexpand={true} vexpand={true}></box>;
	let historyEntries: string[] = [];

	const preprocessExpression = (exp: string): string => {
		return exp.replace(/(\d)(\()/g, "$1*(").replace(/(\))(\d)/g, ")*$2");
	};

	const evaluateExpression = async (exp: string): Promise<string> => {
		try {
			const processedExp = preprocessExpression(exp);
			const command = `calc -p "${processedExp}"`;
			const result = await execAsync(command);

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
			historyEntries = content.split("\n").filter((line) => line.trim() !== "");
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
			resultLabel.set_text(result);
			const newEntry = `${expr} = ${result}`;
			historyEntries.unshift(newEntry);
			if (historyEntries.length > 10) {
				historyEntries.pop();
			}
			updateHistoryList();
			saveHistory();
		} catch (error) {
			console.error("Error adding history entry:", error);
		}
	};

	loadHistory();

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

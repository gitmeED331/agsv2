/**
 * MIT License
 *
 * Copyright (c) 2024 TopsyKrets
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction...
 *
 */

import { FlowBox, FlowBoxChild } from "../../Astalified/index";
import { Gtk } from "astal/gtk3";
import { execAsync, readFile, writeFile, GLib } from "astal";

const HISTORY_FILE_PATH = "/tmp/calculator_history.txt";

type CalculatorProps = {
	expression: string;
};

const createButton = (content: string) => {
	const button = <button label={content} hexpand={true} halign={Gtk.Align.START} onClick={() => execAsync(`wl-copy "${content}"`)} />;

	button.attribute = { content };
	return button;
};

export const Calculator = ({ expression }: CalculatorProps) => {
	const resultLabel = <entry placeholder_text={"0"} editable={false} can_focus={false} className={"calculator result"} hexpand={true} vexpand={false} halign={Gtk.Align.START} />;

	const list = (
		<FlowBox
			selection_mode={Gtk.SelectionMode.NONE}
			halign={Gtk.Align.START}
			valign={Gtk.Align.START}
			hexpand={true}
			vexpand={true}
			rowSpacing={5}
			columnSpacing={5}
			vertical
		/>
	);
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
			list.add(button);
		});

		list.show_all();
	};

	const clearHistory = () => {
		historyEntries = [];
		writeFile(HISTORY_FILE_PATH, "");
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
		<box
			name="calculator"
			vertical
			hexpand={true}
			vexpand={true}
			marginTop={10}
			marginBottom={10}
			marginStart={10}
			marginEnd={10}
			spacing={10}
		>
			{resultLabel}
			{list}
		</box >
	);
};

export default Calculator;

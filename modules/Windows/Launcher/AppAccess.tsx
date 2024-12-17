import AstalApps from "gi://AstalApps";

export const Apps = new AstalApps.Apps({
	nameMultiplier: 2,
	entryMultiplier: 0.05,
	executableMultiplier: 0.05,
	descriptionMultiplier: 0.1,
	keywordsMultiplier: 0.1,
	minScore: 0.75,
});

export const Applications: AstalApplication[] = Apps.get_list();

export interface AstalApplication {
	get_icon_name: () => string;
	get_name: () => string;
	get_description: () => string;
	launch: () => void;
}

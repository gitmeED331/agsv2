export default function TrimTrackTitle(value: string) {
	if (!value) return "";
	const cleanPatterns = [
		/【[^】]*】/, // Touhou n weeb stuff
		" [FREE DOWNLOAD]", // F-777
		" (Radio Version)",
		" (Album Version)",
		" (Cafe Session)",
		" (International Version)",
		" (Remastered)",
	];
	cleanPatterns.forEach((expr) => (value = value.replace(expr, "")));
	return value;
}

/**
 * MIT License
 *
 * Copyright (c) 2024 TopsyKrets
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction...
 *
 */

import { Astal } from "astal/gtk4";
import { bind } from "astal";
import Mpris from "gi://AstalMpris";

const mpris = Mpris.get_default();
const player = Mpris.Player.new("Deezer");

function TrimTrackTitle(title: string): string {
	if (!title) return "";
	const cleanPatterns = [
		/【[^】]*】/, // Remove brackets with content for specific tracks
		" [FREE DOWNLOAD]", // Specific pattern for F-777
		" (Radio Version)",
		" (Album Version)",
		" (Cafe Session)",
		" (International Version)",
		" (Remastered)",
	];
	cleanPatterns.forEach((expr) => {
		if (typeof expr === "string") {
			title = title.replace(expr, "");
		} else {
			title = title.replace(expr, "");
		}
	});
	return title;
}

export default TrimTrackTitle;

import { Astal, Gtk } from "astal/gtk3";

declare global {
	// Alignments
	const START: number;
	const CENTER: number;
	const END: number;
	const FILL: number;
	// Anchors
	const TOP: number;
	const BOTTOM: number;
	const LEFT: number;
	const RIGHT: number;
	// Stack Transitions
	const STACK_SLIDE_LEFT_RIGHT: number;
	const STACK_SLIDE_UP_DOWN: number;
	const STACK_CROSSFADE: number;
	// Revealer Transitions
	const REVEAL_SLIDE_LEFT: number;
	const REVEAL_SLIDE_RIGHT: number;
	const REVEAL_SLIDE_UP: number;
	const REVEAL_SLIDE_DOWN: number;
	const REVEAL_CROSSFADE: number;
	// Layers
	const OVERLAY_LAYER: number;
	const TOP_LAYER: number;
	const BOTTOM_LAYER: number;
	const BACKGROUND_LAYER: number;
}

Object.assign(globalThis, {
	// Alignments
	START: Gtk.Align.START,
	CENTER: Gtk.Align.CENTER,
	END: Gtk.Align.END,
	FILL: Gtk.Align.FILL,
	// Anchors
	TOP: Astal.WindowAnchor.TOP,
	BOTTOM: Astal.WindowAnchor.BOTTOM,
	LEFT: Astal.WindowAnchor.LEFT,
	RIGHT: Astal.WindowAnchor.RIGHT,
	// Stack Transitions
	STACK_SLIDE_LEFT_RIGHT: Gtk.StackTransitionType.SLIDE_LEFT_RIGHT,
	STACK_SLIDE_UP_DOWN: Gtk.StackTransitionType.SLIDE_UP_DOWN,
	STACK_CROSSFADE: Gtk.StackTransitionType.CROSSFADE,
	// Revealer Transitions
	REVEAL_SLIDE_LEFT: Gtk.RevealerTransitionType.SLIDE_LEFT,
	REVEAL_SLIDE_RIGHT: Gtk.RevealerTransitionType.SLIDE_RIGHT,
	REVEAL_SLIDE_UP: Gtk.RevealerTransitionType.SLIDE_UP,
	REVEAL_SLIDE_DOWN: Gtk.RevealerTransitionType.SLIDE_DOWN,
	REVEAL_CROSSFADE: Gtk.RevealerTransitionType.CROSSFADE,
	// Layers
	OVERLAY_LAYER: Astal.Layer.OVERLAY,
	TOP_LAYER: Astal.Layer.TOP,
	BOTTOM_LAYER: Astal.Layer.BOTTOM,
	BACKGROUND_LAYER: Astal.Layer.BACKGROUND,
});

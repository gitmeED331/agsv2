import { Astal, Gtk, Gdk, Variable } from "astal";

export default function StackSwitcher({ children }: { children?: Array<JSX.Element> }) {
	// if (children!.some((ch) => !ch.name)) throw Error("Every child must have a name");

	const visible = Variable(children![0].name);

	return (
		<box>
			<box vertical={true}>
				{children!.map((ch) => (
					<button onClick={() => visible.set(ch.name)}>{ch.name}</button>
				))}
			</box>
			<stack visible_child_name={visible()}>{children}</stack>
		</box>
	);
}

/*
example usage:
export default function Bar() {
  return <window>
	<StackSwitcher>
	  <box name="child1">child1</box>
	  <box name="child2">child2</box>
	  <box name="child3">child3</box>
	</StackSwitcher>
  </window>
}
*/

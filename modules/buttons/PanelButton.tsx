import options from "../../options"
import { ButtonProps } from "../../types/widgets/button"
import { Astal } from "astal"

type PanelButtonProps = ButtonProps & {
    window?: string,
    flat?: boolean
}

export default ({
    window = "",
    flat,
    child,
    setup,
    ...rest
}: PanelButtonProps) => {
    <button
        setup={(self) => {
            let open = false;

            self.toggleClassName("panel-button");
            self.toggleClassName(window);

            self.hook(options.bar.flatButtons, () => {
                self.toggleClassName("flat", flat ?? options.bar.flatButtons.value);
            });

            self.hook(App, (_, win, visible) => {
                if (win !== window) return;

                if (open !== visible) {
                    open = visible;
                    self.toggleClassName("active", visible);
                }
            });

            if (setup) setup(self);
        }}
        {...rest}
    >
        <box>{child}</box>
    </button>;
}

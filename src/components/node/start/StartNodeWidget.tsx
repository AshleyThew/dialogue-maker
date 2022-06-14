import { EditableInput } from "../../editor/Inputs";
import { BaseNodeProps, BaseNodeWidget } from "../base";
import { StartNodeModel } from "./StartNodeModel";

export interface StartNodeProps extends BaseNodeProps<StartNodeModel> {}

export class StartNodeWidget extends BaseNodeWidget<StartNodeProps> {
	render() {
		return super.construct(undefined);
	}

	renderHeader(): JSX.Element {
		const style = { width: "100%", color: "black" };
		if (!this.props.node.getOptions().editableTitle) {
			style["background"] = "transparent";
		}
		return (
			<>
				<EditableInput
					style={style}
					value={this.props.node.getOptions().title}
					setValue={(value, target) => {
						const starts = this.props.engine
							.getModel()
							.getNodes()
							.filter((val) => val instanceof StartNodeModel) as StartNodeModel[];
						const exists = starts.filter((val) => val.getOptions().title === value).length !== 0;
						if (value.length === 0 || exists) {
							var nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
							nativeInputValueSetter.call(target, this.props.node.getOptions().title);
							var ev2 = new Event("input", { bubbles: true });
							target.dispatchEvent(ev2);
						} else {
							this.props.node.getOptions().title = value;
						}
					}}
					editable={this.props.node.getOptions().editableTitle}
				/>
				{super.renderOutPorts(true)}
			</>
		);
	}
}

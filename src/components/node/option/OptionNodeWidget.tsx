import * as React from "react";
import { BaseNodeProps, BaseNodeWidget } from "../base";
import { OptionNodeModel } from "./OptionNodeModel";
import { EditableInput } from "../../editor/Inputs";

export interface OptionNodeProps extends BaseNodeProps<OptionNodeModel> {}

export class OptionNodeWidget extends BaseNodeWidget<OptionNodeProps> {
	render() {
		return super.construct(
			<div style={{ color: "black" }}>
				<EditableInput value="IF" setValue={(value) => console.log(value)} />
				<EditableInput style={{ marginLeft: "5px" }} value="Text" setValue={(value) => console.log(value)} />
			</div>
		);
	}
}

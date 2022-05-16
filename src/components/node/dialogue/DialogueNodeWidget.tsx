import * as React from "react";
import { EditableText } from "../../editor/Inputs";
import { BaseNodeProps, BaseNodeWidget } from "../base";
import { DialogueNodeModel } from "./DialogueNodeModel";

export interface DialogueNodeProps extends BaseNodeProps<DialogueNodeModel> {}

export class DialogueNodeWidget extends BaseNodeWidget<DialogueNodeProps> {
	render() {
		return super.construct(
			<div style={{ color: "black" }}>
				<EditableText value={this.props.node.getText()} setValue={(value) => (this.props.node.getOptions().text = value)} />
			</div>
		);
	}
}

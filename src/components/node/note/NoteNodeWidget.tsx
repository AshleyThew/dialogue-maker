import * as React from "react";
import { EditableText } from "../../editor/Inputs";
import { BaseNodeProps, BaseNodeWidget } from "../base";
import { NoteNodeModel } from "./NoteNodeModel";

export interface NoteNodeProps extends BaseNodeProps<NoteNodeModel> {}

export class NoteNodeWidget extends BaseNodeWidget<NoteNodeProps> {
	render() {
		return super.construct(
			<div style={{ color: "black" }}>
				<EditableText value={this.props.node.getText()} setValue={(value) => (this.props.node.getOptions().text = value)} />
			</div>
		);
	}
}

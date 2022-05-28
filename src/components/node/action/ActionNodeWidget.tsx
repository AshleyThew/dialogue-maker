import * as React from "react";
import { BaseNodeProps, BaseNodeWidget } from "../base";
import { ActionNodeModel } from "./ActionNodeModel";
import { ActionBlock } from "../../editor/Action";

export interface ActionNodeProps extends BaseNodeProps<ActionNodeModel> {}

export class ActionNodeWidget extends BaseNodeWidget<ActionNodeProps> {
	render() {
		return super.construct(
			<>
				<div style={{ color: "black", display: "flex", justifyContent: "space-between" }}>
					<ActionBlock option={this.props.node.getOptions().actions} remove={undefined} />
				</div>
			</>
		);
	}
}

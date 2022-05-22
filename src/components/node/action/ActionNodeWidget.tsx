import * as React from "react";
import * as _ from "lodash";
import { BaseNodeProps, BaseNodeWidget, S } from "../base";
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

	renderInPorts(): JSX.Element {
		return (
			<div style={{ display: "flex", alignItems: "center" }}>
				{this.props.node.getInPorts().length && (
					<S.PortIn engine={this.props.engine}>
						<S.PortsContainer>{_.map(this.props.node.getInPorts(), this.generatePort)}</S.PortsContainer>
					</S.PortIn>
				)}
			</div>
		);
	}
}

import * as _ from "lodash";
import { BaseNodeProps, BaseNodeWidget, S } from "../base";
import { ConditionNodeModel } from "./ConditionNodeModel";
import { ConditionBlock } from "../../editor/Condition";

export interface ConditionNodeProps extends BaseNodeProps<ConditionNodeModel> {}

export class ConditionNodeWidget extends BaseNodeWidget<ConditionNodeProps> {
	render() {
		return super.construct(
			<>
				<div style={{ color: "black", display: "flex", justifyContent: "space-between" }}>
					<ConditionBlock option={this.props.node.getOptions().conditions} remove={undefined} allowActionable={true} />
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

import { BaseNodeProps, BaseNodeWidget } from "../base";
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

	renderOutPorts(required?: boolean): JSX.Element {
		return super.renderOutPorts(true);
	}
}

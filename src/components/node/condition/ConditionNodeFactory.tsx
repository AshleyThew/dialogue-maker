import { ConditionNodeModel } from "./ConditionNodeModel";
import { ConditionNodeWidget } from "./ConditionNodeWidget";
import { BaseNodeFactory } from "../base";

export class ConditionNodeFactory extends BaseNodeFactory<ConditionNodeModel> {
	constructor() {
		super("condition", "Condition", "#02630ae6");
	}

	generateReactWidget(event): JSX.Element {
		return <ConditionNodeWidget engine={this.engine} node={event.model} />;
	}

	generateModel(event): ConditionNodeModel {
		return new ConditionNodeModel({ color: this.options.color });
	}
}

export const ConditionFactory = new ConditionNodeFactory();

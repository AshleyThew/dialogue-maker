import { ActionNodeModel } from "./ActionNodeModel";
import { ActionNodeWidget } from "./ActionNodeWidget";
import { BaseNodeFactory } from "../base";

export class ActionNodeFactory extends BaseNodeFactory<ActionNodeModel> {
	constructor() {
		super("action", "Action", "#3e077e");
	}

	generateReactWidget(event): JSX.Element {
		return <ActionNodeWidget engine={this.engine} node={event.model} />;
	}

	generateModel(event): ActionNodeModel {
		return new ActionNodeModel({ color: this.options.color });
	}
}

export const AcitonFactory = new ActionNodeFactory();

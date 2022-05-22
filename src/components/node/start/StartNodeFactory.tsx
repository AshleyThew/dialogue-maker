import { StartNodeModel } from "./StartNodeModel";
import { StartNodeWidget } from "./StartNodeWidget";
import { BaseNodeFactory } from "../base";

export class StartNodeFactory extends BaseNodeFactory<StartNodeModel> {
	constructor() {
		super("start", "Start", "#02630a");
	}

	generateReactWidget(event): JSX.Element {
		return <StartNodeWidget engine={this.engine} node={event.model} />;
	}

	generateModel(event): StartNodeModel {
		return new StartNodeModel({ color: this.options.color });
	}
}

export const StartFactory = new StartNodeFactory();

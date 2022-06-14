import { SwitchNodeModel } from "./SwitchNodeModel";
import { SwitchNodeWidget } from "./SwitchNodeWidget";
import { BaseNodeFactory } from "../base";

export class SwitchNodeFactory extends BaseNodeFactory<SwitchNodeModel> {
	constructor() {
		super("switch", "Switch", "#db8c16");
	}

	generateReactWidget(event): JSX.Element {
		return <SwitchNodeWidget engine={this.engine} node={event.model} />;
	}

	generateModel(event): SwitchNodeModel {
		return new SwitchNodeModel({ color: this.options.color });
	}
}

export const SwitchFactory = new SwitchNodeFactory();

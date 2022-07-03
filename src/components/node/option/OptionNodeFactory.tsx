import { OptionNodeModel } from "./OptionNodeModel";
import { OptionNodeWidget } from "./OptionNodeWidget";
import { BaseNodeFactory } from "../base/";

export class OptionNodeFactory extends BaseNodeFactory<OptionNodeModel> {
	constructor() {
		super("option", "Option", "#0756b1e6");
	}

	generateReactWidget(event): JSX.Element {
		return <OptionNodeWidget engine={this.engine} node={event.model} />;
	}

	generateModel(event): OptionNodeModel {
		return new OptionNodeModel({ color: this.options.color });
	}
}

export const OptionFactory = new OptionNodeFactory();

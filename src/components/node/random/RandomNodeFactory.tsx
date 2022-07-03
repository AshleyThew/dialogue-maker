import { RandomNodeModel } from "./RandomNodeModel";
import { RandomNodeWidget } from "./RandomNodeWidget";
import { BaseNodeFactory } from "../base";

export class RandomNodeFactory extends BaseNodeFactory<RandomNodeModel> {
	constructor() {
		super("random", "Random", "#bdce26e6");
	}

	generateReactWidget(event): JSX.Element {
		return <RandomNodeWidget engine={this.engine} node={event.model} />;
	}

	generateModel(event): RandomNodeModel {
		return new RandomNodeModel({ color: this.options.color });
	}
}

export const RandomFactory = new RandomNodeFactory();

import { BaseNodeModel, BaseNodeModelGenerics, BaseNodeModelOptions } from "./BaseNodeModel";
import { AbstractReactFactory } from "@projectstorm/react-canvas-core";
import { DiagramEngine } from "@projectstorm/react-diagrams-core";

export abstract class BaseNodeFactory<T extends BaseNodeModel<BaseNodeModelGenerics<BaseNodeModelOptions>>> extends AbstractReactFactory<
	T,
	DiagramEngine
> {
	public options: { id: string; name: string; color: string };

	constructor(id: string, name: string, color: string) {
		super(id);
		this.options = { id: id, name: name, color: color };
	}
}

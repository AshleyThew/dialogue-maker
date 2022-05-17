import * as _ from "lodash";
import { DefaultPortModel } from "@projectstorm/react-diagrams";
import { DeserializeEvent } from "@projectstorm/react-canvas-core";
import { BaseNodeModel, BaseNodeModelGenerics, BaseNodeModelOptions } from "../base";
import { Conditional } from "../../editor/Condition";

export interface ConditionNodeModelOptions extends BaseNodeModelOptions {
	conditions?: Conditional[];
}

export interface ConditionNodeModelGenerics extends BaseNodeModelGenerics<ConditionNodeModelOptions> {}

export class ConditionNodeModel extends BaseNodeModel<ConditionNodeModelGenerics> {
	constructor(options?: ConditionNodeModelOptions);
	constructor(options: any = {}, defaultConditions?: Conditional[]) {
		if (typeof options === "string") {
			options = {
				title: options,
				conditions: defaultConditions,
			};
		}
		super({
			type: "condition",
			title: "Condition",
			editableTitle: false,
			inputs: 1,
			outputs: 0,
			conditions: defaultConditions || [new Conditional()],
			...options,
		});
		this.addOutPort("true", 0);
		this.addOutPort("false", 1);
	}

	doClone(lookupTable: {}, clone: any): void {
		super.doClone(lookupTable, clone);
	}

	deserialize(event: DeserializeEvent<this>) {
		super.deserialize(event);
		this.options.conditions = event.data.conditions.map((condition) => {
			return new Conditional(condition.conditions, condition.args);
		});
	}

	serialize(): any {
		return {
			...super.serialize(),
			conditions: _.map(this.options?.conditions, (condition) => {
				return condition.serialize();
			}),
		};
	}

	getInPorts(): DefaultPortModel[] {
		return this.portsIn;
	}

	getOutPorts(): DefaultPortModel[] {
		return this.portsOut;
	}
}

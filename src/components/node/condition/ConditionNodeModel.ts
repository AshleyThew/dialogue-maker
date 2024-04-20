import { DeserializeEvent } from "@projectstorm/react-canvas-core";
import { BaseNodeModel, BaseNodeModelGenerics, BaseNodeModelOptions } from "../base";
import { ConditionProps, Conditions } from "../../editor/Condition";
import { DialogueContextInterface } from "../../DialogueContext";
import { ConditionFactory } from "./ConditionNodeFactory";
import { parse } from "secure-json-parse";

export interface ConditionNodeModelOptions extends BaseNodeModelOptions {
	conditions?: Conditions;
}

export interface ConditionNodeModelGenerics extends BaseNodeModelGenerics<ConditionNodeModelOptions> {}

export class ConditionNodeModel extends BaseNodeModel<ConditionNodeModelGenerics> {
	constructor(options?: ConditionNodeModelOptions);
	constructor(options: any = {}, defaultConditions?: Conditions[]) {
		if (typeof options === "string") {
			options = {
				conditions: defaultConditions,
			};
		}
		super({
			type: "condition",
			title: "Condition",
			editableTitle: false,
			inputs: 1,
			outputs: 0,
			conditions: defaultConditions || new Conditions(),
			...options,
		});
	}

	setupPorts(): void {
		super.setupPorts();
		this.addOutPort("true", 0);
		this.addOutPort("false", 1);
	}

	doClone(lookupTable: {}, clone: any): void {
		super.doClone(lookupTable, clone);
		const data = parse(JSON.stringify(clone.options.conditions));
		clone.options.conditions = new Conditions(data.conditions, data.args, data.ors, data.negates);
	}

	deserialize(event: DeserializeEvent<this>) {
		super.deserialize(event);
		this.options.conditions = new Conditions(event.data.conditions.conditions, event.data.conditions.args, event.data.conditions.ors, event.data.conditions.negates);
		this.options.color = ConditionFactory.options.color;
	}

	serialize(): any {
		return {
			...super.serialize(),
			conditions: this.options.conditions.serialize(),
		};
	}

	fix(context: DialogueContextInterface) {
		const { conditions } = context;
		const { conditions: conds } = this.options;
		conds.conditions.forEach((cond, index) => {
			const condition: ConditionProps = conditions.find((condition) => condition.condition === cond);
			while (condition && condition.variables.length && conds.args[index].length < condition.variables.length) {
				conds.args[index].push("");
			}
		});
	}
}

import * as React from "react";
import { ActionProps } from "./editor/Action";
import { ConditionProps } from "./editor/Condition";

export interface DialogueContextInterface {
	conditions: ConditionProps[];
	keys: string[];
	actions: ActionProps[];
	actionKeys: string[];
	sources: { [key: string]: string[] };
}

export const DialogueContext = React.createContext<DialogueContextInterface | null>(null);

const conditions = [
	{ condition: "", variables: [] },
	{
		condition: "hasItem",
		variables: [
			{ source: "items", type: "list", placeholder: "item" },
			{ type: "number", placeholder: "amount" },
		],
	},
	{
		condition: "takeItem",
		variables: [
			{ source: "items", type: "list", placeholder: "item" },
			{ type: "number", placeholder: "amount" },
		],
		actionable: true,
	},
	{ condition: "other", variables: [] },
] as ConditionProps[];

const actions = [
	{ action: "", variables: [] },
	{
		action: "takeItem",
		variables: [
			{ source: "items", type: "list", placeholder: "item" },
			{ type: "number", placeholder: "amount" },
		],
	},
	{
		action: "giveItem",
		variables: [
			{ source: "items", type: "list", placeholder: "item" },
			{ type: "number", placeholder: "amount" },
		],
	},
] as ActionProps[];

const sources: { [key: string]: string[] } = {
	items: ["COINS", "FEATHERS", "IRON_BAR", "AIR_RUNE"],
};

export const defaultDialogueContext: DialogueContextInterface = {
	conditions: conditions,
	keys: conditions.map((condition) => condition.condition),
	actions: actions,
	actionKeys: actions.map((action) => action.action),
	sources: sources,
};

export const DialogueContextProvider = (props) => {
	return <DialogueContext.Provider value={defaultDialogueContext}>{props.children}</DialogueContext.Provider>;
};

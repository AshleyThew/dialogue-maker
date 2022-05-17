import * as React from "react";
import { ConditionProps } from "./editor/Condition";

export interface DialogueContextInterface {
	conditions: ConditionProps[];
	keys: string[];
	sources: { [key: string]: string[] };
}

export const DialogueContext = React.createContext<DialogueContextInterface | null>(null);

const conditions = [
	{ condition: "", variables: [] },
	{ condition: "hasItem", variables: [{ source: "items", type: "list" }, { type: "number" }] },
	{ condition: "hasItemTake", variables: [{ source: "items", type: "list" }, { type: "number" }], actionable: true },
	{ condition: "other", variables: [] },
] as ConditionProps[];

const sources: { [key: string]: string[] } = {
	items: ["", "COINS", "FEATHERS", "IRON_BAR", "AIR_RUNE"],
};

export const defaultDialogueContext: DialogueContextInterface = {
	conditions: conditions,
	keys: conditions.map((condition) => condition.condition),
	sources: sources,
};

export const DialogueContextProvider = (props) => {
	return <DialogueContext.Provider value={defaultDialogueContext}>{props.children}</DialogueContext.Provider>;
};

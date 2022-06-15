import * as React from "react";
import { Application } from "../Application";
import { ActionProps } from "./editor/Action";
import { ConditionProps } from "./editor/Condition";
import items from "./sources/items.json";
import { npcInteraction } from "./sources/npcInteraction";
import quest from "./sources/quest.json";
import quests from "./sources/quests.json";
import shops from "./sources/shops.json";
import { skills } from "./sources/skills";
import characterStats from "./sources/character_stat.json";
import basicActions from "./sources/basic_actions.json";
import basicConditions from "./sources/basic_conditions.json";

export interface DialogueContextInterface {
	conditions: ConditionProps[];
	conditionKeys: any[];
	actions: ActionProps[];
	actionKeys: any[];
	switchs: { [key: string]: string[] };
	switchsKeys: { label: string; value: string }[];
	sources?: { [key: string]: string[] };
	sourcesKeys: { [key: string]: any[] };
	app: Application;
	setApp: Function;
}

export const DialogueContext = React.createContext<DialogueContextInterface | null>(null);

const conditions = [
	{ condition: "", variables: [] },
	{
		condition: "hasItem",
		variables: [
			{ source: "items", type: "list", placeholder: "item" },
			{ type: "number", placeholder: "amount" },
			{ source: "boolean", type: "list", placeholder: "noted" },
		],
	},
	{
		condition: "hasEquipped",
		variables: [
			{ source: "equipmentSlot", type: "list", placeholder: "slot" },
			{ source: "items", type: "list", placeholder: "item" },
		],
	},
	{
		condition: "skillLevel",
		variables: [
			{ source: "skills", type: "list", placeholder: "skill" },
			{ source: "compare", type: "list", placeholder: "?" },
			{ type: "number", placeholder: "level" },
		],
		actionable: true,
	},
	{
		condition: "questStage",
		variables: [
			{ source: "quest", type: "list", placeholder: "quest" },
			{ source: "compare", type: "list", placeholder: "?" },
			{ source: "quest[-2]", type: "list", placeholder: "value" },
		],
	},
	{
		condition: "hasQuestCompleted",
		variables: [{ source: "quest", type: "list", placeholder: "quest" }],
	},
	{
		condition: "hasQuestPoints",
		variables: [{ type: "number", placeholder: "points" }],
	},
	{
		condition: "npcInteraction",
		variables: [{ source: "npcInteraction", type: "list", placeholder: "interaction" }],
	},
	{
		condition: "characterStat",
		variables: [
			{ source: "characterStats", type: "list", placeholder: "stat" },
			{ source: "compare", type: "list", placeholder: "?" },
			{ type: "number", placeholder: "value" },
		],
	},
	{
		condition: "basicCondition",
		variables: [{ source: "basicConditions", type: "list", placeholder: "condition" }],
	},
] as ConditionProps[];

const actions = [
	{ action: "", variables: [] },
	{
		action: "takeItem",
		variables: [
			{ source: "items", type: "list", placeholder: "item" },
			{ type: "number", placeholder: "amount" },
			{ source: "boolean", type: "list", placeholder: "noted" },
		],
	},
	{
		action: "giveItem",
		variables: [
			{ source: "items", type: "list", placeholder: "item" },
			{ type: "number", placeholder: "amount" },
		],
	},
	{
		action: "setQuest",
		variables: [
			{ source: "quest", type: "list", placeholder: "quest" },
			{ source: "quest[-1]", type: "list", placeholder: "value" },
		],
	},
	{
		action: "giveExp",
		variables: [
			{ source: "skills", type: "list", placeholder: "skill" },
			{ type: "number", placeholder: "exp" },
		],
	},
	{
		action: "openShop",
		variables: [{ source: "shops", type: "list", placeholder: "shop" }],
	},
	{
		action: "npcText",
		variables: [{ type: "text", placeholder: "text" }],
	},
	{
		action: "playerText",
		variables: [{ type: "text", placeholder: "text" }],
	},
	{
		action: "message",
		variables: [{ type: "text", placeholder: "message" }],
	},
	{
		action: "openDialogue",
		variables: [{ source: "dialogues", type: "list", placeholder: "dialogue" }],
	},
	{
		action: "basicAction",
		variables: [{ source: "basicActions", type: "list", placeholder: "action" }],
	},
] as ActionProps[];

const sourcesKeys = {};
const switchs = { "": [] };

Object.entries(quests).forEach(([key, value]) => (switchs[key] = ["null", ...value]));

export const DialogueContextProvider = (props) => {
	const [sources, setSources] = React.useState({});
	const [app, setApp] = React.useState<Application>(null);
	//const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

	const defaultDialogueContext: DialogueContextInterface = {
		conditions,
		conditionKeys: conditions.sort().map((cond) => ({ label: cond.condition, value: cond.condition })),
		actions,
		actionKeys: actions.sort().map((act) => ({ label: act.action, value: act.action })),
		switchs,
		switchsKeys: Object.keys(switchs)
			.sort()
			.map((sw) => ({ label: sw, value: sw })),
		sources: sources,
		sourcesKeys: sourcesKeys,
		app,
		setApp,
	};

	React.useEffect(() => {
		if (app) {
			Object.entries(sources)
				.sort()
				.forEach(([key, value]) => {
					const val = value as [];
					sourcesKeys[key] = val.map((val) => ({ label: val, value: val }));
				});
			app.forceUpdate();
		}
	}, [app, sources]);

	React.useEffect(() => {
		setSources({
			compare: ["<", "<=", "==", ">=", ">"],
			equipmentSlot: ["HEAD", "CAPE", "NECK", "AMMUNITION", "BODY", "SHIELD", "LEGS", "HANDS", "FEET", "RING", "WEAPON"],
			boolean: ["true", "false"],
			skills,
			items,
			quest,
			shops,
			npcInteraction,
			characterStats,
			basicActions,
			basicConditions,
			// QUESTS
			...quests,
		});
		fetch("https://raw.githubusercontent.com/MineScape-me/MineScape/main/dialogue/paths.txt")
			.then((data) => data.text())
			.then((data) => {
				var github = data
					.split("\n")
					.filter((line) => line !== "")
					.map((file) => file.replace("dialogue/regions/", "").replace(".json", ""));
				var files = [...new Set([...github])];
				setSources((sources) => ({ ...sources, dialogues: files, github: github }));
			})
			.catch((e) => {
				console.log(e);
			});
	}, []);

	return <DialogueContext.Provider value={defaultDialogueContext}>{props.children}</DialogueContext.Provider>;
};

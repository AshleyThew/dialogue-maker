import * as React from "react";
import { Application } from "../Application";
import { ActionProps } from "./editor/Action";
import { ConditionProps } from "./editor/Condition";
import * as Sources from "../sources/";
import * as vars from "../vars";
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
	repo: string;
	setRepo: (repo: string) => void;
}

export const DialogueContext = React.createContext<DialogueContextInterface | null>(null);

const sourcesKeys = {};
const { quests, switchs, ...other } = Sources;
const conditions = vars.conditions as ConditionProps[];
const actions = vars.actions as ActionProps[];

export const DialogueContextProvider = (props) => {
	const [sources, setSources] = React.useState({});
	const [repo, setRepo] = React.useState(localStorage.getItem("minescape.repo") || "MineScape-me/MineScape/main")
	const [app, setApp] = React.useState<Application>(null);
	//const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

	const defaultDialogueContext: DialogueContextInterface = {
		conditions,
		conditionKeys: conditions
			.map((cond) => cond.condition)
			.sort()
			.map((cond) => ({ label: cond, value: cond })),
		actions,
		actionKeys: actions
			.map((act) => act.action)
			.sort()
			.map((act) => ({ label: act, value: act })),
		switchs,
		switchsKeys: Object.keys(switchs)
			.sort()
			.map((sw) => ({ label: sw, value: sw })),
		sources: sources,
		sourcesKeys: sourcesKeys,
		app,
		setApp,
		repo,
		setRepo
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
			...other,
			// QUESTS
			...quests,
		});
	}, []);

	React.useEffect(() => {
		fetch(`https://raw.githubusercontent.com/${repo}/dialogue/paths.txt`)
			.then((data) => data.text())
			.then((data) => {
				var github = data
					.split("\n")
					.filter((line) => line !== "")
					.map((file) => file.replace("dialogue/regions/", "").replace(".json", ""))
					.sort();
				var files = [...new Set([...github])];
				setSources((sources) => ({ ...sources, dialogues: files, github: github }));
			})
			.catch((e) => {
				console.log(e);
			});
			if(repo){
				localStorage.setItem("minescape.repo", repo);
			}
	}, [repo]);

	return <DialogueContext.Provider value={defaultDialogueContext}>{props.children}</DialogueContext.Provider>;
};

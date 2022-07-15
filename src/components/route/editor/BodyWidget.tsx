import * as React from "react";
import { Application } from "../../../Application";
import { AllNodeFactories } from "../../node";
import { CanvasWidget } from "@projectstorm/react-canvas-core";
import { DialogueSidebar } from "./DialogueSidebar";
import styled from "@emotion/styled";
import { BaseNodeModel, BaseNodeModelGenerics, BaseNodeModelOptions } from "../../node/base";
import { showOpenFilePicker } from "file-system-access";
import { DiagramModel } from "@projectstorm/react-diagrams";
import { DialogueContext, DialogueContextInterface } from "../../DialogueContext";
import { DropdownInput } from "../../editor/Inputs";
import { Tray } from "./Tray";
import { StartFactory } from "../../node/start/StartNodeFactory";

namespace S {
	export const Body = styled.div`
		flex-grow: 1;
		display: flex;
		flex-direction: column;
		min-height: 100%;
	`;

	export const Header = styled.div`
		display: flex;
		background: rgb(30, 30, 30);
		flex-grow: 0;
		flex-shrink: 0;
		color: white;
		font-family: Helvetica, Arial, sans-serif;
		padding: 10px;
		align-items: center;
	`;

	export const Content = styled.div`
		display: flex;
		flex-grow: 1;
	`;

	export const Layer = styled.div`
		position: relative;
		flex-grow: 1;
	`;

	export const Toolbar = styled.div`
		background: black;
		padding: 5px;
		display: flex;
		flex-shrink: 0;
	`;

	export const DemoButton = styled.button<{ hover? }>`
		background: rgb(60, 60, 60);
		font-size: 14px;
		padding: 5px 10px;
		border: none;
		color: white;
		outline: none;
		cursor: pointer;
		margin: 2px;
		border-radius: 3px;

		&:hover {
			background: ${(props) => props.hover || "rgb(0, 192, 255)"};
		}
	`;
}

const loadFile = async (app: Application, context: DialogueContextInterface) => {
	var fileHandle: FileSystemFileHandle[];
	try {
		fileHandle = await showOpenFilePicker({
			multiple: false,
			types: [{ accept: { "json/*": [".json"] } }],
		});
	} catch (error) {
		return;
	}

	fileHandle[0].getFile().then((file) => {
		file.text().then((data) => {
			loadData(app, data, context);
		});
	});
};

const loadGithub = async (app: Application, location: string, context: DialogueContextInterface) => {
	fetch(`https://raw.githubusercontent.com/MineScape-me/MineScape/main/dialogue/regions/${location}.json`)
		.then((data) => data.text())
		.then((data) => loadData(app, data, context))
		.catch((err) => {
			console.log(err);
		});
};

const deserializeModel = (app: Application, model: any, context: DialogueContextInterface): DiagramModel => {
	var newModel = new DiagramModel();
	newModel.deserializeModel(model, app.getDiagramEngine());
	newModel.getNodes().forEach((node) => {
		if (node instanceof BaseNodeModel) {
			node.fix(context);
		}
	});
	return newModel;
};

const loadData = (app: Application, data: string, context: DialogueContextInterface): void => {
	clear(app, context);
	setTimeout(() => {
		const model = JSON.parse(data);

		let trees = {};
		if (model.trees) {
			Object.entries(model.trees).forEach((entry) => {
				const [key, value] = entry;
				trees[key] = deserializeModel(app, value, context);
			});
			delete model["trees"];
		}
		const newModel = deserializeModel(app, model, context);

		app.setModel(newModel, trees);
		context.setApp(app);
	}, 100);
};

const saveFile = async (app: Application) => {
	var fileHandle: FileSystemFileHandle;
	try {
		fileHandle = await showSaveFilePicker({ types: [{ accept: { "json/*": [".json"] } }] });
	} catch (error) {
		return;
	}
	const output = app.getModel().serialize() as any;
	const trees = { ...app.getTrees() };
	output.trees = {};
	Object.entries(trees).forEach((entry) => {
		const [key, value] = entry;
		output.trees[key] = value.serialize();
	});

	fileHandle.createWritable().then((stream) => {
		stream.write(JSON.stringify(output, null, 2));
		stream.close();
	});
};

const clear = async (app: Application, context: DialogueContextInterface) => {
	var newModel = new DiagramModel();
	const node = StartFactory.generateModel(undefined);
	node.setPosition(50, 50);
	node.setPosition(50, 50);
	node.getOptions().editableTitle = false;
	node.setupPorts();
	newModel.addNode(node);
	app.setModel(newModel, {});
	context.setApp(app);
};

const Buttons = (props): JSX.Element => {
	const context = React.useContext(DialogueContext);
	const { sourcesKeys } = context;
	const [github, setGithub] = React.useState("");

	const keys = sourcesKeys["dialogues"];

	const clearLocal = () => {
		clear(props.app, context);
		setGithub("");
	};

	return (
		<>
			<S.DemoButton hover="rgb(29, 167, 29)" onClick={() => loadFile(props.app, context)}>
				Load
			</S.DemoButton>
			<S.DemoButton onClick={() => saveFile(props.app)}>Save</S.DemoButton>
			<S.DemoButton hover="rgb(248, 19, 19)" onClick={clearLocal}>
				Clear
			</S.DemoButton>
			<div style={{ marginLeft: "auto" }} />
			<DropdownInput
				values={keys}
				value={github}
				setValue={(e) => {
					setGithub(e);
					loadGithub(props.app, e, context);
				}}
				placeholder={"Github"}
				width={"200px"}
				right={0}
			/>
			;
		</>
	);
};

export class BodyWidget extends React.Component {
	static contextType = DialogueContext;

	state = {
		app: new Application(() => {
			this.forceUpdate();
		}),
	};

	componentDidMount() {
		let value = this.context as any;
		const { app, setApp } = value;
		if (!app) {
			setApp(this.state.app);
		}
	}

	render() {
		return (
			<S.Body>
				{/* <S.Header>
					<div className="title">Dialogue</div>
				</S.Header> */}
				<S.Toolbar>
					<Buttons app={this.state.app} />
				</S.Toolbar>
				<S.Content>
					<Tray app={this.state.app} />
					<S.Layer
						onDrop={(event) => {
							var data = JSON.parse(event.dataTransfer.getData("storm-diagram-node"));

							var node: BaseNodeModel<BaseNodeModelGenerics<BaseNodeModelOptions>> = null!;
							const factory = AllNodeFactories.find((factory) => factory.options.id === data.id);
							node = factory.generateModel(undefined);
							node.setupPorts();
							if (data.extra) {
								Object.entries(data.extra).forEach((entry) => {
									const [key, value] = entry;
									node.getOptions()[key] = value;
								});
							}

							var point = this.state.app.getDiagramEngine().getRelativeMousePoint(event);
							node.setPosition(point);
							this.state.app.getDiagramEngine().getModel().addNode(node);
							this.forceUpdate();
						}}
						onDragOver={(event) => {
							event.preventDefault();
						}}
					>
						<DialogueSidebar>
							<CanvasWidget engine={this.state.app.getDiagramEngine()} />
						</DialogueSidebar>
					</S.Layer>
				</S.Content>
			</S.Body>
		);
	}
}

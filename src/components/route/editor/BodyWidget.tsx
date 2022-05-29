import * as React from "react";
import { Application } from "../../../Application";
import { TrayItemWidget } from "./TrayItemWidget";
import { AllNodeFactories, NodeFactories } from "../../node";
import { CanvasWidget } from "@projectstorm/react-canvas-core";
import { DialogueSidebar } from "./DialogueSidebar";
import styled from "@emotion/styled";
import { BaseNodeModel, BaseNodeModelGenerics, BaseNodeModelOptions } from "../../node/base";
import { showOpenFilePicker } from "file-system-access";
import { DiagramModel } from "@projectstorm/react-diagrams";
import { StartFactory } from "../../node/start/StartNodeFactory";
import { StartNodeModel } from "../../node/start/StartNodeModel";
import { DialogueContext, DialogueContextInterface } from "../../DialogueContext";
import { DropdownInput } from "../../editor/Inputs";

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

	export const Tray = styled.div`
		min-width: 200px;
		background: rgb(20, 20, 20);
		flex-grow: 0;
		flex-shrink: 0;
		display: flex;
		flex-direction: column;
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

const loadData = (app: Application, data: string, context: DialogueContextInterface): void => {
	clear(app);
	setTimeout(() => {
		var model2 = new DiagramModel();
		model2.deserializeModel(JSON.parse(data), app.getDiagramEngine());
		model2.getNodes().forEach((node) => {
			if (node instanceof BaseNodeModel) {
				node.fix(context);
			}
		});
		app.getDiagramEngine().setModel(model2);
		app.registerListener(true);
	}, 100);
};

const saveFile = async (app: Application) => {
	var fileHandle: FileSystemFileHandle;
	try {
		fileHandle = await showSaveFilePicker({ types: [{ accept: { "json/*": [".json"] } }] });
	} catch (error) {
		return;
	}

	fileHandle.createWritable().then((stream) => {
		stream.write(JSON.stringify(app.getActiveDiagram().serialize(), null, 2));
		stream.close();
	});
};

const clear = async (app: Application) => {
	var model2 = new DiagramModel();
	app.getDiagramEngine().setModel(model2);
	app.registerListener(true);
	app.forceUpdate();
};

const Buttons = (props): JSX.Element => {
	const context = React.useContext(DialogueContext);
	const { sourcesKeys } = context;
	const [selected, setSelected] = React.useState("");

	const keys = sourcesKeys["dialogues"];

	return (
		<>
			<S.DemoButton hover="rgb(29, 167, 29)" onClick={() => loadFile(props.app, context)}>
				Load
			</S.DemoButton>
			<S.DemoButton onClick={() => saveFile(props.app)}>Save</S.DemoButton>
			<S.DemoButton hover="rgb(248, 19, 19)" onClick={() => clear(props.app)}>
				Clear
			</S.DemoButton>
			<div style={{ marginLeft: "auto" }} />
			<DropdownInput values={keys} value={selected} setValue={setSelected} placeholder={"Github"} width={"200px"} right={0} />;
			<S.DemoButton
				onClick={() => {
					loadGithub(props.app, selected, context);
					setSelected("");
				}}
			>
				Load Github
			</S.DemoButton>
		</>
	);
};

export class BodyWidget extends React.Component {
	state = {
		app: new Application(() => {
			this.forceUpdate();
		}),
	};

	render() {
		return (
			<S.Body>
				<S.Header>
					<div className="title">Dialogue</div>
				</S.Header>
				<S.Toolbar>
					<Buttons app={this.state.app} />
				</S.Toolbar>
				<S.Content>
					<S.Tray>
						{!this.state.app
							.getActiveDiagram()
							.getNodes()
							.some((val) => val instanceof StartNodeModel) && (
							<TrayItemWidget key={"start"} model={{ id: "start" }} name={"start"} color={StartFactory.options.color} />
						)}
						{NodeFactories.map((factory) => {
							var options = factory.options;
							return <TrayItemWidget key={options.id} model={{ id: options.id }} name={options.id} color={options.color} />;
						})}
						<div style={{ marginTop: "auto", color: "#ffffff" }}>
							<p style={{ color: "#23f0e5" }}>Shortcuts:</p>
							<p>
								Duplicate: Ctrl + d
								<br />
								Delete: Shift + del
								<br />
								Zoom: Mouse scroll
							</p>
							<p>
								Copyright
								<br />
								MineScape&reg; {new Date().getFullYear()}
								<br />
								<a href={"https://creativecommons.org/licenses/by-nc-nd/4.0/"} target="_blank" rel="noreferrer">
									CC BY-NC-ND 4.0
								</a>
							</p>
						</div>
					</S.Tray>

					<S.Layer
						onDrop={(event) => {
							var data = JSON.parse(event.dataTransfer.getData("storm-diagram-node"));

							var node: BaseNodeModel<BaseNodeModelGenerics<BaseNodeModelOptions>> = null!;
							const factory = AllNodeFactories.find((factory) => factory.options.id === data.id);
							node = factory.generateModel(undefined);
							node.setupPorts();
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

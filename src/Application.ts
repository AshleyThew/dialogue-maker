import { ZoomCanvasAction } from "@projectstorm/react-canvas-core";
import createEngine, { DiagramModel, DiagramEngine, DefaultDiagramState } from "@projectstorm/react-diagrams";
import { DialogueDiagramState } from "./components/editor/state/DialogueDiagramState";
import { DialogueFactory, NodeFactories } from "./components/node/";

export class Application {
	protected activeModel: DiagramModel;
	protected diagramEngine: DiagramEngine;

	constructor() {
		this.diagramEngine = createEngine({ registerDefaultZoomCanvasAction: false });

		this.newModel();
	}

	public newModel() {
		this.activeModel = new DiagramModel();
		this.diagramEngine.setModel(this.activeModel);

		NodeFactories.forEach((factory) => this.diagramEngine.getNodeFactories().registerFactory(factory));

		var node1 = DialogueFactory.generateModel(undefined);
		node1.getOptions().title = "<player>";
		node1.getOptions().text = "Hello";
		node1.setPosition(100, 100);

		var node2 = DialogueFactory.generateModel(undefined);
		node2.getOptions().title = "Hans";
		node2.getOptions().text = "Welcome";
		node2.setPosition(400, 100);

		this.activeModel.addAll(node1, node2);

		const state = new DialogueDiagramState();

		this.diagramEngine.getStateMachine().registerListener({
			stateChanged: (event) => {
				if (event.newState instanceof DefaultDiagramState) {
					this.diagramEngine.getStateMachine().setState(state);
				}
				//console.log(event.newState);
			},
		});
		this.diagramEngine.getStateMachine().setState(state);

		this.diagramEngine.getActionEventBus().registerAction(new ZoomCanvasAction({ inverseZoom: true }));
	}

	public getActiveDiagram(): DiagramModel {
		return this.activeModel;
	}

	public getDiagramEngine(): DiagramEngine {
		return this.diagramEngine;
	}
}

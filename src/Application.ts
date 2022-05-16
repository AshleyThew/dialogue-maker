import { ZoomCanvasAction } from "@projectstorm/react-canvas-core";
import createEngine, { DiagramModel, DiagramEngine } from "@projectstorm/react-diagrams";
import { DialogueDiagramState } from "./components/editor/state/DialogueDiagramState";
import { DialogueFactory, NodeFactories } from "./components/node/";

export class Application {
	protected activeModel: DiagramModel;
	protected diagramEngine: DiagramEngine;

	constructor() {
		this.diagramEngine = createEngine({ registerDefaultDeleteItemsAction: false, registerDefaultZoomCanvasAction: false });

		this.newModel();
	}

	public newModel() {
		this.activeModel = new DiagramModel();
		this.diagramEngine.setModel(this.activeModel);

		NodeFactories.forEach((factory) => this.diagramEngine.getNodeFactories().registerFactory(factory));

		// //3-A) create a default node
		var node1 = DialogueFactory.generateModel(undefined);
		node1.getOptions().title = "<player>";
		node1.getOptions().text = "Hello";
		// let port = node1.addOutPort("o");
		// node1.addInPort("i");
		node1.setPosition(100, 100);

		// //3-B) create another default node
		var node2 = DialogueFactory.generateModel(undefined);
		node2.getOptions().title = "Hans";
		node2.getOptions().text = "Welcome";
		// let port2 = node2.addInPort("i");
		// node2.addOutPort("o");
		node2.setPosition(400, 100);

		// // link the ports
		// let link1 = port.link(port2);

		this.activeModel.addAll(node1, node2);

		this.diagramEngine.getStateMachine().setState(new DialogueDiagramState());
		this.diagramEngine.getActionEventBus().registerAction(new ZoomCanvasAction({ inverseZoom: true }));
	}

	public getActiveDiagram(): DiagramModel {
		return this.activeModel;
	}

	public getDiagramEngine(): DiagramEngine {
		return this.diagramEngine;
	}
}

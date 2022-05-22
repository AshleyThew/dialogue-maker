import { DeleteItemsAction } from "@projectstorm/react-canvas-core";
import createEngine, { DiagramModel, DiagramEngine, DefaultDiagramState } from "@projectstorm/react-diagrams";
import { DialogueDiagramState } from "./components/state/DialogueDiagramState";
import { NodeFactories } from "./components/node/";
import { ZoomCanvasAction } from "./components/state/ZoomCanvasAction";
import { StartFactory } from "./components/node/start/StartNodeFactory";

export class Application {
	protected activeModel: DiagramModel;
	protected diagramEngine: DiagramEngine;
	protected updateAction: Function;

	constructor(updateAction: Function) {
		this.updateAction = updateAction;
		this.diagramEngine = createEngine({ registerDefaultZoomCanvasAction: false, registerDefaultDeleteItemsAction: false });
		this.newModel();
	}

	public newModel() {
		this.activeModel = new DiagramModel();
		this.diagramEngine.setModel(this.activeModel);

		this.diagramEngine.getNodeFactories().registerFactory(StartFactory);
		NodeFactories.forEach((factory) => this.diagramEngine.getNodeFactories().registerFactory(factory));

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

		this.activeModel.registerListener({
			nodesUpdated: () => {
				this.updateAction();
			},
		});

		const eventBus = this.diagramEngine.getActionEventBus();
		eventBus.registerAction(new ZoomCanvasAction({ inverseZoom: true }));
		eventBus.registerAction(new DeleteItemsAction({ keyCodes: [46], modifiers: { shiftKey: true } }));
	}

	public getActiveDiagram(): DiagramModel {
		return this.activeModel;
	}

	public getDiagramEngine(): DiagramEngine {
		return this.diagramEngine;
	}
}

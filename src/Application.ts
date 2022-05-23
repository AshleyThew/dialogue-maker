import { DeleteItemsAction } from "@projectstorm/react-canvas-core";
import createEngine, { DiagramModel, DiagramEngine, DefaultDiagramState } from "@projectstorm/react-diagrams";
import { DialogueDiagramState } from "./components/state/DialogueDiagramState";
import { NodeFactories } from "./components/node/";
import { ZoomCanvasAction } from "./components/state/ZoomCanvasAction";
import { StartFactory } from "./components/node/start/StartNodeFactory";
import { CloneItemsAction } from "./components/state/CloneItemsAction";

export class Application {
	protected diagramEngine: DiagramEngine;
	protected updateAction: Function;

	constructor(updateAction: Function) {
		this.updateAction = updateAction;
		this.diagramEngine = createEngine({ registerDefaultZoomCanvasAction: false, registerDefaultDeleteItemsAction: false });
		this.newModel();
		this.registerListener();
	}

	public newModel() {
		const model = new DiagramModel();
		this.diagramEngine.setModel(model);

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

		const eventBus = this.diagramEngine.getActionEventBus();
		eventBus.registerAction(new ZoomCanvasAction({ inverseZoom: true }));
		eventBus.registerAction(new DeleteItemsAction({ keyCodes: [46], modifiers: { shiftKey: true } }));
		eventBus.registerAction(new CloneItemsAction({ offset: { x: 50, y: 50 } }));
	}

	public getActiveDiagram(): DiagramModel {
		return this.diagramEngine.getModel();
	}

	public getDiagramEngine(): DiagramEngine {
		return this.diagramEngine;
	}

	public registerListener(update?: boolean): void {
		this.diagramEngine.getModel().registerListener({
			nodesUpdated: () => {
				this.updateAction();
			},
		});
		if (update) {
			this.updateAction();
		}
	}
}

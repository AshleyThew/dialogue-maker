import { DeleteItemsAction } from "@projectstorm/react-canvas-core";
import createEngine, { DiagramModel, DiagramEngine, DefaultDiagramState } from "@projectstorm/react-diagrams";
import { DialogueDiagramState } from "./components/state/DialogueDiagramState";
import { NodeFactories } from "./components/node/";
import { ZoomCanvasAction } from "./components/state/ZoomCanvasAction";
import { StartFactory } from "./components/node/start/StartNodeFactory";
import { CloneItemsAction } from "./components/state/CloneItemsAction";
import { CopyItemsAction } from "./components/state/CopyItemsAction";
import { PasteItemsAction } from "./components/state/PasteItemsAction";

export class Application {
	protected model: DiagramModel;
	protected trees: { [key: string]: DiagramModel };
	protected diagramEngine: DiagramEngine;
	protected updateFunction: Function;

	constructor(updateFunction: Function) {
		this.updateFunction = updateFunction;
		this.diagramEngine = createEngine({ registerDefaultZoomCanvasAction: false, registerDefaultDeleteItemsAction: false });
		this.newModel();
		this.registerListener();
	}

	public newModel() {
		this.model = new DiagramModel();
		this.trees = {};
		this.diagramEngine.setModel(this.model);

		this.diagramEngine.getNodeFactories().registerFactory(StartFactory);
		NodeFactories.forEach((factory) => this.diagramEngine.getNodeFactories().registerFactory(factory));

		const node = StartFactory.generateModel(undefined);
		node.setPosition(50, 50);
		node.setPosition(50, 50);
		node.getOptions().editableTitle = false;
		node.setupPorts();
		this.model.addNode(node);

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
		eventBus.registerAction(new CloneItemsAction({ app: this, offset: { x: 0 } }));
		eventBus.registerAction(new CopyItemsAction());
		eventBus.registerAction(new PasteItemsAction());
	}

	public getModel(): DiagramModel {
		return this.model;
	}

	public getTrees(): { [key: string]: DiagramModel } {
		return this.trees;
	}

	public setModel(model: DiagramModel, trees: { [key: string]: DiagramModel }): void {
		this.model = model;
		this.trees = { ...trees };
		this.diagramEngine.setModel(model);
		this.registerListener(true);
		this.forceUpdate();
	}

	public getDiagramEngine(): DiagramEngine {
		return this.diagramEngine;
	}

	public forceUpdate(): void {
		this.updateFunction();
	}

	public registerListener(update?: boolean): void {
		this.diagramEngine.getModel().registerListener({
			nodesUpdated: () => {
				this.updateFunction();
			},
		});
		if (update) {
			this.updateFunction();
		}
	}
}

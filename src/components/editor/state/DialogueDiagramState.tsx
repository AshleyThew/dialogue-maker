import { MouseEvent } from "react";

import { SelectingState, State, Action, InputType, ActionEvent, DragCanvasState } from "@projectstorm/react-canvas-core";
import { DiagramEngine, PortModel } from "@projectstorm/react-diagrams";

import { DragDiagramItemsState } from "./DragDiagramItemsState";
import { DialogueDragNewLinkState } from "./DialogueNewLinkState";

export class DialogueDiagramState extends State<DiagramEngine> {
	dragCanvas: DragCanvasState;
	dragNewLink: DialogueDragNewLinkState;
	dragItems: DragDiagramItemsState;

	constructor() {
		super({
			name: "default-diagrams",
		});
		this.childStates = [new SelectingState()];
		this.dragCanvas = new DragCanvasState();
		this.dragNewLink = new DialogueDragNewLinkState(); // Do not allow dangling links
		this.dragItems = new DragDiagramItemsState();

		// determine what was clicked on
		this.registerAction(
			new Action({
				type: InputType.MOUSE_DOWN,
				fire: (event) => {
					const element = this.engine
						.getActionEventBus()
						.getModelForEvent(event as ActionEvent<MouseEvent<Element, globalThis.MouseEvent>>);

					// the canvas was clicked on, transition to the dragging canvas state
					if (!element) {
						this.transitionWithEvent(this.dragCanvas, event);
					} else {
						console.log(element);
						// initiate dragging a new link
						if (element instanceof PortModel) {
							this.transitionWithEvent(this.dragNewLink, event);
						}
						// move the items (and potentially link points)
						else {
							this.transitionWithEvent(this.dragItems, event);
						}
					}
				},
			})
		);

		// touch drags the canvas
		this.registerAction(
			new Action({
				type: InputType.TOUCH_START,
				fire: (event) => {
					this.transitionWithEvent(this.dragCanvas, event);
				},
			})
		);
	}
}

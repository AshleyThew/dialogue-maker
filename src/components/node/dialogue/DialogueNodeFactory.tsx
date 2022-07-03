import { DialogueNodeModel } from "./DialogueNodeModel";
import { DialogueNodeWidget } from "./DialogueNodeWidget";
import { BaseNodeFactory } from "../base/";

export class DialogueNodeFactory extends BaseNodeFactory<DialogueNodeModel> {
	constructor() {
		super("dialogue", "Dialogue", "#dd341ee6");
	}

	generateReactWidget(event): JSX.Element {
		return <DialogueNodeWidget engine={this.engine} node={event.model} />;
	}

	generateModel(event): DialogueNodeModel {
		return new DialogueNodeModel({ color: this.options.color });
	}
}

export const DialogueFactory = new DialogueNodeFactory();

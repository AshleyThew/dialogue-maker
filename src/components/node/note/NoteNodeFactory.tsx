import { NoteNodeModel } from "./NoteNodeModel";
import { NoteNodeWidget } from "./NoteNodeWidget";
import { BaseNodeFactory } from "../base/";

export class NoteNodeFactory extends BaseNodeFactory<NoteNodeModel> {
	constructor() {
		super("note", "Note", "#19e0e7e6");
	}

	generateReactWidget(event): JSX.Element {
		return <NoteNodeWidget engine={this.engine} node={event.model} />;
	}

	generateModel(event): NoteNodeModel {
		return new NoteNodeModel({ color: this.options.color });
	}
}

export const NoteFactory = new NoteNodeFactory();

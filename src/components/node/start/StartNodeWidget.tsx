import { BaseNodeProps, BaseNodeWidget, S } from "../base";
import { StartNodeModel } from "./StartNodeModel";

export interface StartNodeProps extends BaseNodeProps<StartNodeModel> {}

export class StartNodeWidget extends BaseNodeWidget<StartNodeProps> {
	render() {
		return super.construct(undefined);
	}

	renderHeader(): JSX.Element {
		return (
			<>
				{super.renderHeader()}
				{super.renderOutPorts(true)}
			</>
		);
	}
}

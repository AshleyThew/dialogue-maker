import * as React from "react";
import * as _ from "lodash";
import { BaseNodeProps, BaseNodeWidget, S } from "../base";
import { Option, OptionNodeModel } from "./OptionNodeModel";
import { EditableInput } from "../../editor/Inputs";
import { C, ConditionBlock } from "../../editor/Condition";

export interface OptionNodeProps extends BaseNodeProps<OptionNodeModel> {}

export class OptionNodeWidget extends BaseNodeWidget<OptionNodeProps> {
	render() {
		return super.construct(
			<>
				{this.props.node.getOptions().options.map((option, index) => {
					var remove;
					if (index > 0) {
						remove = () => {
							this.props.node.getOptions().options.splice(index, 1);
							const outPort = this.props.node.getOutPorts().splice(index, 1)[0];
							_.forEach(outPort.getLinks(), (link) => {
								link.remove();
							});
							this.props.engine.repaintCanvas();
						};
					}
					return (
						<div key={`o${index}`}>
							{index !== 0 && <hr style={{ margin: "0 0", background: "black", border: "0px", height: "1px" }} />}
							<div style={{ color: "black", display: "flex", justifyContent: "space-between" }}>
								<ConditionBlock option={option} remove={remove} allowActionable={false} />
								<div style={{ margin: "5px 2px", width: "1px", backgroundColor: "black" }} />
								<div style={{ color: "white", display: "flex", alignItems: "center" }}>
									<EditableInput style={{ margin: "5px 2px" }} value="Text" setValue={(value: any) => (option.text = value)} />
									<S.PortOut engine={this.props.engine}>
										<S.PortsContainer>{this.generatePort(this.props.node.getOutPorts()[index])}</S.PortsContainer>
									</S.PortOut>
								</div>
							</div>
						</div>
					);
				})}
			</>
		);
	}
	renderHeader(): JSX.Element {
		return (
			<>
				{super.renderHeader()}
				<C.Plus
					data-no-drag
					title="Add option"
					style={{ marginLeft: "2px", marginRight: "0px" }}
					onClick={(e) => {
						this.props.node.addOutPort("❯");
						this.props.node.getOptions().options.push(new Option());
						this.forceUpdate();
					}}
				>
					&#x271A;
				</C.Plus>
			</>
		);
	}

	renderInPorts(): JSX.Element {
		return (
			<div style={{ display: "flex", alignItems: "center" }}>
				{this.props.node.getInPorts().length && (
					<S.PortIn engine={this.props.engine}>
						<S.PortsContainer>{_.map(this.props.node.getInPorts(), this.generatePort)}</S.PortsContainer>
					</S.PortIn>
				)}
			</div>
		);
	}

	renderOutPorts(): JSX.Element {
		return undefined;
	}
}

import * as React from "react";
import * as _ from "lodash";
import { BaseNodeProps, BaseNodeWidget, S } from "../base";
import { Option, OptionNodeModel } from "./OptionNodeModel";
import { EditableInput } from "../../editor/Inputs";
import { DialogueContext } from "../../DialogueContext";
import { ConditionProps, ConditionDropdown } from "../../editor/Condition";
import styled from "@emotion/styled";

export interface OptionNodeProps extends BaseNodeProps<OptionNodeModel> {}
namespace O {
	export const Plus = styled.span`
		color: #0cd10c;
		margin-right: 2px;

		cursor: pointer;
	`;
	export const Delete = styled.span`
		color: #ee0c0c;
		margin-right: -10px;
		position: relative;
		left: -13px;

		cursor: pointer;
	`;
}

function IfDropdown(props: { option: Option; remove: Function }): JSX.Element {
	const { keys, conditions, sources } = React.useContext(DialogueContext);
	const [, forceUpdate] = React.useReducer((x) => x + 1, 0);
	const { option } = props;
	return (
		<div style={{ display: "table", borderSpacing: "0px" }}>
			{option.conditions.map((cond, cindex) => {
				const condition: ConditionProps = conditions.find((condition) => condition.condition === cond);
				return (
					<div key={`c${cindex}`} style={{ display: "flex", alignItems: "center" }}>
						{cindex !== 0 ? (
							<O.Delete
								data-no-drag
								title="Remove condition"
								onClick={() => {
									option.conditions.splice(cindex, 1);
									option.args.splice(cindex, 1);
									forceUpdate();
								}}
							>
								&#x268A;
							</O.Delete>
						) : (
							props.remove && (
								<O.Delete
									data-no-drag
									title="Remove option"
									style={{ WebkitTextStroke: "1px black" }}
									onClick={() => {
										props.remove();
										forceUpdate();
									}}
								>
									&#x268B;
								</O.Delete>
							)
						)}
						<ConditionDropdown
							values={keys}
							value={option.conditions[cindex]}
							setValue={(value: string) => {
								option.conditions[cindex] = value;
								const condition: ConditionProps = conditions.find((condition) => condition.condition === value);
								option.args[cindex] = Array(condition.variables.length).fill("");
								forceUpdate();
							}}
						/>
						{condition &&
							condition.variables.map((variable, vindex) => {
								var key = `v${vindex}`;
								var pattern = undefined;
								var number = false;
								const setValue = (value: string) => {
									option.args[cindex][vindex] = value;
									forceUpdate();
								};
								switch (variable.type) {
									case "number":
										number = true;
										pattern = /^[0-9]*$/;
									// eslint-disable-next-line no-fallthrough
									case "text": {
										return (
											<EditableInput
												key={key}
												style={{ margin: "5px 2px", alignSelf: "flex-end" }}
												value={option.args[cindex][vindex]}
												setValue={setValue}
												minLength={2}
												placeholder={variable.placeholder}
												pattern={pattern}
												number={number}
											/>
										);
									}
									case "list": {
										const keys = sources[variable.source];
										return (
											<ConditionDropdown
												values={keys}
												key={key}
												value={option.args[cindex][vindex]}
												setValue={setValue}
												placeholder={variable.placeholder}
											/>
										);
									}
									default: {
										return <div key={vindex} />;
									}
								}
							})}
						{cond.length > 0 && cindex === option.conditions.length - 1 && (
							<O.Plus
								data-no-drag
								onClick={(e) => {
									option.conditions.push("");
									option.args.push([]);
									forceUpdate();
								}}
							>
								&#x271A;
							</O.Plus>
						)}
					</div>
				);
			})}
		</div>
	);
}
export class OptionNodeWidget extends BaseNodeWidget<OptionNodeProps> {
	render() {
		return super.construct(
			<>
				{this.props.node.getOptions().options.map((option, index) => {
					var remove;
					if (index > 0) {
						remove = () => {
							this.props.node.getOptions().options.splice(index, 1);
							this.forceUpdate();
						};
					}
					return (
						<div key={`o${index}`}>
							{index !== 0 && <hr style={{ margin: "0 0", background: "black", border: "0px", height: "1px" }} />}
							<div style={{ color: "black", display: "flex", justifyContent: "space-between" }}>
								<IfDropdown option={option} remove={remove} />
								<div style={{ margin: "5px 2px", width: "1px", backgroundColor: "black" }} />
								<div style={{ display: "flex", alignItems: "center" }}>
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
				<O.Plus
					data-no-drag
					style={{ marginLeft: "2px", marginRight: "0px" }}
					onClick={(e) => {
						this.props.node.addOutPort("❯");
						this.props.node.getOptions().options.push(new Option());
						this.forceUpdate();
					}}
				>
					&#x271A;
				</O.Plus>
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

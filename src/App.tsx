import "./App.css";
import { Application } from "./Application";
import { BodyWidget } from "./components/BodyWidget";
import { DialogueContextProvider } from "./components/DialogueContext";

const app = new Application();

function App() {
	return (
		<div className="App">
			<DialogueContextProvider>
				<BodyWidget app={app}></BodyWidget>
			</DialogueContextProvider>
		</div>
	);
}

export default App;

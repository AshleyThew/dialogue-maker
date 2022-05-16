import "./App.css";
import { Application } from "./Application";
import { BodyWidget } from "./components/BodyWidget";

const app = new Application();

function App() {
	return (
		<div className="App">
			<BodyWidget app={app}></BodyWidget>
		</div>
	);
}

export default App;

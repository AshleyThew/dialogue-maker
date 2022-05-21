import "./App.css";
import { Application } from "./Application";
import { BodyWidget } from "./components/route/editor/BodyWidget";
import { Routes, Route } from "react-router-dom";

const app = new Application();

function App() {
	return (
		<div className="App">
			<Routes>
				<Route path="/" element={<BodyWidget app={app} />} />
			</Routes>
		</div>
	);
}

export default App;

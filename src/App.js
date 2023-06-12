import { Route, Routes } from "react-router-dom";
import Heading from "./pages/Heading";
import Home from "./pages/Home";
import Mint from "./pages/Mint";
import Staking from "./pages/Staking";
import Lottery from "./pages/Lottery";
import Admin from "./pages/Admin";
import Farm from "./pages/Farm";

import { Provider } from "react-redux";
import store from "./utils/reduxStore";

function App() {
  return (
    <>
      <Provider store={store}>
        <Heading />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/mint" element={<Mint />} />
          <Route path="/staking" element={<Staking />} />
          <Route path="/lottery" element={<Lottery />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/farm" element={<Farm />} />
        </Routes>
      </Provider>
    </>
  );
}

export default App;

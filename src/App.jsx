import { App as AntdApp, ConfigProvider } from "antd";
import { antdTheme } from "./theme/antd-theme";
import AspectRatioCalculator from "./components";

function App() {
  return (
    <ConfigProvider theme={antdTheme}>
      <AntdApp>
        <AspectRatioCalculator />
      </AntdApp>
    </ConfigProvider>
  );
}

export default App;

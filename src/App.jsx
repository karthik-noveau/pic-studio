import { App as AntdApp,ConfigProvider } from "antd";

import useStore from "@common/store/use-store";
import Home from "@pages/home";
import Studio from "@pages/studio";
import { antdTheme } from "@theme/antd-theme";

function App() {
  const currentPage = useStore((state) => state.currentPage);

  return (
    <ConfigProvider theme={antdTheme}>
      <AntdApp>
        {currentPage === "home" ? <Home /> : <Studio />}
      </AntdApp>
    </ConfigProvider>
  );
}

export default App;

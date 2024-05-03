import * as ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import { SnackbarProvider } from "notistack";
import { Provider } from "react-redux";
import { store } from "./app/store";

import App from "./app/app";
import {
  Notify_Duration,
  StyledMaterialDesignContent,
} from "./app/constants/notification";
import AlertIcon from "./app/components/AlertIcon/AlertIcon";

ReactDOM.render(
  <Provider store={store}>
    <SnackbarProvider
      autoHideDuration={Notify_Duration}
      Components={{
        success: StyledMaterialDesignContent,
        error: StyledMaterialDesignContent,
        warning: StyledMaterialDesignContent,
        info: StyledMaterialDesignContent,
      }}
      iconVariant={{
        error: <AlertIcon variant="error" />,
        success: <AlertIcon variant="success" />,
        info: <AlertIcon variant="info" />,
        warning: <AlertIcon variant="warning" />,
      }}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </SnackbarProvider>
  </Provider>,
  document.getElementById("root")
);

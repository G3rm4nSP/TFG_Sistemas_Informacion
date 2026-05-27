import { Snackbar, Alert, Stack } from "@mui/material";
import { useEffect, useState } from "react";

type Props = {
  successMsg: string;
  errorMsg: string;
  setSuccessMsg: (msg: string) => void;
  setErrorMsg: (msg: string) => void;
};

type SnackbarItem = {
  id: number;
  message: string;
};

const AppSnackbars = ({
  successMsg,
  errorMsg,
  setSuccessMsg,
  setErrorMsg,
}: Props) => {
  const [successList, setSuccessList] = useState<SnackbarItem[]>([]);
  const [errorList, setErrorList] = useState<SnackbarItem[]>([]);

  useEffect(() => {
    if (successMsg) {
      setSuccessList((prev) => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          message: successMsg,
        },
      ]);

      setSuccessMsg("");
    }
  }, [successMsg]);

  useEffect(() => {
    if (errorMsg) {
      setErrorList((prev) => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          message: errorMsg,
        },
      ]);

      setErrorMsg("");
    }
  }, [errorMsg]);

  const removeSuccess = (id: number) => {
    setSuccessList((prev) => prev.filter((x) => x.id !== id));
  };

  const removeError = (id: number) => {
    setErrorList((prev) => prev.filter((x) => x.id !== id));
  };

  return (
    <Stack
      spacing={1}
      sx={{
        position: "fixed",
        top: 24,
        right: 24,
        zIndex: 9999,
      }}
    >
      {successList.map((msg) => (
        <Snackbar
          key={msg.id}
          open
          autoHideDuration={2000}
          onClose={() => removeSuccess(msg.id)}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
        >
          <Alert severity="success">
            {msg.message}
          </Alert>
        </Snackbar>
      ))}

      {errorList.map((msg) => (
        <Snackbar
          key={msg.id}
          open
          autoHideDuration={4000}
          onClose={() => removeError(msg.id)}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "center",
          }}
        >
          <Alert severity="error">
            {msg.message}
          </Alert>
        </Snackbar>
      ))}
    </Stack>
  );
};

export default AppSnackbars;
import { Snackbar, Alert } from "@mui/material";

type Props = {
  successMsg: string;
  errorMsg: string;
  setSuccessMsg: (msg: string) => void;
  setErrorMsg: (msg: string) => void;
};

const AppSnackbars = ({
  successMsg,
  errorMsg,
  setSuccessMsg,
  setErrorMsg,
}: Props) => {
  return (
    <>
      <Snackbar
        open={!!successMsg}
        autoHideDuration={6000}
        onClose={() => setSuccessMsg("")}
      >
        <Alert severity="success">
          {successMsg}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!errorMsg}
        autoHideDuration={6000}
        onClose={() => setErrorMsg("")}
      >
        <Alert severity="error">
          {errorMsg}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AppSnackbars;
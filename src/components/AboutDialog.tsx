import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Typography } from '@mui/material';

const version = import.meta.env.VITE_APP_VERSION + (import.meta.env.VITE_APP_GITREV ? " (rev " + import.meta.env.VITE_APP_GITREV.substring(0, 8) + ")" : "");

export default function AboutDialog(props: { open: boolean, onClose: () => void }) {
  return (
    <div>
      <Dialog
        open={props.open}
        scroll="paper"
        aria-labelledby="scroll-dialog-title"
        aria-describedby="scroll-dialog-description"
      >
        <DialogTitle id="scroll-dialog-title">About Snapweb</DialogTitle>
        <DialogContent dividers>
          <DialogContentText
            id="scroll-dialog-description"
            tabIndex={-1}
          >
            <Typography variant="h5" gutterBottom>Snapweb version {version}</Typography>
            <Typography variant="subtitle1" gutterBottom>Copyright &copy; 2020 - 2025 <a href="mailto:snapweb@badaix.de">BadAix</a></Typography>
            <Typography variant="subtitle1" gutterBottom>Author: <a href="https://de.linkedin.com/pub/johannes-pohl/65/6a6/253">Johannes Pohl</a> and <a href="https://github.com/badaix/snapweb/graphs/contributors">contributors</a></Typography>
            <Typography variant="h6" gutterBottom>License</Typography>
            <Typography variant="subtitle1" gutterBottom>Snapweb is licensed under the <a href="#gpl">GNU General Public License, version 3 or later </a> (herein referred to as GPL).</Typography>

            <Typography variant="h6" gutterBottom>How Can I Help?</Typography>
            <Typography variant="subtitle1" gutterBottom>
              If you find Snapcast and Snapweb useful, then I'd really appreciate it if you'd consider contributing to the project however you can. Donating is the easiest.
              Donate on <a href="https://www.paypal.me/badaix">PayPal</a></Typography>

            <Typography variant="h6" gutterBottom>Sources</Typography>
            <Typography variant="subtitle1" gutterBottom>
              The sources to this application can be retrieved at <a href="https://github.com/badaix/snapweb">https://github.com/badaix/snapweb</a>.
            </Typography>

            <Typography variant="h6" gutterBottom>Libraries</Typography>
            <Typography variant="subtitle1" gutterBottom>
              Snapweb uses external libraries that make extensive use of the following persons' or companies' code:
              <table>
                <tr>
                  <th>name</th>
                  <th>license type</th>
                  <th>link</th>
                  <th>author</th>
                </tr>

                <tr><td>@emotion/react</td><td>n/a</td><td>git+https://github.com/emotion-js/emotion.git#main</td><td>n/a</td></tr>
                <tr><td>@emotion/styled</td><td>MIT</td><td>git+https://github.com/emotion-js/emotion.git#main</td><td>n/a</td></tr>
                <tr><td>@mui/icons-material</td><td>n/a</td><td>git+https://github.com/mui/material-ui.git</td><td>n/a</td></tr>
                <tr><td>@mui/material</td><td>n/a</td><td>git+https://github.com/mui/material-ui.git</td><td>n/a</td></tr>
                <tr><td>@testing-library/jest-dom</td><td>n/a</td><td>git+https://github.com/testing-library/jest-dom.git</td><td>n/a</td></tr>
                <tr><td>@testing-library/react</td><td>n/a</td><td>git+https://github.com/testing-library/react-testing-library.git</td><td>n/a</td></tr>
                <tr><td>@testing-library/user-event</td><td>n/a</td><td>git+https://github.com/testing-library/user-event.git</td><td>n/a</td></tr>
                <tr><td>@types/jest</td><td>n/a</td><td>https://github.com/DefinitelyTyped/DefinitelyTyped.git</td><td>n/a</td></tr>
                <tr><td>@types/node</td><td>n/a</td><td>https://github.com/DefinitelyTyped/DefinitelyTyped.git</td><td>n/a</td></tr>
                <tr><td>@types/react</td><td>n/a</td><td>https://github.com/DefinitelyTyped/DefinitelyTyped.git</td><td>n/a</td></tr>
                <tr><td>@types/react-dom</td><td>n/a</td><td>https://github.com/DefinitelyTyped/DefinitelyTyped.git</td><td>n/a</td></tr>
                <tr><td>libflacjs</td><td>MIT</td><td>git+https://github.com/mmig/libflac.js.git</td><td>n/a</td></tr>
                <tr><td>react</td><td>MIT</td><td>git+https://github.com/facebook/react.git</td><td>n/a</td></tr>
                <tr><td>react-dom</td><td>MIT</td><td>git+https://github.com/facebook/react.git</td><td>n/a</td></tr>
                <tr><td>react-scripts</td><td>MIT</td><td>git+https://github.com/facebook/create-react-app.git</td><td>n/a</td></tr>
                <tr><td>standardized-audio-context</td><td>n/a</td><td>git+https://github.com/chrisguttandin/standardized-audio-context.git</td><td>n/a</td></tr>
                <tr><td>typescript</td><td>Apache-2.0</td><td>git+https://github.com/Microsoft/TypeScript.git</td><td>Microsoft Corp.</td></tr>
                <tr><td>web-vitals</td><td>n/a</td><td>git+https://github.com/GoogleChrome/web-vitals.git</td><td>n/a</td></tr>
              </table>
            </Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={props.onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

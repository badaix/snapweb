import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

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
            <head>
              <title>Snapweb licenses</title>
              <meta httpEquiv="content-type" content="text/html;charset=utf-8" />
            </head>

            <body>
              <p>Version {version}</p>
              <p>Copyright &copy; 2020 - 2024 <a href="mailto:snapweb@badaix.de">BadAix</a></p>
              <p>Author: <a href="https://de.linkedin.com/pub/johannes-pohl/65/6a6/253">Johannes Pohl</a> and <a href="https://github.com/badaix/snapweb/graphs/contributors">contributors</a></p>
              <div>
                <h2>License</h2>
                <p>Snapweb is licensed under the <a href="#gpl">GNU General Public License, version 3 or later </a> (herein referred to as GPL).</p>
                <h2>How Can I Help?</h2>
                <p>If you find Snapcast and Snapweb useful, then I'd really appreciate it if you'd consider contributing to the project however you can. Donating is the easiest.</p>
                <p>Donate on <a href="https://www.paypal.me/badaix">PayPal</a></p>
                <h2>Sources</h2>
                <p>The sources to this application can be retrieved at <a href="https://github.com/badaix/snapweb">https://github.com/badaix/snapweb</a>.</p>
                <h2>Libraries</h2>
                <p>Snapweb uses external libraries that make extensive use of the following persons' or companies' code:
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
                </p>
              </div>
            </body>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={props.onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

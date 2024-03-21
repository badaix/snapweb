import { Button, Dialog, DialogActions, DialogContent, TextField, DialogTitle, MenuItem, Select, SelectChangeEvent, InputLabel, FormControl, FormControlLabel, Checkbox, Box } from '@mui/material';
import { useState } from 'react';
import { config, Theme } from '../config.ts';

export default function SettingsDialog(props: { open: boolean, onClose: (_apply: boolean) => void }) {
  const [serverurl, setServerurl] = useState(config.baseUrl);
  const [theme, setTheme] = useState(config.theme);
  const [showOffline, setShowOffline] = useState(config.showOffline);

  function handleClose(apply: boolean) {
    if (apply) {
      config.baseUrl = serverurl;
      config.theme = theme;
      config.showOffline = showOffline;
    }
    props.onClose(apply);
  }

  return (
    <div>
      <Dialog open={props.open} >
        <DialogTitle>Settings</DialogTitle>
        <DialogContent dividers>
          <TextField
            autoFocus margin="dense" id="host" label="Snapserver host" type="text" fullWidth variant="standard"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => { setServerurl(event.target.value as string) }}
            value={serverurl}
          />
          <Box sx={{ py: 1 }} />
          <FormControl variant="standard" fullWidth sx={{ minWidth: 100 }}>
            <InputLabel id="theme-label">Theme</InputLabel>
            <Select
              labelId="theme-select-label"
              id="demo-theme-select"
              value={theme}
              label="Theme"
              onChange={(event: SelectChangeEvent<Theme>) => { console.log("Theme selected: " + event.target.value); setTheme(event.target.value as Theme) }}
            >
              <MenuItem value={Theme.System}>{Theme.System}</MenuItem>
              <MenuItem value={Theme.Light}>{Theme.Light}</MenuItem>
              <MenuItem value={Theme.Dark}>{Theme.Dark}</MenuItem>
            </Select>
          </FormControl>
          <Box sx={{ py: 1 }} />
          <FormControlLabel control={<Checkbox checked={showOffline} onChange={(_event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => setShowOffline(checked)} />} label="Show offline clients" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { handleClose(false) }}>Cancel</Button>
          <Button onClick={() => { handleClose(true) }}>OK</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

import React from 'react';
import { SnapControl, Snapcast } from '../snapcontrol';
import { Alert, Box, Button, Grid, InputAdornment, Menu, MenuItem, Slider, Snackbar, Stack, TextField, Typography, IconButton } from '@mui/material';
import { Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { VolumeUp as VolumeUpIcon, MoreVert as MoreVertIcon, VerticalAlignBottom } from '@mui/icons-material';


type ClientProps = {
  client: Snapcast.Client;
  snapcontrol: SnapControl
};

type ClientState = {
  // client: Snapcast.Client;
  anchorEl: HTMLElement | null;
  open: boolean;
  detailsOpen: boolean;
  deleted: boolean;
  undoOpen: boolean;
  // volume: {
  //   muted: boolean;
  //   percent: number;
  // };
};

class Client extends React.Component<ClientProps, ClientState> {
  state: ClientState = {
    anchorEl: null,
    open: false,
    detailsOpen: false,
    deleted: false,
    undoOpen: false,
    // volume: this.props.client.config.volume
  };

  onVolumeChange(value: number) {
    console.log("onVolumeChange: " + value);
    // let volume = { muted: this.state.volume.muted, percent: value as number };
    // this.setState({});// volume: volume });
    // this.props.snapcontrol.setVolume(this.props.client.id, volume.percent, volume.muted);
    this.props.client.config.volume.percent = value;
    this.props.snapcontrol.setVolume(this.props.client.id, value, false);
    this.setState({});
  };

  onOptionsClicked(event: React.MouseEvent<HTMLButtonElement>) {
    console.log("onOptionsClicked");
    this.setState({ anchorEl: event.currentTarget, open: true });
  };

  onClose() {
    this.setState({ anchorEl: null, open: false });
  };

  onDetailsClose() {
    this.setState({ detailsOpen: false });
  };

  onSelected(item: string) {
    console.log("Selected: " + item);
    if (item === "details") {
      this.setState({ detailsOpen: true });
    } else if (item === "delete") {

    }
    this.setState({ anchorEl: null, open: false });
  };

  onSnackbarClose(undo: boolean) {
    console.log('onSnackbarClose, undo: ' + undo);
    this.setState({ undoOpen: false });
    if (!undo)
      this.props.snapcontrol.deleteClient(this.props.client.id);
    else
      this.setState({ deleted: false, open: false });
  };

  render() {
    if (this.state.deleted) {
      if (!this.state.undoOpen)
        return null;

      return (
        <Snackbar
          open={this.state.undoOpen}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          autoHideDuration={6000}
          onClose={(_) => { this.onSnackbarClose(false) }}>
          <Alert onClose={(_) => { this.onSnackbarClose(false) }} severity="info" sx={{ width: '100%' }}
            action={
              <Button color="inherit" size="small" onClick={(_) => { this.onSnackbarClose(true) }}>
                Undo
              </Button>}
          >
            Deleted {this.props.client.getName()}
          </Alert>
        </Snackbar >
      );
    }

    let menuitems = [];
    menuitems.push(<MenuItem onClick={() => { this.onSelected("details") }}>Details</MenuItem>);
    if (!this.props.client.connected)
      menuitems.push(<MenuItem onClick={() => { this.setState({ deleted: true, undoOpen: true }) }}>Delete</MenuItem>);

    console.log("Render Client " + this.props.client.host.name + ", id: " + this.props.client.id);
    return (
      <Box sx={{ mr: 2, opacity: this.props.client.connected ? 1.0 : 0.5 }} >
        <Grid container spacing={2} justifyContent="center" alignItems="center" >
          <Grid item xs={11}>
            <Stack spacing={-2} direction="column">
              {/* item style={{ flexGrow: "1" }}> */}
              <Typography variant="subtitle1" align='left' gutterBottom>
                {this.props.client.config.name === "" ? this.props.client.host.name : this.props.client.config.name}
              </Typography>
              <Stack spacing={2} direction="row" alignItems="center">
                <IconButton aria-label="Mute">
                  <VolumeUpIcon />
                </IconButton>
                <Slider aria-label="Volume" color="secondary" min={0} max={100} size="small" key={"slider-" + this.props.client.id} value={this.props.client.config.volume.percent} onChange={(_, value) => { this.onVolumeChange(value as number) }} />
              </Stack>
            </Stack>
          </Grid>
          <Grid item xs={1}>
            <IconButton aria-label="Options" onClick={(event) => { this.onOptionsClicked(event); }}>
              <MoreVertIcon />
            </IconButton>
            <Menu
              id="basic-menu"
              anchorEl={this.state.anchorEl}
              open={this.state.open}
              onClose={() => { this.onClose() }}
              MenuListProps={{
                'aria-labelledby': 'basic-button',
              }}
            >
              {menuitems}
            </Menu>
          </Grid>
        </Grid>

        <Dialog open={this.state.detailsOpen} onClose={() => { this.onDetailsClose() }}>
          <DialogTitle>Client settings</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus margin="dense" id="name" label="Name" type="text" fullWidth variant="standard"
              defaultValue={this.props.client.config.name}
            />
            <TextField
              margin="dense" id="latency" label="Latency" type="number" fullWidth
              value={this.props.client.config.latency}
              InputProps={{
                endAdornment: <InputAdornment position="end">ms</InputAdornment>,
              }}
              variant="standard"
            />
            <TextField
              margin="dense" id="mac" label="MAC" type="text" fullWidth variant="standard"
              value={this.props.client.host.mac}
              InputProps={{
                readOnly: true,
              }}
            />
            <TextField
              margin="dense" id="id" label="ID" type="text" fullWidth variant="standard"
              value={this.props.client.id}
              InputProps={{
                readOnly: true,
              }}
            />
            <TextField
              margin="dense" id="ip" label="IP" type="text" fullWidth variant="standard"
              value={this.props.client.host.ip}
              InputProps={{
                readOnly: true,
              }}
            />
            <TextField
              margin="dense" id="host" label="Host" type="text" fullWidth variant="standard"
              value={this.props.client.host.name}
              InputProps={{
                readOnly: true,
              }}
            />
            <TextField
              margin="dense" id="os" label="OS" type="text" fullWidth variant="standard"
              value={this.props.client.host.os}
              InputProps={{
                readOnly: true,
              }}
            />
            <TextField
              margin="dense" id="version" label="Version" type="text" fullWidth variant="standard"
              value={this.props.client.snapclient.version}
              InputProps={{
                readOnly: true,
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { this.onDetailsClose() }}>Cancel</Button>
            <Button onClick={() => { this.onDetailsClose() }}>Apply</Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }
}


export default Client;

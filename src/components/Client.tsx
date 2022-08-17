import React from 'react';
import { SnapControl, Snapcast } from '../snapcontrol';
import { Box, Button, Grid, InputAdornment, Menu, MenuItem, Slider, Stack, TextField, Typography, IconButton } from '@mui/material';
import { Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { VolumeUp as VolumeUpIcon, MoreVert as MoreVertIcon } from '@mui/icons-material';


type ClientProps = {
  client: Snapcast.Client;
  snapcontrol: SnapControl
  onDelete: () => void;
};

type ClientState = {
  anchorEl: HTMLElement | null;
  open: boolean;
  detailsOpen: boolean;
  undoOpen: boolean;
  name: string;
  tmpLatency: number;
  latency: number;
};

class Client extends React.Component<ClientProps, ClientState> {
  state: ClientState = {
    anchorEl: null,
    open: false,
    detailsOpen: false,
    undoOpen: false,
    name: this.props.client.config.name,
    tmpLatency: this.props.client.config.latency,
    latency: this.props.client.config.latency
  };

  handleVolumeChange(value: number) {
    console.log("handleVolumeChange: " + value);
    this.props.client.config.volume.percent = value;
    this.props.snapcontrol.setVolume(this.props.client.id, value, false);
    this.setState({});
  };

  handleOptionsClicked(event: React.MouseEvent<HTMLButtonElement>) {
    console.log("handleOptionsClicked");
    this.setState({ anchorEl: event.currentTarget, open: true, name: this.props.client.config.name, tmpLatency: this.props.client.config.latency, latency: this.props.client.config.latency });
  };

  handleMenuClose() {
    this.setState({ anchorEl: null, open: false });
  };

  handleDetailsClose(apply: boolean) {
    this.setState({ detailsOpen: false });
    if (apply) {
      console.log('handleDetailsClose, setting latency to ' + this.state.tmpLatency + ', name: ' + this.state.name);
      this.props.snapcontrol.setClientName(this.props.client.id, this.state.name);
      this.props.snapcontrol.setClientLatency(this.props.client.id, this.state.tmpLatency);
      this.setState({ name: this.props.client.config.name, latency: this.state.tmpLatency });
    } else {
      console.log('handleDetailsClose, setting latency from ' + this.state.tmpLatency + ' to ' + this.state.latency);
      this.props.snapcontrol.setClientLatency(this.props.client.id, this.state.latency);
      this.setState({ name: this.props.client.config.name, tmpLatency: this.state.latency });
    }
  };

  handleDetailsClicked() {
    console.log("handleDetailsClicked");
    this.setState({ detailsOpen: true, anchorEl: null, open: false });
  };

  handleNameChange(name: string) {
    console.log('handleNameChange: ' + name);
    this.setState({ name: name });
  };

  handleLatencyChange(latency: number) {
    console.log('handleLatencyChange: ' + latency);
    this.setState({ tmpLatency: latency });
    this.props.snapcontrol.setClientLatency(this.props.client.id, latency);
  };


  render() {
    let menuitems = [];
    menuitems.push(<MenuItem onClick={() => { this.handleDetailsClicked() }}>Details</MenuItem>);
    if (!this.props.client.connected)
      menuitems.push(<MenuItem onClick={() => { this.props.onDelete(); this.setState({ anchorEl: null, open: false }); }}>Delete</MenuItem>);

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
                <Slider aria-label="Volume" color="secondary" min={0} max={100} size="small" key={"slider-" + this.props.client.id} value={this.props.client.config.volume.percent} onChange={(_, value) => { this.handleVolumeChange(value as number) }} />
              </Stack>
            </Stack>
          </Grid>
          <Grid item xs={1}>
            <IconButton aria-label="Options" onClick={(event) => { this.handleOptionsClicked(event); }}>
              <MoreVertIcon />
            </IconButton>
            <Menu
              id="basic-menu"
              anchorEl={this.state.anchorEl}
              open={this.state.open}
              onClose={() => { this.handleMenuClose() }}
              MenuListProps={{
                'aria-labelledby': 'basic-button',
              }}
            >
              {menuitems}
            </Menu>
          </Grid>
        </Grid>

        <Dialog open={this.state.detailsOpen} onClose={() => { this.handleDetailsClose(false) }}>
          <DialogTitle>Client settings</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus margin="dense" id="name" label="Name" type="text" fullWidth variant="standard"
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => { this.handleNameChange(event.target.value as string) }}
              value={this.state.name}
            />
            <TextField
              margin="dense" id="latency" label="Latency" type="number" fullWidth
              value={this.state.tmpLatency}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => { this.handleLatencyChange(Number(event.target.value) || 0) }}
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
            <Button onClick={() => { this.handleDetailsClose(true) }}>OK</Button>
            <Button onClick={() => { this.handleDetailsClose(false) }}>Cancel</Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }
}


export default Client;

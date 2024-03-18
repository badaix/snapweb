import React from 'react';
import { useState } from 'react';
import { SnapControl, Snapcast } from '../snapcontrol';
import { Box, Button, Grid, InputAdornment, Menu, MenuItem, Slider, Stack, TextField, Typography, IconButton } from '@mui/material';
import { Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { VolumeUp as VolumeUpIcon, VolumeOff as VolumeOffIcon, MoreVert as MoreVertIcon } from '@mui/icons-material';


type ClientProps = {
  client: Snapcast.Client;
  snapcontrol: SnapControl
  onDelete: () => void;
  onVolumeChange: () => void;
};


export default function Client(props: ClientProps) {
  const [update, setUpdate] = useState(0);
  const [anchorEl, setAnchorEl] = useState<Element | null>(null);
  const [open, setOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [name, setName] = useState(props.client.config.name);
  const [tmpLatency, setTmpLatency] = useState(props.client.config.latency);
  const [latency, setLatency] = useState(props.client.config.latency);

  function handleVolumeChange(value: number) {
    console.debug("handleVolumeChange: " + value);
    props.client.config.volume.percent = value;
    props.snapcontrol.setVolume(props.client.id, value, false);
    // setState({});
    props.onVolumeChange();
  }

  function handleOptionsClicked(event: React.MouseEvent<HTMLButtonElement>) {
    console.debug("handleOptionsClicked");
    setAnchorEl(event.currentTarget);
    setOpen(true);
    setName(props.client.config.name);
    setTmpLatency(props.client.config.latency);
    setLatency(props.client.config.latency);
  }

  function handleMenuClose() {
    setAnchorEl(null)
    setOpen(false);
  }

  function handleDetailsClose(apply: boolean) {
    setDetailsOpen(false);
    if (apply) {
      console.debug('handleDetailsClose, setting latency to ' + tmpLatency + ', name: ' + name);
      props.snapcontrol.setClientName(props.client.id, name);
      props.snapcontrol.setClientLatency(props.client.id, tmpLatency);
      setName(props.client.config.name)
      setLatency(tmpLatency);
    } else {
      console.debug('handleDetailsClose, setting latency from ' + tmpLatency + ' to ' + latency);
      props.snapcontrol.setClientLatency(props.client.id, latency);
      setName(props.client.config.name)
      setTmpLatency(latency);
    }
  }

  function handleDetailsClicked() {
    console.debug("handleDetailsClicked");
    setDetailsOpen(true);
    setAnchorEl(null);
    setOpen(false);
  }

  function handleNameChange(name: string) {
    console.debug('handleNameChange: ' + name);
    setName(name);
  }

  function handleLatencyChange(latency: number) {
    console.debug('handleLatencyChange: ' + latency);
    setTmpLatency(latency);
    props.snapcontrol.setClientLatency(props.client.id, latency);
  }

  function handleMuteClicked() {
    console.debug("handleMuteClicked");
    props.snapcontrol.setVolume(props.client.id, props.client.config.volume.percent, !props.client.config.volume.muted);
    setUpdate(update + 1);
  }

  const menuitems = [];
  menuitems.push(<MenuItem key='Menu-Details' onClick={() => { handleDetailsClicked() }}>Details</MenuItem>);
  if (!props.client.connected)
    menuitems.push(<MenuItem key='Menu-Delete' onClick={() => { props.onDelete(); setAnchorEl(null); setOpen(false); }}>Delete</MenuItem>);

  // console.debug("Render Client " + props.client.host.name + ", id: " + props.client.id);

  return (
    <Box sx={{ opacity: props.client.connected ? 1.0 : 0.5 }} >
      <Grid container spacing={2} justifyContent="center" alignItems="center" >
        <Grid item xs={true}>
          <Stack spacing={-1} direction="column">
            {/* item style={{ flexGrow: "1" }}> */}
            <Typography variant="subtitle1" align='left' gutterBottom>
              {props.client.config.name === "" ? props.client.host.name : props.client.config.name}
            </Typography>
            <Stack spacing={2} direction="row" alignItems="center">
              <IconButton aria-label="Mute" onClick={() => { handleMuteClicked() }}>
                {props.client.config.volume.muted ? <VolumeOffIcon /> : <VolumeUpIcon />}
              </IconButton>
              <Slider aria-label="Volume" color="secondary" min={0} max={100} size="small" key={"slider-" + props.client.id} value={props.client.config.volume.percent} onChange={(_, value) => { handleVolumeChange(value as number) }} />
            </Stack>
          </Stack>
        </Grid>
        <Grid item>
          <IconButton aria-label="Options" onClick={(event) => { handleOptionsClicked(event); }}>
            <MoreVertIcon />
          </IconButton>
          <Menu
            id="basic-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={() => { handleMenuClose() }}
            MenuListProps={{
              'aria-labelledby': 'basic-button',
            }}
          >
            {menuitems}
          </Menu>
        </Grid>
      </Grid>

      <Dialog open={detailsOpen} onClose={() => { handleDetailsClose(false) }}>
        <DialogTitle>Client settings</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus margin="dense" id="name" label="Name" type="text" fullWidth variant="standard"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => { handleNameChange(event.target.value as string) }}
            value={name}
          />
          <TextField
            margin="dense" id="latency" label="Latency" type="number" fullWidth
            value={tmpLatency}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => { handleLatencyChange(Number(event.target.value) || 0) }}
            InputProps={{
              endAdornment: <InputAdornment position="end">ms</InputAdornment>,
            }}
            variant="standard"
          />
          <TextField
            margin="dense" id="client" label="Client" type="text" fullWidth variant="standard"
            value={props.client.snapclient.name + " " + props.client.snapclient.version}
            InputProps={{
              readOnly: true,
            }}
          />
          <TextField
            margin="dense" id="mac" label="MAC" type="text" fullWidth variant="standard"
            value={props.client.host.mac}
            InputProps={{
              readOnly: true,
            }}
          />
          <TextField
            margin="dense" id="id" label="ID" type="text" fullWidth variant="standard"
            value={props.client.id}
            InputProps={{
              readOnly: true,
            }}
          />
          <TextField
            margin="dense" id="ip" label="IP" type="text" fullWidth variant="standard"
            value={props.client.host.ip}
            InputProps={{
              readOnly: true,
            }}
          />
          <TextField
            margin="dense" id="host" label="Host" type="text" fullWidth variant="standard"
            value={props.client.host.name}
            InputProps={{
              readOnly: true,
            }}
          />
          <TextField
            margin="dense" id="os" label="OS" type="text" fullWidth variant="standard"
            value={props.client.host.os}
            InputProps={{
              readOnly: true,
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { handleDetailsClose(false) }}>Cancel</Button>
          <Button onClick={() => { handleDetailsClose(true) }}>OK</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}


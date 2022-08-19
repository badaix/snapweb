import React from 'react';
import Client from './Client';
import logo from './logo192.png';
import { SnapControl, Snapcast } from '../snapcontrol';
import { Alert, Box, Button, Card, CardMedia, Checkbox, Divider, FormControl, FormControlLabel, FormGroup, Grid, MenuItem, Select, Snackbar, TextField, Typography, IconButton } from '@mui/material';
import { Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { PlayArrow as PlayArrowIcon, SkipPrevious as SkipPreviousIcon, SkipNext as SkipNextIcon, Settings as SettingsIcon } from '@mui/icons-material';


type GroupClient = {
  client: Snapcast.Client;
  inGroup: boolean;
  wasInGroup: boolean;
};

type GroupProps = {
  server: Snapcast.Server
  group: Snapcast.Group;
  snapcontrol: SnapControl;
  showOffline: boolean;
};

type GroupState = {
  anchorEl: HTMLElement | null;
  settingsOpen: boolean;
  clients: GroupClient[];
  streamId: string;
  deletedClients: Snapcast.Client[];
};


class Group extends React.Component<GroupProps, GroupState> {
  state: GroupState = {
    anchorEl: null,
    settingsOpen: false,
    clients: [],
    streamId: "",
    deletedClients: []
  };

  handleSettingsClicked(event: React.MouseEvent<HTMLButtonElement>) {
    console.log("handleSettingsClicked");

    let clients: GroupClient[] = [];
    for (let group of this.props.server.groups) {
      for (let client of group.clients) {
        let inGroup: boolean = this.props.group.clients.includes(client);
        clients.push({ client: client, inGroup: inGroup, wasInGroup: inGroup });
      }
    }

    // this.clients = [];
    // this.props.server.groups.map(group => group.clients.map(client => this.clients.push(client.id)));
    this.setState({ anchorEl: event.currentTarget, settingsOpen: true, clients: clients, streamId: this.props.group.stream_id });// , settingsClients: clients });
  };

  handleSettingsClose(apply: boolean) {
    console.log("handleSettingsClose: " + apply);
    if (apply) {
      let changed: boolean = false;
      for (let element of this.state.clients) {
        if (element.inGroup !== element.wasInGroup) {
          changed = true;
          break;
        }
      }

      if (changed) {
        let groupClients: string[] = [];
        for (let element of this.state.clients)
          if (element.inGroup)
            groupClients.push(element.client.id);
        this.props.snapcontrol.setClients(this.props.group.id, groupClients);
      }

      if (this.props.group.stream_id !== this.state.streamId)
        this.props.snapcontrol.setStream(this.props.group.id, this.state.streamId);
    }
    this.setState({ settingsOpen: false });
  };

  // handleStreamSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   console.log("handleStreamSelect: " + event.target.value);
  // };

  handleGroupClientChange(client: Snapcast.Client, inGroup: boolean) {
    console.log("handleGroupClientChange: " + client.id + ", in group: " + inGroup);
    let clients = this.state.clients;
    let idx = this.state.clients.findIndex(element => element.client === client);
    clients[idx].inGroup = inGroup;
    this.setState({ clients: clients });
  };

  handleClientDelete(client: Snapcast.Client) {
    console.log("handleClientDelete: " + client.getName());
    let deletedClients = this.state.deletedClients;
    if (!deletedClients.includes(client))
      deletedClients.push(client);
    this.setState({ deletedClients: deletedClients });
  }

  handleSnackbarClose(client: Snapcast.Client, undo: boolean) {
    console.log("handleSnackbarClose, client: " + client.getName() + ", undo: " + undo);
    if (!undo)
      this.props.snapcontrol.deleteClient(client.id);

    let deletedClients = this.state.deletedClients;
    if (deletedClients.includes(client))
      deletedClients.splice(deletedClients.indexOf(client), 1);

    this.setState({ deletedClients: deletedClients });
  };


  snackbar = () => (
    this.state.deletedClients.map(client =>
      <Snackbar
        open
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        autoHideDuration={6000}
        key={'snackbar-' + client.id}
        onClose={(_, reason: string) => { if (reason !== 'clickaway') this.handleSnackbarClose(client, false) }}>
        <Alert onClose={(_) => { this.handleSnackbarClose(client, false) }} severity="info" sx={{ width: '100%' }}
          action={
            <Button color="inherit" size="small" onClick={(_) => { this.handleSnackbarClose(client, true) }}>
              Undo
            </Button>}
        >
          Deleted {client.getName()}
        </Alert>
      </Snackbar >
    ));

  render() {
    console.log("Render Group " + this.props.group.id);
    let clients = [];
    for (let client of this.props.group.clients) {
      if ((client.connected || this.props.showOffline) && !this.state.deletedClients.includes(client)) {
        clients.push(<Client key={client.id} client={client} snapcontrol={this.props.snapcontrol} onDelete={() => { this.handleClientDelete(client) }} />);
      }
    }
    if (clients.length === 0)
      return (<div>{this.snackbar()}</div>);
    let stream = this.props.server.getStream(this.props.group.stream_id);
    let artUrl = stream?.properties.metadata.artUrl || logo;
    let title = stream?.properties.metadata.title || "Unknown title";
    let artist = stream?.properties.metadata.artist || "Unknown artist";
    console.log("Art URL: " + artUrl);

    let allClients = [];
    for (let group of this.props.server.groups)
      for (let client of group.clients)
        allClients.push(client);

    return (
      <div>
        <Card sx={{
          p: 2,
          my: 2,
          flexGrow: 1
        }}>
          <Grid
            container
            direction="row"
            wrap="nowrap"
            justifyContent="space-between"
            alignItems="center"
            sx={{
              mb: 2
            }}>

            <IconButton aria-label="Options" onClick={(event) => { this.handleSettingsClicked(event); }}>
              <SettingsIcon />
            </IconButton>
            <Grid item justifyContent="center">
              <CardMedia
                component="img"
                sx={{ width: 64 }}
                image={artUrl}
                alt="Live from space album cover"
              />
            </Grid>
            <Grid item xs={12} sm container wrap="nowrap">
              <Grid
                item
                container
                direction="column"
                spacing={0}
                sx={{ ml: 3 }}
                justifyContent="center"
              >
                <Box component="div" sx={{ textOverflow: 'ellipsis' }}>
                  <Typography
                    gutterBottom
                    variant="subtitle1"
                    align="left"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box'
                    }}
                  >
                    {title}
                  </Typography>
                </Box>
                <Typography noWrap variant="body1" gutterBottom align="left">
                  {artist}
                </Typography>
              </Grid>
              <Grid item>
                <FormControl variant="standard" fullWidth>
                  <Select
                    id="stream"
                    value={this.props.group.stream_id}
                    label="Stream"
                    onChange={(event) => {
                      let stream: string = event.target.value;
                      this.setState({ streamId: stream });
                      this.props.snapcontrol.setStream(this.props.group.id, stream);
                    }}
                  >
                    {this.props.server.streams.map(stream => <MenuItem key={stream.id} value={stream.id}>{stream.id}</MenuItem>)}
                  </Select>
                </FormControl>
                <Box sx={{ display: "flex", alignItems: "center", pl: 1, pb: 1 }}>
                  <IconButton aria-label="previous">
                    <SkipPreviousIcon />
                  </IconButton>
                  <IconButton aria-label="play/pause">
                    <PlayArrowIcon sx={{ height: 38, width: 38 }} />
                  </IconButton>
                  <IconButton aria-label="next">
                    <SkipNextIcon />
                  </IconButton>
                </Box>
              </Grid>
            </Grid>
          </Grid>
          <Divider />
          {clients}
        </Card>

        <Dialog fullWidth open={this.state.settingsOpen} onClose={() => { this.handleSettingsClose(false) }}>
          <DialogTitle>Group settings</DialogTitle>
          <DialogContent>
            <Divider textAlign="left">Stream</Divider>
            <TextField
              // label="Stream" 
              margin="dense" id="stream" select fullWidth variant="standard"
              value={this.state.streamId}
              onChange={(event) => { console.log('SetStream: ' + event.target.value); this.setState({ streamId: event.target.value }) }}
            >
              {this.props.server.streams.map(stream => <MenuItem key={stream.id} value={stream.id}>{stream.id}</MenuItem>)}
            </TextField>
            <Divider textAlign="left">Clients</Divider>
            <FormGroup>
              {this.state.clients.map(client => <FormControlLabel control={<Checkbox checked={client.inGroup} key={"cb-" + client.client.id} onChange={(e: React.ChangeEvent<HTMLInputElement>) => { this.handleGroupClientChange(client.client, e.target.checked) }} />} label={client.client.getName()} key={"label-" + client.client.id} />)}
            </FormGroup>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { this.handleSettingsClose(false) }}>Cancel</Button>
            <Button onClick={() => { this.handleSettingsClose(true) }}>OK</Button>
          </DialogActions>
        </Dialog>
        {this.snackbar()}
      </div>
    );
  }
}

export default Group;

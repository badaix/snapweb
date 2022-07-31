import React from 'react';
import logo from './snapcast-512.png';
import { SnapControl, Snapcast } from './snapcontrol';
import { Slider } from '@mui/material';
// import VolumeDown from '@mui/icons-material/VolumeDown';
import { VolumeUp, PlayArrow, MoreVert } from '@mui/icons-material';
import Stack from '@mui/material/Stack';
import { Box, ButtonBase } from '@mui/material';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import './App.css';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Container from "@mui/material/Container";
import Select, { SelectChangeEvent } from "@mui/material/Select";




const theme = createTheme({
  palette: {
    primary: {
      light: '#757ce8',
      main: '#607d8b',
      dark: '#002884',
      contrastText: '#fff',
    },
    secondary: {
      light: '#ff7961',
      main: '#f44336',
      dark: '#ba000d',
      contrastText: '#000',
    },
  },
  typography: {
    subtitle1: {
      fontSize: 17,
    },
    body1: {
      fontWeight: 500,
    },
    h5: {
      fontWeight: 300,
    }
  }
});

type ClientProps = {
  client: Snapcast.Client;
};

type ClientState = {
  // client: Snapcast.Client;
};

class Client extends React.Component<ClientProps, ClientState> {
  state: ClientState = {
    // optional second annotation for better type inference
    client: this.props.client,
  };

  onVolumeChange(event: Event, value: number | Array<number>) {
    console.log("onVolumeChange: " + value);
    // let client = this.state.client;
    // client.config.volume.percent = value as number;
    this.props.client.config.volume.percent = value as number;
    // this.setState({ client: client });
    this.setState({});
  };

  render() {
    console.log("Render Client " + this.props.client.host.name);
    return (
      <Box sx={{ mr: 2 }}>
        <Grid container spacing={2} justifyContent="center" alignItems="center" >
          <Grid item xs={11}>
            <Stack spacing={-2} direction="column">
              {/* item style={{ flexGrow: "1" }}> */}
              <Typography variant="subtitle1" align='left' gutterBottom>
                {this.props.client.config.name === "" ? this.props.client.host.name : this.props.client.config.name}
              </Typography>
              <Stack spacing={2} direction="row" alignItems="center">
                <IconButton aria-label="Mute">
                  <VolumeUp />
                </IconButton>
                <Slider aria-label="Volume" color="secondary" min={0} max={100} size="small" value={this.props.client.config.volume.percent} onChange={(event, value) => { this.onVolumeChange(event, value) }} />
              </Stack>
            </Stack>
          </Grid>
          <Grid item xs={1}>
            <IconButton aria-label="Options">
              <MoreVert />
            </IconButton>
          </Grid>
        </Grid>
      </Box>
    );
  }
}


type GroupProps = {
  // using `interface` is also ok
  server: Snapcast.Server
  group: Snapcast.Group;
};

type GroupState = {
  count: number; // like this
};

class Group extends React.Component<GroupProps, GroupState> {

  onStreamSelected(id: string) {
    console.log("onStreamSelected: " + id);
  };

  render() {
    console.log("Render Group " + this.props.group.id);
    let clients = [];
    for (let client of this.props.group.clients)
      if (client.connected)
        clients.push(<Client client={client} />);
    if (clients.length === 0)
      return (null);
    let stream = this.props.server.getStream(this.props.group.stream_id);
    let artUrl = stream?.properties.metadata.artUrl || logo;
    let title = stream?.properties.metadata.title || "Unknown title";
    let artist = stream?.properties.metadata.artist || "Unknown artist";
    console.log("Art URL: " + artUrl);

    return (
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
                {/* <InputLabel id="demo-simple-select-label">Stream</InputLabel> */}
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={this.props.group.stream_id}
                  label="Stream"
                  onChange={(event, child) => { this.onStreamSelected(event.target.value) }}
                >
                  {this.props.server.streams.map(stream => <MenuItem value={stream.id}>{stream.id} </MenuItem>)}
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
    );
  }
}


type ServerProps = {
  // using `interface` is also ok
  server: Snapcast.Server;
};

type ServerState = {
  server: Snapcast.Server;
};

class Server extends React.Component<ServerProps, ServerState> {
  // state: MyState = {
  //   // optional second annotation for better type inference
  //   count: this.props.count,
  // };

  render() {
    console.log("Render Server");
    // let groups = [];
    // for (let i = 0; i < this.state.count; i++)
    //   groups.push(<Group />);

    return (
      <Box sx={{ m: 1.5 }} >
        {this.props.server.groups.map(group => <Group group={group} server={this.props.server} />)}
        {/* this.props.server
        {groups} */}
      </Box>
    );
  }
}


class App extends React.Component<{ snapcontrol: SnapControl }, ServerState> {
  json = { "groups": [{ "clients": [{ "config": { "instance": 1, "latency": 0, "name": "Küche", "volume": { "muted": false, "percent": 41 } }, "connected": true, "host": { "arch": "armv7l", "ip": "::ffff:192.168.0.252", "mac": "b8:27:eb:45:e1:ae", "name": "kueche", "os": "Raspbian GNU/Linux 11 (bullseye)" }, "id": "b8:27:eb:45:e1:ae", "lastSeen": { "sec": 1659107107, "usec": 70451 }, "snapclient": { "name": "Snapclient", "protocolVersion": 2, "version": "0.26.0" } }, { "config": { "instance": 1, "latency": 0, "name": "Wohnzimmer", "volume": { "muted": false, "percent": 81 } }, "connected": true, "host": { "arch": "armv7l", "ip": "::ffff:192.168.0.3", "mac": "dc:a6:32:3f:bd:1c", "name": "raspberrypi", "os": "Raspbian GNU/Linux 11 (bullseye)" }, "id": "dc:a6:32:3f:bd:1c", "lastSeen": { "sec": 1659107106, "usec": 967903 }, "snapclient": { "name": "Snapclient", "protocolVersion": 2, "version": "0.26.0" } }, { "config": { "instance": 1, "latency": 0, "name": "", "volume": { "muted": false, "percent": 36 } }, "connected": false, "host": { "arch": "web", "ip": "192.168.0.38", "mac": "00:00:00:00:00:00", "name": "Snapweb client", "os": "Linux x86_64" }, "id": "2cb68ccc-94bb-444a-9837-12b80cb4ef64", "lastSeen": { "sec": 1659073670, "usec": 52728 }, "snapclient": { "name": "Snapweb", "protocolVersion": 2, "version": "0.4.0" } }, { "config": { "instance": 1, "latency": 0, "name": "Arbeitszimmer", "volume": { "muted": false, "percent": 73 } }, "connected": true, "host": { "arch": "armv7l", "ip": "::ffff:192.168.0.8", "mac": "74:da:38:3e:d2:56", "name": "arbeitszimmer", "os": "Raspbian GNU/Linux 10 (buster)" }, "id": "74:da:38:3e:d2:56", "lastSeen": { "sec": 1659107106, "usec": 344276 }, "snapclient": { "name": "Snapclient", "protocolVersion": 2, "version": "0.26.0" } }, { "config": { "instance": 1, "latency": 0, "name": "", "volume": { "muted": false, "percent": 28 } }, "connected": false, "host": { "arch": "arm64-v8a", "ip": "::ffff:192.168.0.192", "mac": "00:00:00:00:00:00", "name": "Pixel 4a", "os": "Android 12" }, "id": "d91f7722-44c7-4d52-b63e-984611238b75", "lastSeen": { "sec": 1659076681, "usec": 458282 }, "snapclient": { "name": "Snapclient", "protocolVersion": 2, "version": "0.26.0" } }], "id": "e02e0600-e68c-b128-147b-58ca0a063ecf", "muted": false, "name": "", "stream_id": "default" }, { "clients": [{ "config": { "instance": 1, "latency": 0, "name": "", "volume": { "muted": false, "percent": 2 } }, "connected": false, "host": { "arch": "web", "ip": "192.168.0.10", "mac": "00:00:00:00:00:00", "name": "Snapweb client", "os": "Win32" }, "id": "6bf61c54-a88c-4b97-8447-e186a52c673d", "lastSeen": { "sec": 1658131455, "usec": 112522 }, "snapclient": { "name": "Snapweb", "protocolVersion": 2, "version": "0.4.0" } }], "id": "1d5d515b-d5c0-2831-6415-c85225c4315f", "muted": false, "name": "", "stream_id": "default" }, { "clients": [{ "config": { "instance": 1, "latency": 0, "name": "", "volume": { "muted": false, "percent": 60 } }, "connected": false, "host": { "arch": "web", "ip": "192.168.0.10", "mac": "00:00:00:00:00:00", "name": "Snapweb client", "os": "Win32" }, "id": "7ce9a092-a6d7-4508-b5d3-310fb5c73a32", "lastSeen": { "sec": 1658135991, "usec": 462267 }, "snapclient": { "name": "Snapweb", "protocolVersion": 2, "version": "0.4.0" } }], "id": "78a849df-1025-bb10-cd7e-c7751bb1642c", "muted": false, "name": "", "stream_id": "default" }, { "clients": [{ "config": { "instance": 1, "latency": 0, "name": "", "volume": { "muted": false, "percent": 54 } }, "connected": false, "host": { "arch": "web", "ip": "192.168.0.192", "mac": "00:00:00:00:00:00", "name": "Snapweb client", "os": "Linux armv8l" }, "id": "1497ade9-c94b-4528-bc2c-b61c5d26bc38", "lastSeen": { "sec": 1658734688, "usec": 964264 }, "snapclient": { "name": "Snapweb", "protocolVersion": 2, "version": "0.4.0" } }], "id": "2c4fd25e-c1a3-0123-79d0-969425e5c0c2", "muted": false, "name": "", "stream_id": "default" }, { "clients": [{ "config": { "instance": 1, "latency": 0, "name": "", "volume": { "muted": false, "percent": 100 } }, "connected": false, "host": { "arch": "web", "ip": "192.168.0.189", "mac": "00:00:00:00:00:00", "name": "Snapweb client", "os": "Linux armv8l" }, "id": "979c8e19-ed8c-4fe7-a0e2-568a069b1549", "lastSeen": { "sec": 1659103069, "usec": 235493 }, "snapclient": { "name": "Snapweb", "protocolVersion": 2, "version": "0.4.0" } }], "id": "b5d6c40c-86d1-a952-f11b-d97254b9a3ca", "muted": false, "name": "", "stream_id": "default" }], "server": { "host": { "arch": "armv7l", "ip": "", "mac": "", "name": "raspberrypi", "os": "Raspbian GNU/Linux 11 (bullseye)" }, "snapserver": { "controlProtocolVersion": 1, "name": "Snapserver", "protocolVersion": 1, "version": "0.26.0" } }, "streams": [{ "id": "default", "properties": { "canControl": true, "canGoNext": true, "canGoPrevious": true, "canPause": true, "canPlay": true, "canSeek": false, "loopStatus": "none", "metadata": { "artUrl": "http://cdn-profiles.tunein.com/s60240/images/logoq.png?t=636326", "artist": ["Radio Båstad 96.1 (Top 40 & Pop Music)"], "title": "Radio Bastad", "url": "tunein:station:s60240" }, "mute": false, "playbackStatus": "playing", "position": 0.9070000052452087, "shuffle": false, "volume": 100 }, "status": "playing", "uri": { "fragment": "", "host": "", "path": "/", "query": { "chunk_ms": "20", "codec": "flac", "controlscript": "/home/pi/meta_mopidy.py", "controlscriptparams": "--mopidy-host=192.168.0.3", "device": "hw:0,1,1", "name": "default", "sampleformat": "44100:16:2" }, "raw": "alsa:////?chunk_ms=20&codec=flac&controlscript=/home/pi/meta_mopidy.py&controlscriptparams=--mopidy-host=192.168.0.3&device=hw:0,1,1&name=default&sampleformat=44100:16:2", "scheme": "alsa" } }, { "id": "Spotify", "properties": { "canControl": true, "canGoNext": true, "canGoPrevious": true, "canPause": true, "canPlay": true, "canSeek": true, "loopStatus": "none", "metadata": { "album": "BREATHE", "artUrl": "http://i.scdn.co/image/ab67616d00001e020e6264910a1693e12310289d", "artist": ["Felix Jaehn", "VIZE", "Miss Li"], "contentCreated": "2021-10-01", "discNumber": 1, "duration": 159.96200561523438, "title": "Close Your Eyes", "trackId": "F0D74146287C4BD08E3427CE7C7D4533", "trackNumber": 2, "url": "spotify:track:7kswSnEiwuwuOQngMvpflV" }, "mute": false, "playbackStatus": "paused", "position": 0, "rate": 1, "shuffle": false, "volume": 100 }, "status": "idle", "uri": { "fragment": "", "host": "", "path": "//home/pi/Develop/librespot-java/librespot-api.sh", "query": { "chunk_ms": "20", "codec": "flac", "controlscript": "/home/pi/meta_librespot-java.py", "name": "Spotify", "sampleformat": "44100:16:2" }, "raw": "process://///home/pi/Develop/librespot-java/librespot-api.sh?chunk_ms=20&codec=flac&controlscript=/home/pi/meta_librespot-java.py&name=Spotify&sampleformat=44100:16:2", "scheme": "process" } }, { "id": "Meta", "properties": { "canControl": true, "canGoNext": true, "canGoPrevious": true, "canPause": true, "canPlay": true, "canSeek": true, "loopStatus": "none", "metadata": { "album": "BREATHE", "artUrl": "http://i.scdn.co/image/ab67616d00001e020e6264910a1693e12310289d", "artist": ["Felix Jaehn", "VIZE", "Miss Li"], "contentCreated": "2021-10-01", "discNumber": 1, "duration": 159.96200561523438, "title": "Close Your Eyes", "trackId": "F0D74146287C4BD08E3427CE7C7D4533", "trackNumber": 2, "url": "spotify:track:7kswSnEiwuwuOQngMvpflV" }, "mute": false, "playbackStatus": "paused", "position": 0, "rate": 1, "shuffle": false, "volume": 100 }, "status": "playing", "uri": { "fragment": "", "host": "", "path": "/Spotify/default", "query": { "chunk_ms": "20", "codec": "flac", "name": "Meta", "sampleformat": "44100:16:2" }, "raw": "meta:////Spotify/default?chunk_ms=20&codec=flac&name=Meta&sampleformat=44100:16:2", "scheme": "meta" } }] };
  // server.fromJson(json);

  state: ServerState = {
    server: new Snapcast.Server(this.json)
  };

  onChange(server: Snapcast.Server) {
    console.log("Update");
    this.setState({ server });
  }

  componentDidMount() {
    console.log("componentDidMount");
    this.props.snapcontrol.onChange = (server: Snapcast.Server) => this.onChange(server);
  }

  componentWillUnmount() {
    // clearInterval(this.timerID);
  }

  render() {
    return (
      <div className="App">
        <ThemeProvider theme={theme}>
          <AppBar position="sticky">
            <Toolbar>
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="menu"
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Snapcast
              </Typography>
              {/* <Button color="inherit">Login</Button> */}
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="menu"
                sx={{ mr: 2 }}
              >
                <PlayArrow fontSize="large" />
                {/* sx={{ height: 30, width: 30 }} /> */}
              </IconButton>
            </Toolbar>
          </AppBar>
          <Server server={this.state.server} />
        </ThemeProvider>
      </div >
    );
  }
}

export default App;


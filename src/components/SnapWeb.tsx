import { useState, useEffect, useRef } from 'react';
import Server from './Server';
import AboutDialog from './AboutDialog';
import SettingsDialog from './Settings';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Theme, config } from "../config";
import { SnapControl, Snapcast } from '../snapcontrol';
import { SnapStream } from '../snapstream';
import { AppBar, Box, Drawer, List, ListItem, ListItemButton, ListItemText, Toolbar, Typography, IconButton, Snackbar, Alert, Button } from '@mui/material';
import { PlayArrow as PlayArrowIcon, Stop as StopIcon, Menu as MenuIcon } from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import silence from '../assets/10-seconds-of-silence.mp3';
import snapcast512 from '../assets/snapcast-512.png';


const lightTheme = createTheme({
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

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
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


export default function SnapWeb() {
  const [update, setUpdate] = useState(0);
  const [server, setServer] = useState(new Snapcast.Server());
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showOffline, setShowOffline] = useState(config.showOffline);
  const [theme, setTheme] = useState(config.theme);
  const [serverUrl, setServerUrl] = useState(config.baseUrl);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isConnected, setConnected] = useState(false);
  const [connectError, setConnectError] = useState("");
  const snapstreamRef = useRef<SnapStream | null>(null);
  const audioRef = useRef(new Audio());
  const snapControlRef = useRef(new SnapControl());

  // json = { "groups": [{ "clients": [{ "config": { "instance": 1, "latency": 0, "name": "Küche", "volume": { "muted": false, "percent": 41 } }, "connected": true, "host": { "arch": "armv7l", "ip": "::ffff:192.168.0.252", "mac": "b8:27:eb:45:e1:ae", "name": "kueche", "os": "Raspbian GNU/Linux 11 (bullseye)" }, "id": "b8:27:eb:45:e1:ae", "lastSeen": { "sec": 1659107107, "usec": 70451 }, "snapclient": { "name": "Snapclient", "protocolVersion": 2, "version": "0.26.0" } }, { "config": { "instance": 1, "latency": 0, "name": "Wohnzimmer", "volume": { "muted": false, "percent": 81 } }, "connected": true, "host": { "arch": "armv7l", "ip": "::ffff:192.168.0.3", "mac": "dc:a6:32:3f:bd:1c", "name": "raspberrypi", "os": "Raspbian GNU/Linux 11 (bullseye)" }, "id": "dc:a6:32:3f:bd:1c", "lastSeen": { "sec": 1659107106, "usec": 967903 }, "snapclient": { "name": "Snapclient", "protocolVersion": 2, "version": "0.26.0" } }, { "config": { "instance": 1, "latency": 0, "name": "", "volume": { "muted": false, "percent": 36 } }, "connected": false, "host": { "arch": "web", "ip": "192.168.0.38", "mac": "00:00:00:00:00:00", "name": "Snapweb client", "os": "Linux x86_64" }, "id": "2cb68ccc-94bb-444a-9837-12b80cb4ef64", "lastSeen": { "sec": 1659073670, "usec": 52728 }, "snapclient": { "name": "Snapweb", "protocolVersion": 2, "version": "0.4.0" } }, { "config": { "instance": 1, "latency": 0, "name": "Arbeitszimmer", "volume": { "muted": false, "percent": 73 } }, "connected": true, "host": { "arch": "armv7l", "ip": "::ffff:192.168.0.8", "mac": "74:da:38:3e:d2:56", "name": "arbeitszimmer", "os": "Raspbian GNU/Linux 10 (buster)" }, "id": "74:da:38:3e:d2:56", "lastSeen": { "sec": 1659107106, "usec": 344276 }, "snapclient": { "name": "Snapclient", "protocolVersion": 2, "version": "0.26.0" } }, { "config": { "instance": 1, "latency": 0, "name": "", "volume": { "muted": false, "percent": 28 } }, "connected": false, "host": { "arch": "arm64-v8a", "ip": "::ffff:192.168.0.192", "mac": "00:00:00:00:00:00", "name": "Pixel 4a", "os": "Android 12" }, "id": "d91f7722-44c7-4d52-b63e-984611238b75", "lastSeen": { "sec": 1659076681, "usec": 458282 }, "snapclient": { "name": "Snapclient", "protocolVersion": 2, "version": "0.26.0" } }], "id": "e02e0600-e68c-b128-147b-58ca0a063ecf", "muted": false, "name": "", "stream_id": "default" }, { "clients": [{ "config": { "instance": 1, "latency": 0, "name": "", "volume": { "muted": false, "percent": 2 } }, "connected": false, "host": { "arch": "web", "ip": "192.168.0.10", "mac": "00:00:00:00:00:00", "name": "Snapweb client", "os": "Win32" }, "id": "6bf61c54-a88c-4b97-8447-e186a52c673d", "lastSeen": { "sec": 1658131455, "usec": 112522 }, "snapclient": { "name": "Snapweb", "protocolVersion": 2, "version": "0.4.0" } }], "id": "1d5d515b-d5c0-2831-6415-c85225c4315f", "muted": false, "name": "", "stream_id": "default" }, { "clients": [{ "config": { "instance": 1, "latency": 0, "name": "", "volume": { "muted": false, "percent": 60 } }, "connected": false, "host": { "arch": "web", "ip": "192.168.0.10", "mac": "00:00:00:00:00:00", "name": "Snapweb client", "os": "Win32" }, "id": "7ce9a092-a6d7-4508-b5d3-310fb5c73a32", "lastSeen": { "sec": 1658135991, "usec": 462267 }, "snapclient": { "name": "Snapweb", "protocolVersion": 2, "version": "0.4.0" } }], "id": "78a849df-1025-bb10-cd7e-c7751bb1642c", "muted": false, "name": "", "stream_id": "default" }, { "clients": [{ "config": { "instance": 1, "latency": 0, "name": "", "volume": { "muted": false, "percent": 54 } }, "connected": false, "host": { "arch": "web", "ip": "192.168.0.192", "mac": "00:00:00:00:00:00", "name": "Snapweb client", "os": "Linux armv8l" }, "id": "1497ade9-c94b-4528-bc2c-b61c5d26bc38", "lastSeen": { "sec": 1658734688, "usec": 964264 }, "snapclient": { "name": "Snapweb", "protocolVersion": 2, "version": "0.4.0" } }], "id": "2c4fd25e-c1a3-0123-79d0-969425e5c0c2", "muted": false, "name": "", "stream_id": "default" }, { "clients": [{ "config": { "instance": 1, "latency": 0, "name": "", "volume": { "muted": false, "percent": 100 } }, "connected": false, "host": { "arch": "web", "ip": "192.168.0.189", "mac": "00:00:00:00:00:00", "name": "Snapweb client", "os": "Linux armv8l" }, "id": "979c8e19-ed8c-4fe7-a0e2-568a069b1549", "lastSeen": { "sec": 1659103069, "usec": 235493 }, "snapclient": { "name": "Snapweb", "protocolVersion": 2, "version": "0.4.0" } }], "id": "b5d6c40c-86d1-a952-f11b-d97254b9a3ca", "muted": false, "name": "", "stream_id": "default" }], "server": { "host": { "arch": "armv7l", "ip": "", "mac": "", "name": "raspberrypi", "os": "Raspbian GNU/Linux 11 (bullseye)" }, "snapserver": { "controlProtocolVersion": 1, "name": "Snapserver", "protocolVersion": 1, "version": "0.26.0" } }, "streams": [{ "id": "default", "properties": { "canControl": true, "canGoNext": true, "canGoPrevious": true, "canPause": true, "canPlay": true, "canSeek": false, "loopStatus": "none", "metadata": { "artUrl": "http://cdn-profiles.tunein.com/s60240/images/logoq.png?t=636326", "artist": ["Radio Båstad 96.1 (Top 40 & Pop Music)"], "title": "Radio Bastad", "url": "tunein:station:s60240" }, "mute": false, "playbackStatus": "playing", "position": 0.9070000052452087, "shuffle": false, "volume": 100 }, "status": "playing", "uri": { "fragment": "", "host": "", "path": "/", "query": { "chunk_ms": "20", "codec": "flac", "controlscript": "/home/pi/meta_mopidy.py", "controlscriptparams": "--mopidy-host=192.168.0.3", "device": "hw:0,1,1", "name": "default", "sampleformat": "44100:16:2" }, "raw": "alsa:////?chunk_ms=20&codec=flac&controlscript=/home/pi/meta_mopidy.py&controlscriptparams=--mopidy-host=192.168.0.3&device=hw:0,1,1&name=default&sampleformat=44100:16:2", "scheme": "alsa" } }, { "id": "Spotify", "properties": { "canControl": true, "canGoNext": true, "canGoPrevious": true, "canPause": true, "canPlay": true, "canSeek": true, "loopStatus": "none", "metadata": { "album": "BREATHE", "artUrl": "http://i.scdn.co/image/ab67616d00001e020e6264910a1693e12310289d", "artist": ["Felix Jaehn", "VIZE", "Miss Li"], "contentCreated": "2021-10-01", "discNumber": 1, "duration": 159.96200561523438, "title": "Close Your Eyes", "trackId": "F0D74146287C4BD08E3427CE7C7D4533", "trackNumber": 2, "url": "spotify:track:7kswSnEiwuwuOQngMvpflV" }, "mute": false, "playbackStatus": "paused", "position": 0, "rate": 1, "shuffle": false, "volume": 100 }, "status": "idle", "uri": { "fragment": "", "host": "", "path": "//home/pi/Develop/librespot-java/librespot-api.sh", "query": { "chunk_ms": "20", "codec": "flac", "controlscript": "/home/pi/meta_librespot-java.py", "name": "Spotify", "sampleformat": "44100:16:2" }, "raw": "process://///home/pi/Develop/librespot-java/librespot-api.sh?chunk_ms=20&codec=flac&controlscript=/home/pi/meta_librespot-java.py&name=Spotify&sampleformat=44100:16:2", "scheme": "process" } }, { "id": "Meta", "properties": { "canControl": true, "canGoNext": true, "canGoPrevious": true, "canPause": true, "canPlay": true, "canSeek": true, "loopStatus": "none", "metadata": { "album": "BREATHE", "artUrl": "http://i.scdn.co/image/ab67616d00001e020e6264910a1693e12310289d", "artist": ["Felix Jaehn", "VIZE", "Miss Li"], "contentCreated": "2021-10-01", "discNumber": 1, "duration": 159.96200561523438, "title": "Close Your Eyes", "trackId": "F0D74146287C4BD08E3427CE7C7D4533", "trackNumber": 2, "url": "spotify:track:7kswSnEiwuwuOQngMvpflV" }, "mute": false, "playbackStatus": "paused", "position": 0, "rate": 1, "shuffle": false, "volume": 100 }, "status": "playing", "uri": { "fragment": "", "host": "", "path": "/Spotify/default", "query": { "chunk_ms": "20", "codec": "flac", "name": "Meta", "sampleformat": "44100:16:2" }, "raw": "meta:////Spotify/default?chunk_ms=20&codec=flac&name=Meta&sampleformat=44100:16:2", "scheme": "meta" } }] };
  // server.fromJson(json);
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  // Update color theme when the prefered theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', _event => {
    setTheme(config.theme);
  });

  useEffect(() => {
    console.debug("server updated");
  }, [server]);

  useEffect(() => {
    console.debug("serverUrl updated: " + serverUrl);
    setServer(new Snapcast.Server());
    snapControlRef.current.connect(serverUrl);
    const connection = snapControlRef.current;
    return () => {
      connection.disconnect();
    };
  }, [serverUrl]);

  function handleChange(snapserver: Snapcast.Server) {
    console.debug("Update: " + server.groups.length + " => " + snapserver.groups.length);
    setServer(snapserver);
    setUpdate(update + 1);
    updateMediaSession();
  }

  snapControlRef.current.onChange = (_control: SnapControl, server: Snapcast.Server) => handleChange(server);
  snapControlRef.current.onConnectionChanged = (_control: SnapControl, connected: boolean, error?: string) => {
    console.log("Connection state changed: " + connected + ", error: " + error);
    if (!connected) {
      setIsPlaying(false);
      setServer(new Snapcast.Server());
      if (error)
        setConnectError(error);
    }
    setConnected(connected);
  };


  function getMyStreamId(): string {
    try {
      const group = snapControlRef.current.getGroupFromClient(SnapStream.getClientId());
      return snapControlRef.current.getStream(group.stream_id).id;
    } catch (e) {
      return "";
    }
  }

  function updateMediaSession() {
    // https://developers.google.com/web/updates/2017/02/media-session
    // https://github.com/googlechrome/samples/tree/gh-pages/media-session
    // https://googlechrome.github.io/samples/media-session/audio.html
    // https://developer.mozilla.org/en-US/docs/Web/API/MediaSession/setActionHandler#seekto
    console.debug('updateMediaSession');
    if (!snapstreamRef.current)
      return;
    try {
      const streamId = getMyStreamId();
      const properties = snapControlRef.current.getStream(streamId).properties;
      const metadata = properties.metadata;
      const title: string = metadata?.title || "Unknown Title";
      const artist: string = (metadata?.artist !== undefined) ? metadata?.artist.join(', ') : "Unknown Artist";
      const album: string = metadata?.album || "";
      let artwork: Array<MediaImage> = [{ src: snapcast512, sizes: '512x512', type: 'image/png' }];
      if (metadata?.artUrl !== undefined) {
        artwork = [
          { src: metadata.artUrl, sizes: '96x96', type: 'image/png' },
          { src: metadata.artUrl, sizes: '128x128', type: 'image/png' },
          { src: metadata.artUrl, sizes: '192x192', type: 'image/png' },
          { src: metadata.artUrl, sizes: '256x256', type: 'image/png' },
          { src: metadata.artUrl, sizes: '384x384', type: 'image/png' },
          { src: metadata.artUrl, sizes: '512x512', type: 'image/png' },
        ]
      } // || 'snapcast-512.png';
      console.info('Metadata title: ' + title + ', artist: ' + artist + ', album: ' + album + ", artwork: " + artwork);
      navigator.mediaSession!.metadata = new MediaMetadata({
        title: title,
        artist: artist,
        album: album,
        artwork: artwork
      });

      const mediaSession = navigator.mediaSession!;
      let play_state: MediaSessionPlaybackState = "none";
      if (properties.playbackStatus !== undefined) {
        if (properties.playbackStatus === "playing") {
          console.debug('updateMediaSession: playing');
          audioRef.current.play();
          play_state = "playing";
        }
        else if (properties.playbackStatus === "paused") {
          console.debug('updateMediaSession: paused');
          audioRef.current.pause();
          play_state = "paused";
        }
        else if (properties.playbackStatus === "stopped") {
          console.debug('updateMediaSession: stopped');
          audioRef.current.pause();
          play_state = "none";
        }
      }

      mediaSession.playbackState = play_state;
      mediaSession.setActionHandler('play', properties.canPlay ? () => { snapControlRef.current.control(streamId, 'play') } : null);
      mediaSession.setActionHandler('pause', properties.canPause ? () => { snapControlRef.current.control(streamId, 'pause') } : null);
      mediaSession.setActionHandler('previoustrack', properties.canGoPrevious ? () => { snapControlRef.current.control(streamId, 'previous') } : null);
      mediaSession.setActionHandler('nexttrack', properties.canGoNext ? () => { snapControlRef.current.control(streamId, 'next') } : null);
      try {
        mediaSession.setActionHandler('stop', properties.canControl ? () => { snapControlRef.current.control(streamId, 'stop') } : null);
      } catch (error) {
        console.debug('Warning! The "stop" media session action is not supported.');
      }
      const defaultSkipTime: number = 10; // Time to skip in seconds by default
      mediaSession.setActionHandler('seekbackward', properties.canSeek ?
        (event: MediaSessionActionDetails) => {
          const offset: number = (event.seekOffset || defaultSkipTime) * -1;
          if (properties.position !== undefined)
            Math.max(properties.position! + offset, 0);
          snapControlRef.current.control(streamId, 'seek', { 'offset': offset })
        } : null);

      mediaSession.setActionHandler('seekforward', properties.canSeek ? (event: MediaSessionActionDetails) => {
        const offset: number = event.seekOffset || defaultSkipTime;
        if ((metadata?.duration !== undefined) && (properties.position !== undefined))
          Math.min(properties.position! + offset, metadata.duration!);
        snapControlRef.current.control(streamId, 'seek', { 'offset': offset })
      } : null);

      try {
        mediaSession.setActionHandler('seekto', properties.canSeek ? (event: MediaSessionActionDetails) => {
          const position: number = event.seekTime || 0;
          if (metadata?.duration !== undefined)
            Math.min(position, metadata.duration!);
          snapControlRef.current.control(streamId, 'setPosition', { 'position': position })
        } : null);
      } catch (error) {
        console.debug('Warning! The "seekto" media session action is not supported.');
      }

      if ((metadata?.duration !== undefined) && (properties.position !== undefined) && (properties.position! <= metadata.duration!)) {
        if ('setPositionState' in mediaSession) {
          console.debug('Updating position state: ' + properties.position! + '/' + metadata.duration!);
          mediaSession.setPositionState!({
            duration: metadata.duration,
            playbackRate: 1.0,
            position: properties.position!
          });
        }
      }
      else {
        mediaSession.setPositionState!({
          duration: 0,
          playbackRate: 1.0,
          position: 0
        });
      }
    }
    catch (e) {
      console.debug('updateMediaSession failed: ' + e);
      return;
    }

  }

  useEffect(() => {
    if (isPlaying) {
      console.debug("isPlaying changed to true");
      audioRef.current.src = silence;
      audioRef.current.loop = true;
      audioRef.current.play().then(() => {
        snapstreamRef.current = new SnapStream(config.baseUrl);
      });
      //   updateMediaSession();
      // });
    } else {
      console.debug("isPlaying changed to false");
      if (snapstreamRef.current)
        snapstreamRef.current.stop();
      snapstreamRef.current = null;
      audioRef.current.pause();
      audioRef.current.src = '';
      // updateMediaSession();
      // document.body.removeChild(audio);
    }
  }, [isPlaying]);


  function list() {
    return (
      <Box
        // sx={{ width: 250 }}
        role="presentation"
        sx={{ mt: 1 }}
      // onClick={toggleDrawer(anchor, false)}
      // onKeyDown={toggleDrawer(anchor, false)}
      >
        <List>
          <ListItem key="about" disablePadding>
            <ListItemButton onClick={() => { setAboutOpen(true); setDrawerOpen(false); }}>
              <ListItemText primary="About..." />
            </ListItemButton>
          </ListItem>
          <ListItem key="settings" disablePadding>
            <ListItemButton onClick={() => { setSettingsOpen(true); setDrawerOpen(false); }}>
              <ListItemText primary="Settings..." />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    );
  }

  function snackbar() {
    if (isConnected) {
      return (null);
    }
    return (
      <Snackbar
        open
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        key='connect-error'
        onClose={(_, reason: string) => { if (reason !== 'clickaway') { console.log("Snackbar - onClose") } }}>
        <Alert onClose={(_) => { console.log("Snackbar - alert onClose") }} severity="error" sx={{ width: '100%' }}
          action={
            <Button color="inherit" size="small" onClick={(_) => { setSettingsOpen(true); }}>
              Settings
            </Button>}
        >
          {connectError + "\nSnapserver host: " + config.baseUrl}
        </Alert>
      </Snackbar >
    )
  }

  return (
    <ThemeProvider theme={(theme == Theme.Dark || (theme == Theme.System && prefersDarkMode)) ? darkTheme : lightTheme}>
      <CssBaseline />
      <div className="SnapWeb">
        <AppBar position="sticky" >
          <Toolbar>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
              onClick={(_) => { setDrawerOpen(true); }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Snapcast
            </Typography>
            {isConnected ?
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="menu"
                sx={{ mr: 2 }}
                onClick={(_) => { setIsPlaying(!isPlaying); }}
              >
                {isPlaying ? <StopIcon fontSize="large" /> : <PlayArrowIcon fontSize="large" />}
              </IconButton> : <IconButton></IconButton>}
          </Toolbar>
        </AppBar>
        <Drawer
          anchor="top"
          open={drawerOpen} //</div>={state[anchor]}
          onClose={() => { setDrawerOpen(false); }}
        >
          {list()}
        </Drawer>
        <Server server={server} snapcontrol={snapControlRef.current} showOffline={showOffline} />
        {snackbar()}
        <AboutDialog open={aboutOpen} onClose={() => { setAboutOpen(false); }} />
        <SettingsDialog open={settingsOpen} onClose={(apply: boolean) => {
          console.log("Apply: " + apply + ", Serrver url: " + config.baseUrl);
          setSettingsOpen(false);
          if (apply) {
            setServerUrl(config.baseUrl);
            setTheme(config.theme);
            setShowOffline(config.showOffline);
          }
        }} />
      </div >
    </ThemeProvider>
  );
}


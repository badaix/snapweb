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
  },
  components: {
    MuiTextField: {
      defaultProps:
      {
        spellCheck: false
      }
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
  },
  components: {
    MuiTextField: {
      defaultProps:
      {
        spellCheck: false
      }
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

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  // Update color theme when the preferred theme changes. Registered once via
  // useEffect (registering in the render body leaked a listener per render).
  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setTheme(config.theme);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

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
          snapControlRef.current.control(streamId, 'seek', { 'offset': offset })
        } : null);

      mediaSession.setActionHandler('seekforward', properties.canSeek ? (event: MediaSessionActionDetails) => {
        const offset: number = event.seekOffset || defaultSkipTime;
        snapControlRef.current.control(streamId, 'seek', { 'offset': offset })
      } : null);

      try {
        mediaSession.setActionHandler('seekto', properties.canSeek ? (event: MediaSessionActionDetails) => {
          const position: number = event.seekTime || 0;
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


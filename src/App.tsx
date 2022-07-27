import React from 'react';
import logo from './snapcast-512.png';
import { SnapControl } from './snapcontrol';
import { Slider } from '@mui/material';
// import VolumeDown from '@mui/icons-material/VolumeDown';
import { VolumeUp, PlayArrow } from '@mui/icons-material';
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
import Select, { SelectChangeEvent } from "@mui/material/Select";


let snapcontrol!: SnapControl;


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
});


class Client extends React.Component {
  render() {
    return (
      <Box>
        {/* sx={{ minWidth: 275 }}> */}
        <Grid container spacing={2}>
          <Grid item xs={11}>
            {/* item style={{ flexGrow: "1" }}> */}
            <Typography variant="h6" align='left' gutterBottom>
              Livingroom
            </Typography>
            <Stack spacing={2} direction="row" alignItems="center">
              <VolumeUp />
              <Slider aria-label="Volume" />
            </Stack>
          </Grid>
          <Grid item xs={1} >
            <Box justifyContent="center" alignItems="center">
              <PlayArrow />
            </Box>
          </Grid>
        </Grid>
      </Box>
    );
  }
}


class Group extends React.Component {
  render() {
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
              image={logo}
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
              <Typography
                noWrap
                gutterBottom
                variant="h5"
                align="left"
              >
                Gemini - Ocean Edit
              </Typography>
              <Typography noWrap variant="h6" gutterBottom align="left">
                David Bay
              </Typography>
            </Grid>
            <Grid item>
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">Stream</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value="10"
                  label="Stream"
                >
                  <MenuItem value={10}>Default</MenuItem>
                  <MenuItem value={20}>Spotify</MenuItem>
                  <MenuItem value={30}>Airplay</MenuItem>
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
        <Client />
      </Card>
    );
  }
}

function App() {
  snapcontrol = new SnapControl("ws://127.0.0.1:1780");
  return (
    <div className="App">
      <ThemeProvider theme={theme}>
        <AppBar position="static">
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
              <PlayArrow />
            </IconButton>
          </Toolbar>
        </AppBar>
        <Box sx={{ m: 1.5 }} >
          <Group />
          <Group />
          <Group />
        </Box>
      </ThemeProvider>
    </div >
  );
}

export default App;


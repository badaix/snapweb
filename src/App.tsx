import React from 'react';
import logo from './logo.svg';
import { Button, Slider } from '@mui/material';
// import VolumeDown from '@mui/icons-material/VolumeDown';
import { VolumeUp, VolumeDown, PlayArrow } from '@mui/icons-material';
import Stack from '@mui/material/Stack';
import { Box } from '@mui/material';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Grid from '@mui/material/Grid';
import './App.css';


function App() {
  return (
    <div className="App">
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
        <Card sx={{ minWidth: 275 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={11}>
                {/* item style={{ flexGrow: "1" }}> */}
                <Typography variant="h6" align='left' gutterBottom>
                  Livingroom
                </Typography>
                <Stack spacing={2} direction="row" alignItems="center">
                  <VolumeUp />
                  <Slider aria-label="Volume" />
                  {/* <VolumeUp /> */}
                </Stack>
                {/* <Slider disabled defaultValue={30} aria-label="Disabled slider" /> */}
              </Grid>
              <Grid item xs={1} >
                <Box justifyContent="center" alignItems="center">
                  <PlayArrow />
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
      {/* <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <Button color="primary">Hello World</Button>
        <Slider />
      </header> */}
    </div >
  );
}

export default App;

// import React from 'react';
// import logo from './logo.svg';
// import './App.css';

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.tsx</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

// export default App;

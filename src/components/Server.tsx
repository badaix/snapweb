import React from 'react';
// import './App.css';
import Group from './Group';
import { SnapControl, Snapcast } from '../snapcontrol';
import { Box } from '@mui/material';


type ServerProps = {
  server: Snapcast.Server;
  snapcontrol: SnapControl;
  showOffline: boolean;
};

type ServerState = {
  server: Snapcast.Server;
};

class Server extends React.Component<ServerProps, ServerState> {

  render() {
    console.log("Render Server");

    return (
      <Box sx={{ m: 1.5 }} >
        {this.props.server.groups.map(group => <Group group={group} key={group.id} server={this.props.server} snapcontrol={this.props.snapcontrol} showOffline={this.props.showOffline} />)}
      </Box>
    );
  }
}


export default Server;


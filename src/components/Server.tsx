import Group from './Group';
import { SnapControl, Snapcast } from '../snapcontrol';
import { Box } from '@mui/material';


type ServerProps = {
  server: Snapcast.Server;
  snapcontrol: SnapControl;
  showOffline: boolean;
};

export default function Server(props: ServerProps) {
  console.log("Render Server");
  return (
    <Box sx={{ m: 1.5 }} >
      {props.server.groups.map(group => <Group group={group} key={group.id} server={props.server} snapcontrol={props.snapcontrol} showOffline={props.showOffline} />)}
    </Box>
  );
}




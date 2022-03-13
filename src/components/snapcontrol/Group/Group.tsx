import React, { SyntheticEvent } from "react"
import { Group, Volume } from "types/snapcontrol"
import Client from 'components/snapcontrol/Client'
import Controller from 'classes/snapcontrol/Controller'
import StreamSelector from 'components/snapcontrol/StreamSelector'
import { useAppSelector } from 'state/snapserverHooks'
import { Card, CardBody, CardFooter, CardHeader, Button, Heading, Box, ResponsiveContext } from 'grommet'
import * as Icons from 'grommet-icons'

type Props = {
    id: string
}

const MUTED_COLORS  = {
    'dark': 'dark-5',
    'light': 'light-5'
}
const UNMUTED_COLORS  = {
    'dark': 'dark-2',
    'light': 'light-2'
}

const NewComponent: React.FC<Props> = ({ id }) => {

    // const size = React.useContext(ResponsiveContext);

    const groupsById = useAppSelector((state) => state.groupsById)
    const showOfflineClients = useAppSelector((state) => state.showOfflineClients)

    const instance: Group | undefined = React.useMemo(() => {
        return groupsById[id]
    }, [groupsById, id])

    const isMuted = React.useMemo(() => {
        return typeof instance?.muted === 'boolean' ? instance?.muted : false

    }, [instance?.muted])

    const clients = React.useMemo(() => {
        let newClients = instance?.clients || []
        if (!showOfflineClients) {
            newClients =  newClients.filter((c) => {
                return c.connected
            })
        }
        return newClients
    }, [instance.clients, showOfflineClients])

    const kids = React.useMemo(() => {
        return clients.map((client) => {
            return (
                <Client groupMuted={isMuted} id={client.id} key={client.id} />
            )
        }) || []
    }, [clients, isMuted])

    const background = React.useMemo(() => {
        return isMuted ? MUTED_COLORS : UNMUTED_COLORS
    }, [isMuted])

    const VolumeIcon = React.useMemo(() => {
        return isMuted == true ? Icons.VolumeMute : Icons.Volume

    }, [isMuted])

    const onMuteToggle = React.useCallback(() => {
        Controller.getInstance().serverInstance.groupSetMute({ id: instance?.id, mute: !instance?.muted })
    }, [instance?.muted, instance?.id])

    const onSelectStreamId = React.useCallback((event) => {
        const id = event.value
        Controller.getInstance().serverInstance.groupSetStream({ id: instance?.id, stream_id: id })
    }, [instance?.id])


    return (
        <Card background={background}>
            <CardHeader pad="none" justify="start" align="start" direction="column" background={background}>
                {instance?.name && <Heading margin={'none'} level={6}>{instance?.name}</Heading>}
                <Box fill='horizontal' direction="row" align="center" justify="stretch" gap="small" pad={'none'} margin={'none'}>
                    <StreamSelector  width={'100%'} onChange={onSelectStreamId} options={[]} value={instance?.stream_id} />
                </Box>
            </CardHeader>
            <CardBody pad="none">
                {kids}
            </CardBody>
            <CardFooter pad={'small'} direction='row' justify='between' background={background}>
                <Box flex='grow'>
                    <Button
                        icon={<VolumeIcon color="black" />}
                        label={`${isMuted ? 'Unm' : 'M'}ute`}
                        plain={true}
                        reverse
                        onClick={onMuteToggle}
                        hoverIndicator
                        fill
                        a11yTitle={isMuted ? 'Unmute the group stream' : 'Mute the group streams'}
                    />
                </Box>
                <Box flex='grow'>
                    <Button
                        plain={true}
                        fill
                        label={`Edit`}
                        justify="center"
                        icon={<Icons.Edit color="black" />}
                        hoverIndicator
                        a11yTitle="Edit the group"
                    />
                </Box>
            </CardFooter>
        </Card>
        // <div>
        //     <ul>
        //         <li>{instance?.name || 'unknown'}</li>
        //         <li>{instance?.muted ? 'muted': 'not muted'}</li>
        //         <li>{instance?.stream_id}</li>
        //         {kids}
        //     </ul>
        // </div>
    )
}

export default NewComponent
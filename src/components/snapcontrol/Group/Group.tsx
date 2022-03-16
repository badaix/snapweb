import React from "react"
import { Group } from "types/snapcontrol"
import Client from 'components/snapcontrol/Client'
import Controller from 'classes/snapcontrol/Controller'
import StreamSelector from 'components/snapcontrol/StreamSelector'
import { useAppSelector } from 'state/snapserverHooks'
import { Card, CardBody, CardHeader, Button, Heading, Box, Layer } from 'grommet'
import * as Icons from 'grommet-icons'
import EditForm from 'components/EditGroupSettingsForm'

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
    const clientsById = useAppSelector((state) => state.clientsById)
    const showOfflineClients = useAppSelector((state) => state.showOfflineClients)

    const instance: Group | undefined = React.useMemo(() => {
        return groupsById[id]
    }, [groupsById, id])

    const isMuted = React.useMemo(() => {
        return typeof instance?.muted === 'boolean' ? instance?.muted : false

    }, [instance?.muted])

    const clients = React.useMemo(() => {
        let newClients = instance?.clients.map((c) => clientsById[c.id]) || []
        if (!showOfflineClients) {
            newClients =  newClients.filter((c) => {
                return c.connected
            })
        }
        return newClients
    }, [instance.clients, showOfflineClients, clientsById])

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
        if (event) {
            const id = event.value
            Controller.getInstance().serverInstance.groupSetStream({ id: instance?.id, stream_id: id })
        }
    }, [instance?.id])

    const [show, setShow] = React.useState<boolean>(false)


    return (
        <>
        <Card background={background}>
            <CardHeader pad={{horizontal: 'small', vertical: 'xsmall'}} justify="between" align="center" direction="row" background={background}>
                <Box flex='grow' height={'100%'}>
                    <Button
                        icon={<VolumeIcon color="black" />}
                        plain={true}
                        reverse
                        onClick={onMuteToggle}
                        hoverIndicator
                        fill
                        a11yTitle={isMuted ? 'Unmute the group audio' : 'Mute the group audio'}
                    />
                </Box>
                <Box fill='horizontal' direction="row" align="center" justify="start" gap="small" pad={{horizontal: 'medium'}} margin={'none'}>
                    <StreamSelector width={'100%'} onChange={onSelectStreamId} options={[]} value={instance?.stream_id} />
                </Box>
                <Box flex='grow'  height={'100%'}>
                    <Button
                        plain={true}
                        fill
                        label={`Edit ${instance?.name.trim() || 'Group'} Settings`}
                        justify="center"
                        icon={<Icons.Edit color="black" />}
                        onClick={() => {setShow(true)}}
                        hoverIndicator
                        a11yTitle="Edit  settings"
                    />
                </Box>
            </CardHeader>
            <hr color="black" style={{'width': '98%', height: '1px'}}/>
            <CardBody pad="none">
                {kids}
            </CardBody>
        </Card>
        {show && (
                <Layer
                    onEsc={() => setShow(false)}
                    onClickOutside={() => setShow(false)}
                    background={{opacity: 'strong', color: 'light-4'}}
                >
                    <Box pad={'small'} gap='small' justify="start" background={{ opacity: 'strong', color: 'light-4' }}>
                        <EditForm id={id} />
                        <Box justify="end" >
                            <Button a11yTitle="Close Modal" label="Close" onClick={() => setShow(false)} />
                        </Box>
                    </Box>
                </Layer>
            )}
        </>
    )
}

export default NewComponent
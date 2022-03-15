import React from "react"
import { Client, Volume } from "types/snapcontrol"
import { useAppSelector } from 'state/snapserverHooks'
import {
    RangeInput,
    Heading,
    Button,
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Layer,
    Box,
} from 'grommet'
import Controller from "classes/snapcontrol/Controller"
import * as Icons from 'grommet-icons'
import EditForm from 'components/EditClientSettingsForm'


type Props = {
    id: string,
    groupMuted?: boolean
}

const NewComponent: React.FC<Props> = ({ id, groupMuted }) => {

    const clientsById = useAppSelector((state) => state.clientsById)
    const instance: Client | undefined = React.useMemo(() => {
        return clientsById[id]
    }, [id, clientsById])
    const VolumeIcon = React.useMemo(() => {
        const isMuted = typeof instance?.config.volume.muted === 'boolean' ? instance?.config.volume.muted : false
        return isMuted == true ? Icons.VolumeMute : Icons.Volume

    }, [instance?.config.volume.muted])

    const disabled = React.useMemo(() => {
        return !instance?.connected
    }, [instance?.connected])

    const [show, setShow] = React.useState<boolean>(false);

    const onMuteToggle = React.useCallback(() => {
        const newVolume: Volume = Object.assign({ percent: 0, muted: true }, instance?.config.volume)
        newVolume['muted'] = !newVolume['muted']
        Controller.getInstance().serverInstance.clientSetVolume({ id: instance?.id, volume: newVolume })
    }, [instance?.config.volume, instance?.id])

    const onVolumeChange = React.useCallback((ev: React.ChangeEvent<HTMLInputElement>) => {
        const percent = ev.currentTarget.valueAsNumber
        const newVolume: Volume = Object.assign({ percent: 0, muted: true }, instance?.config.volume, { percent: percent })
        Controller.getInstance().serverInstance.clientSetVolume({ id: instance?.id, volume: newVolume })
    }, [instance?.config.volume, instance?.id])
    return (
        <>
            <Card elevation="0" round={false}>
                <CardHeader align="center" justify="start">
                    <Heading level={4} margin={{ 'horizontal': 'small', vertical: 'none' }}>
                        {instance?.config.name || instance?.host.name}
                    </Heading>
                </CardHeader>
                <CardBody justify="between" direction="row" align="center">
                    <Button
                        icon={<VolumeIcon color="black" />}
                        hoverIndicator
                        onClick={onMuteToggle}
                        disabled={disabled}
                    />
                    <RangeInput
                        max={100}
                        min={0}
                        disabled={disabled}
                        step={1}
                        color={disabled || groupMuted ? 'status-disabled' : 'status-ok'}
                        onChange={onVolumeChange}
                        value={instance?.config.volume.percent} />
                    <Button
                        icon={<Icons.Edit color="black" />}
                        hoverIndicator
                        onClick={() => { setShow(true) }}
                    />
                </CardBody>
                <CardFooter>
                </CardFooter>
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
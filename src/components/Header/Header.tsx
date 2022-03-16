import React from "react"
import { useAppSelector } from 'state/snapserverHooks'
import Link from 'components/Link'
import { Header as GrommetHeader, Heading, Button } from "grommet"
import * as Icons from 'grommet-icons'
import Controller from 'classes/snapcontrol/Controller'

type Props = {
    siteTitle?: string,
    clientId?: string
}

const HeaderComponent: React.FC<Props> = ({ siteTitle }) => {
    const server = useAppSelector((state) => state.details)
    const snapstream = Controller.getInstance().streamInstance
    const playing = useAppSelector((state) => state.playing)
    const clientsById = useAppSelector((state) => state.clientsById)
    // const groupIdByClientId = useAppSelector((state) => state.groupIdByClientId)
    // const streamsById = useAppSelector((state) => state.streamsById)
    // const groupsById = useAppSelector((state) => state.groupsById)
    const myClientId = useAppSelector((state) => state.myClientId)

    // const myGroup = React.useMemo(() => {
    //     return groupsById[groupIdByClientId[myClientId]]
    // }, [myClientId, groupsById, groupIdByClientId])

    const myClient = React.useMemo(() => {
        return clientsById[myClientId]
    }, [myClientId, clientsById])

    // const myStream = React.useMemo(() => {
    //     return streamsById[myGroup.stream_id]
    // }, [myGroup, streamsById])

    const title = React.useMemo(() => {
        return server?.host?.name || siteTitle || 'Snapweb'
    }, [server?.host?.name, siteTitle])

    // const onClick = React.useCallback(() => {
    //     if (myStream?.properties.playbackStatus) {
    //         if (myStream.properties.playbackStatus === 'playing') {
    //             return Icons.StopFill
    //         } else if (myStream.properties.playbackStatus === 'paused') {
    //             snapstream.play()
    //         } else if (myStream.properties.playbackStatus === 'stopped') {
    //             snapstream.play()
    //         }
    //     }
    //     snapstream.play()
        
    // }, [snapstream, myStream?.properties.playbackStatus])

    const onClick = React.useCallback(() => {
        if (playing) {
            snapstream.stop()
        } else {
            snapstream.connect()
        }
    }, [snapstream, playing])

    const StatusIcon = React.useMemo(() => {
        if (playing) {
            return Icons.StopFill
        }
        return Icons.PlayFill

    }, [playing])
    return (
        <GrommetHeader background="brand" justify="between" pad={{'horizontal': 'medium'}}>
            <Heading margin={'none'} level={4}>
                <Link
                    to="/"
                    style={{
                        color: `white`,
                        textDecoration: `none`,
                    }}
                >
                    {title}
                </Link>
            </Heading>
            <Button margin={'none'}
            onClick={onClick}
                icon={<StatusIcon color="white" />}
                hoverIndicator
            />
        </GrommetHeader>
    )
}

export default HeaderComponent
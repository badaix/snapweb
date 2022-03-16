import React from "react"
import { useAppSelector } from 'state/snapserverHooks'
import Link from 'components/Link'
import { Header as GrommetHeader, Heading, Button } from "grommet"
import * as Icons from 'grommet-icons'
import Controller from 'classes/snapcontrol/Controller'

type Props = {
    siteTitle?: string
}

const HeaderComponent: React.FC<Props> = ({ siteTitle }) => {
    const server = useAppSelector((state) => state.details)
    const snapstream = Controller.getInstance().streamInstance
    const title = React.useMemo(() => {
        return server?.host?.name || siteTitle || 'Snapweb'
    }, [server?.host?.name, siteTitle])

    const onClick = React.useCallback(() => {
        snapstream.play()
    }, [snapstream])
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
                icon={<Icons.PlayFill color="white" />}
                hoverIndicator
            />
        </GrommetHeader>
    )
}

export default HeaderComponent
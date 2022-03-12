import React from "react"
import { useAppSelector } from 'state/snapserverHooks'
import Link from 'components/link'
import { Header as GrommetHeader, Heading, Button } from "grommet"
import * as Icons from 'grommet-icons'

type Props = {
    siteTitle?: string
}

const HeaderComponent: React.FC<Props> = ({ siteTitle }) => {
    const server = useAppSelector((state) => state.details)
    const title = React.useMemo(() => {
        return server?.host?.name || siteTitle || 'Snapweb'
    }, [server?.host?.name, siteTitle])
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
                icon={<Icons.PlayFill color="white" />}
                hoverIndicator
            />
        </GrommetHeader>
    )
}

export default HeaderComponent
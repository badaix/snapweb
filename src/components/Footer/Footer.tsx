import { Footer, Text, Anchor, Box, Button, Layer } from "grommet"
import React from "react"
import { useAppSelector } from 'state/snapserverHooks'
import * as Icons from 'grommet-icons'
import EditForm from 'components/EditServerSettingsForm'


const FooterComponent = () => {
    const server = useAppSelector((state) => state.details)
    const serverUrl = useAppSelector((state) => state.serverUrl)
    const serverRoot = React.useMemo(() => {
        if (!serverUrl) return ''
        try {
            return serverUrl?.replace('/' + serverUrl.split('//')[1].split('/')[1], '')
        } catch {
            return serverUrl
        }
    }, [serverUrl])

    const [show, setShow] = React.useState<boolean>(false)
    const handleClick = React.useCallback(() => {
        setShow(true)
    }, [setShow])

    return (
        <>
        <Footer background="light-4" justify="between" pad={{
            horizontal: 'large',
            vertical: 'small'
        }}>
            <Text textAlign="center" onClick={handleClick} size="small">
            </Text>
            <Text textAlign="center" size="small">
                {serverUrl ? (
                    server ? (
                        <span>
                            Connected to <Anchor title="Connected Server" href={serverRoot}>{server?.snapserver?.name}</Anchor> - {server?.snapserver?.version}
                        </span>
                        ) : <span>Disconnected from {serverUrl}</span>
                    
                ) : (
                    <Anchor onClick={handleClick}>Click to Connect</Anchor>
                ) }
                
                <br/>
                © {new Date().getFullYear()}, Built with
                {` `}
                <Anchor href="https://www.gatsbyjs.org">Gatsby</Anchor>
                {` and `}
                <Anchor href="https://v2.grommet.io">Grommet</Anchor>
            </Text>
            <Button hoverIndicator onClick={handleClick} plain icon={<Icons.SettingsOption />} />
        </Footer>
        {show && (
            <Layer
                onEsc={() => setShow(false)}
                onClickOutside={() => setShow(false)}
                background={{opacity: 'strong', color: 'light-4'}}
                >
                <Box
                background={{opacity: 'strong', color: 'light-4'}}
                pad={'small'} gap='small' justify="start">
                    <EditForm />
                    <Box justify="end" >
                        <Button a11yTitle="Close Modal" label="Close" onClick={() => setShow(false)} />
                    </Box>
                </Box>
            </Layer>
        )}
        </>
    )
}

export default FooterComponent
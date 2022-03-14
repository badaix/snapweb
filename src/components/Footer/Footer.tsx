import { Footer, Text, Anchor, Box, TextInput, CheckBox, FormField, Button, Heading, Layer } from "grommet"
import React from "react"
import { useAppSelector, useAppDispatch } from 'state/snapserverHooks'
import { setServerUrl, setServerId, setShowOfflineClients } from 'state/snapserverSlice'
import * as Icons from 'grommet-icons'
import { Formik, Form, Field, ErrorMessage } from 'formik';


type FormValues = {
    url: string
}

const EditForm: React.FC<any> = () => {
    const serverUrl = useAppSelector((state) => state.serverUrl)
    const showOfflineClients = useAppSelector((state) => state.showOfflineClients)
    const dispatch = useAppDispatch()

    const initialForm: FormValues = {
        url: serverUrl || ''
    }
    return (
        <Box>
            <Heading level={2} margin={{vertical: 'small', top: 'none'}}>Settings</Heading>
            <Formik
                initialValues={initialForm}
                validate={values => {
                    const errors: Partial<Record<keyof FormValues, string>> = {};
                    if (!values.url) {
                        errors.url = 'Required';
                    }
                    return errors;
                }}
                onSubmit={(values, { setSubmitting }) => {
                    dispatch(setServerUrl(values.url))
                    dispatch(setServerId(-1))
                    setSubmitting(false);
                }}
            >
                {({ isSubmitting, values }) => (
                    <Form>
                        <Box direction="column" align="center" justify="between">
                            <FormField width={'100%'} margin={'none'} htmlFor={`set-url`} name="url" error={<ErrorMessage name="url" />}>
                                <Field id={`set-url`} name="url" as={TextInput} placeholder='API URL' value={values.url} />
                            </FormField>
                            <Box width={'100%'}>
                                <Button label='Save API Url' color='status-ok' a11yTitle={'Save API URL'} margin='small' gap="xxsmall" alignSelf="stretch" type="submit" disabled={isSubmitting} icon={<Icons.CloudUpload color='status-ok' />} hoverIndicator size="small" />

                            </Box>
                        </Box>
                    </Form>
                )}
            </Formik>
            <CheckBox checked={showOfflineClients || false}
                label='Show offline clients'
                onChange={(event) => {dispatch(setShowOfflineClients(event.target.checked))}}
            />
        </Box>
    )
}

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
    const serverCleanRoot = React.useMemo(() => {
        if (!serverUrl) return ''
        try {
            return serverUrl.split('//')[1].split('/')[0]
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
            {/* <Button hoverIndicator plain label='' icon={<Icons.View />} /> */}
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
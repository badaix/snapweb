import { Footer, Text, Anchor, Box, TextInput, FormField, Button, Heading, Layer } from "grommet"
import React from "react"
import { useAppSelector, useAppDispatch } from 'state/snapserverHooks'
import { setServerUrl, setServerId} from 'state/snapserverSlice'
import * as Icons from 'grommet-icons'
import { Formik, Form, Field, ErrorMessage } from 'formik';


type FormValues = {
    url: string
}

type FormProps = {
    close?: (mode: boolean) => void
}

const EditForm: React.FC<FormProps> = ({close}) => {
    const serverUrl = useAppSelector((state) => state.serverUrl)
    const dispatch = useAppDispatch()

    const initialForm: FormValues = {
        url: serverUrl
    }
    return (
        <Box>
            <Heading level={5}>Set API URL</Heading>
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
                    if (close) {
                        close(false)
                    }
                }}
            >
                {({ isSubmitting }) => (
                    <Form>
                        <Box direction="row" align="center" justify="between">
                            <FormField width={'75%'} margin={'none'} htmlFor={`set-url`} name="url" error={<ErrorMessage name="url" />}>
                                <Field id={`set-url`} name="url" as={TextInput} placeholder='API URL' />
                            </FormField>
                            <Box flex={true}>
                                <Button color='status-ok' a11yTitle={'Save API URL'} margin='small' gap="xxsmall" alignSelf="stretch" type="submit" disabled={isSubmitting} icon={<Icons.CloudUpload color='status-ok' />} hoverIndicator size="small" />

                            </Box>
                        </Box>
                    </Form>
                )}
            </Formik>
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
        <Footer background="light-4" justify="center" pad="small">
            <Text textAlign="center" size="small">
                {serverUrl ? (
                    server ? (
                        <span>
                            Connected to <Anchor title="Change connected server" href={serverRoot}>{server?.snapserver?.name}</Anchor> - {server?.snapserver?.version} ({<Anchor onClick={handleClick}>{serverCleanRoot}</Anchor>})
                        </span>
                        ) : <span>Disconnected from <Anchor onClick={handleClick}>{serverUrl}</Anchor></span>
                    
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
            {show && (
                <Layer
                    onEsc={() => setShow(false)}
                    onClickOutside={() => setShow(false)}
                >
                    <Box pad={'small'} gap='small' justify="start">
                        <EditForm />
                        <Box justify="end" >
                            <Button a11yTitle="Close Modal" label="Close" onClick={() => setShow(false)} />
                        </Box>
                    </Box>
                </Layer>
            )}
        </Footer>
    )
}

export default FooterComponent
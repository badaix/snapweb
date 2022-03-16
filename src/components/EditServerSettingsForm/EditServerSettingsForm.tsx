import { Box, TextInput, CheckBox, FormField, Button, Heading } from "grommet"
import React from "react"
import { useAppSelector, useAppDispatch } from 'state/snapserverHooks'
import { setCustomUrl, setServerUrl, setShowOfflineClients, setStreamUrl } from 'state/snapserverSlice'
import * as Icons from 'grommet-icons'
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik';


type FormValues = {
    url: string
    streamUrl: string
    customUrl: string
}

const EditServerSettingsForm: React.FC<any> = () => {
    const serverUrl = useAppSelector((state) => state.serverUrl)
    const streamUrl = useAppSelector((state) => state.streamUrl)
    const customUrl = useAppSelector((state) => state.customUrl)
    const showOfflineClients = useAppSelector((state) => state.showOfflineClients)
    const dispatch = useAppDispatch()

    const [customUrls, setCustomUrls] = React.useState(false)

    React.useEffect(() => {
        if (customUrl) {
            setCustomUrls(false)
        } else {
            setCustomUrls(true)
        }
    }, [customUrl, setCustomUrls])

    const initialForm: FormValues = {
        url: serverUrl || '',
        streamUrl: streamUrl || '',
        customUrl: customUrl || '',
    }

    const onSubmit = React.useCallback((values: FormValues, helpers: FormikHelpers<FormValues>) => {
        if (!customUrls) {
            dispatch(setCustomUrl(values.customUrl))
        } else {
            dispatch(setServerUrl(values.url))
            dispatch(setStreamUrl(values.streamUrl))
        }
        helpers.setSubmitting(false);
    }, [customUrls])
    return (
        <Box>
            <Heading level={2} margin={{vertical: 'small', top: 'none'}}>Settings</Heading>
            <Formik
                initialValues={initialForm}
                onSubmit={onSubmit}
            >
                {({ isSubmitting, values }) => (
                    <Form>
                        <Box direction="column" align="center" justify="start">
                            {customUrls ? 
                            (
                                <>
                                <FormField width={'100%'} margin={'none'} htmlFor={`set-url`} name="url" error={<ErrorMessage name="url" />}>
                                    <Field id={`set-url`} name="url" as={TextInput} placeholder='API URL' value={values.url} />
                                </FormField>
                                <FormField width={'100%'} margin={'none'} htmlFor={`set-streamUrl`} name="streamUrl" error={<ErrorMessage name="streamUrl" />}>
                                    <Field id={`set-streamUrl`} name="streamUrl" as={TextInput} placeholder='Stream URL' value={values.streamUrl} />
                                </FormField>
                            </>
                            )
                            : 
                            (
                            <FormField width={'100%'} margin={'none'} htmlFor={`set-customUrl`} name="customUrl" error={<ErrorMessage name="customUrl" />}>
                                <Field id={`set-customUrl`} name="customUrl" as={TextInput} placeholder='API URL' value={values.customUrl} />
                            </FormField>
                            ) 
                            }
                            <CheckBox checked={customUrls}
                                label='Use Custom API/Stream URLs'
                                onChange={(event) => {setCustomUrls(event.target.checked)}}
                            />
                            <Box width={'100%'}>
                                <Button label='Save Url(s)' color='status-ok' a11yTitle={'Save URL(s)'} margin='small' gap="xxsmall" type="submit" disabled={isSubmitting} icon={<Icons.CloudUpload color='status-ok' />} hoverIndicator size="small" />
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

export default EditServerSettingsForm
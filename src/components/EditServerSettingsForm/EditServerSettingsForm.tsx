import { Box, TextInput, CheckBox, FormField, Button, Heading } from "grommet"
import React from "react"
import { useAppSelector, useAppDispatch } from 'state/snapserverHooks'
import { setServerUrl, setServerId, setShowOfflineClients } from 'state/snapserverSlice'
import * as Icons from 'grommet-icons'
import { Formik, Form, Field, ErrorMessage } from 'formik';


type FormValues = {
    url: string
}

const EditServerSettingsForm: React.FC<any> = () => {
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

export default EditServerSettingsForm
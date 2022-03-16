import React from "react"
import { useAppSelector } from 'state/snapserverHooks'
import {
    Button,
    Box,
    FormField,
    TextInput
} from 'grommet'
import Controller from "classes/snapcontrol/Controller"
import Group from "types/snapcontrol/Group"
import * as Icons from 'grommet-icons'
import { Formik, Form, Field, ErrorMessage } from 'formik';


type FormProps = {
    id: string,
}

type NameFormValues = {
    id: string,
    name: string
}

const EditGroupSettingsForm: React.FC<FormProps> = ({ id }) => {
    const groupsById = useAppSelector((state) => state.groupsById)
    const instance: Group | undefined = React.useMemo(() => {
        return groupsById[id]
    }, [id, groupsById])

    const initialNameForm: NameFormValues = {
        id: id || '',
        name: instance?.name || ''
    }
    
    return (
        <Box>
            {/* <Heading level={5}>{myGroupId}</Heading> */}
            <Formik
                initialValues={initialNameForm}
                onSubmit={(values, { setSubmitting }) => {
                    Controller.getInstance().serverInstance.groupSetName(values)
                    setSubmitting(false);
                }}
            >
                {({ isSubmitting }) => (
                    <Form>
                        <Box direction="column" align="center" justify="between">
                            <FormField width={'100%'} margin={'none'} htmlFor={`${id}#name`} name="name" error={<ErrorMessage name="name" />}>
                                <Field id={`${id}#name`} name="name" as={TextInput} disabled={isSubmitting} placeholder={'Group Name'} />
                            </FormField>
                            <Box width={'100%'}>
                                <Button label='Save Name' fill={'horizontal'} color='status-ok' a11yTitle={'Save Name'} margin='small' gap="xxsmall" alignSelf="stretch" type="submit" disabled={isSubmitting} icon={<Icons.CloudUpload color='status-ok' />} hoverIndicator size="small" />
                            </Box>
                        </Box>
                    </Form>
                )}
            </Formik>
        </Box>
    )
}

export default EditGroupSettingsForm
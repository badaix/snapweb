import React from "react"
import { Client } from "types/snapcontrol"
import { useAppSelector } from 'state/snapserverHooks'
import {
    Button,
    Box,
    FormField,
    Select,
    TextInput
} from 'grommet'
import Controller from "classes/snapcontrol/Controller"
import Group from "types/snapcontrol/Group"
import * as Icons from 'grommet-icons'
import { Formik, Form, Field, ErrorMessage } from 'formik';




type FormProps = {
    id: string,
    name?: string,
    latency?: number,
}

type LatencyFormValues = {
    id: string,
    latency: number
}

type NameFormValues = {
    id: string,
    name: string
}

type GroupFormValues = {
    id: string,
    groupId: string
}

const EditClientSettingsForm: React.FC<FormProps> = ({ id }) => {
    const groupIdByClientId = useAppSelector((state) => state.groupIdByClientId)
    const groupsById = useAppSelector((state) => state.groupsById)

    const clientsById = useAppSelector((state) => state.clientsById)
    const instance: Client | undefined = React.useMemo(() => {
        return clientsById[id]
    }, [id, clientsById])

    const myGroupId = groupIdByClientId[id]

    const groups = React.useMemo(() => {
        return Object.values(groupsById).map((g, i) => {
            const data = Object.assign({}, g)
            data['label'] = `${g.name || `Group ${i + 1}`} • ${g.clients.length} Client(s)`
            return data
        }).concat([{ id: '', name: '', stream_id: '', clients: [], muted: false, label: 'New' } as Group])
    }, [groupsById])

    const initialNameForm: NameFormValues = {
        id: id || '',
        name: instance?.config.name || ''
    }
    const initialLatencyForm: LatencyFormValues = {
        id: id || '',
        latency: instance?.config.latency || 0
    }

    const initialGroupForm: GroupFormValues = {
        id: id || '',
        groupId: myGroupId || ''
    }

    const onGroupSelect = React.useCallback((clientId, groupId) => {
        if (groupId) {
            const clients = groupsById[groupId].clients.map((c) => c.id)
            clients.push(clientId)
            Controller.getInstance().serverInstance.groupSetClients({ id: groupId, clients: clients })
        } else {
            const clients = groupsById[myGroupId].clients.map((c) => c.id).filter((cId) => cId != clientId)
            Controller.getInstance().serverInstance.groupSetClients({ id: myGroupId, clients: clients })
        }
    }, [myGroupId, groupsById])
    return (
        <Box>
            {/* <Heading level={5}>{myGroupId}</Heading> */}
            <Formik
                initialValues={initialNameForm}
                onSubmit={(values, { setSubmitting }) => {
                    Controller.getInstance().serverInstance.clientSetName(values)
                    setSubmitting(false);
                }}
            >
                {({ isSubmitting }) => (
                    <Form>
                        <Box direction="column" align="center" justify="between">
                            <FormField width={'100%'} margin={'none'} htmlFor={`${id}#name`} name="name" error={<ErrorMessage name="name" />}>
                                <Field id={`${id}#name`} name="name" as={TextInput} placeholder={instance?.host.name || 'Name'} />
                            </FormField>
                            <Box width={'100%'}>
                                <Button label='Save Name' fill={'horizontal'} color='status-ok' a11yTitle={'Save Name'} margin='small' gap="xxsmall" type="submit" disabled={isSubmitting} icon={<Icons.CloudUpload color='status-ok' />} hoverIndicator size="small" />

                            </Box>
                        </Box>
                    </Form>
                )}
            </Formik>
            <Formik
                initialValues={initialLatencyForm}
                onSubmit={(values, { setSubmitting }) => {
                    Controller.getInstance().serverInstance.clientSetLatency(values)
                    setSubmitting(false);
                }}
            >
                {({ isSubmitting }) => (
                    <Form>
                        <Box direction="column" align="center" justify="between">
                            <FormField width={'100%'} margin={'none'} htmlFor={`${id}#latency`} name="latency" error={<ErrorMessage name="latency" />}>
                                <Field id={`${id}#latency`} name="latency" type='number' as={TextInput} placeholder='Latency' />
                            </FormField>
                            <Box width={'100%'}>
                                <Button label='Save Latency' color='status-ok' a11yTitle={'Save Name'} margin='small' gap="xxsmall" alignSelf="stretch" type="submit" disabled={isSubmitting} icon={<Icons.CloudUpload color='status-ok' />} hoverIndicator size="small" />
                            </Box>
                        </Box>
                    </Form>
                )}
            </Formik>
            <Formik
                initialValues={initialGroupForm}
                validate={values => {
                    const errors: Partial<Record<keyof GroupFormValues, string>> = {};
                    return errors;
                }}
                onSubmit={(values, { setSubmitting }) => {
                    if (values.groupId) {
                        const clients = groupsById[values.groupId].clients.map((c) => c.id)
                        clients.push(values.id)
                        Controller.getInstance().serverInstance.groupSetClients({ id: values.groupId, clients: clients })
                    } else {
                        const clients = groupsById[myGroupId].clients.map((c) => c.id).filter((cId) => cId != values.id)
                        Controller.getInstance().serverInstance.groupSetClients({ id: values.groupId, clients: clients })
                    }
                    setSubmitting(false);
                }}
            >
                <Select
                    value={myGroupId}
                    onChange={(event) => {
                        if (event) {
                            const groupId = event.value
                            if (groupId != myGroupId) {
                                onGroupSelect(id, groupId)
                            }
                        }
                    }}
                    a11yTitle='Select a group for this client'
                    id={`${id}#group`} name="group" type='select' placeholder='Group' valueKey={{ 'key': 'id', 'reduce': true }} labelKey={'label'} options={groups}
                />
            </Formik>
        </Box>
    )
}

export default EditClientSettingsForm
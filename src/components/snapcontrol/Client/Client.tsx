import React from "react"
import { Client, Volume } from "types/snapcontrol"
import { useAppSelector } from 'state/snapserverHooks'
import {
    RangeInput,
    Heading,
    Button,
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Layer,
    Box,
    FormField,
    Select,
    TextInput
} from 'grommet'
import Controller from "classes/snapcontrol/Controller"
import Group from "types/snapcontrol/Group"
import * as Icons from 'grommet-icons'
import { Formik, Form, Field, ErrorMessage } from 'formik';


type Props = {
    id: string,
    groupMuted?: boolean
}

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

const EditForm: React.FC<FormProps> = ({ id }) => {
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
                                <Button label='Save Name' fill={'horizontal'} color='status-ok' a11yTitle={'Save Name'} margin='small' gap="xxsmall" alignSelf="stretch" type="submit" disabled={isSubmitting} icon={<Icons.CloudUpload color='status-ok' />} hoverIndicator size="small" />

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


const NewComponent: React.FC<Props> = ({ id, groupMuted }) => {

    const clientsById = useAppSelector((state) => state.clientsById)
    const instance: Client | undefined = React.useMemo(() => {
        return clientsById[id]
    }, [id, clientsById])
    const VolumeIcon = React.useMemo(() => {
        const isMuted = typeof instance?.config.volume.muted === 'boolean' ? instance?.config.volume.muted : false
        return isMuted == true ? Icons.VolumeMute : Icons.Volume

    }, [instance?.config.volume.muted])

    const disabled = React.useMemo(() => {
        return !instance?.connected
    }, [instance?.connected])

    const [show, setShow] = React.useState<boolean>(false);

    const onMuteToggle = React.useCallback(() => {
        const newVolume: Volume = Object.assign({ percent: 0, muted: true }, instance?.config.volume)
        newVolume['muted'] = !newVolume['muted']
        Controller.getInstance().serverInstance.clientSetVolume({ id: instance?.id, volume: newVolume })
    }, [instance?.config.volume, instance?.id])

    const onVolumeChange = React.useCallback((ev: React.ChangeEvent<HTMLInputElement>) => {
        const percent = ev.currentTarget.valueAsNumber
        const newVolume: Volume = Object.assign({ percent: 0, muted: true }, instance?.config.volume, { percent: percent })
        Controller.getInstance().serverInstance.clientSetVolume({ id: instance?.id, volume: newVolume })
    }, [instance?.config.volume, instance?.id])
    return (
        <>
            <Card elevation="0" round={false}>
                <CardHeader align="center" justify="start">
                    <Heading level={4} margin={{ 'horizontal': 'small', vertical: 'none' }}>
                        {instance?.config.name || instance?.host.name}
                    </Heading>
                </CardHeader>
                <CardBody justify="between" direction="row" align="center">
                    <Button
                        icon={<VolumeIcon color="black" />}
                        hoverIndicator
                        onClick={onMuteToggle}
                        disabled={disabled}
                    />
                    <RangeInput
                        max={100}
                        min={0}
                        disabled={disabled}
                        step={1}
                        color={disabled || groupMuted ? 'status-disabled' : 'status-ok'}
                        onChange={onVolumeChange}
                        value={instance?.config.volume.percent} />
                    <Button
                        icon={<Icons.Edit color="black" />}
                        hoverIndicator
                        onClick={() => { setShow(true) }}
                    />
                </CardBody>
                <CardFooter>
                </CardFooter>
            </Card>
            {show && (
                <Layer
                    onEsc={() => setShow(false)}
                    onClickOutside={() => setShow(false)}
                    background={{opacity: 'strong', color: 'light-4'}}
                >
                    <Box pad={'small'} gap='small' justify="start" background={{ opacity: 'strong', color: 'light-4' }}>
                        <EditForm id={id} />
                        <Box justify="end" >
                            <Button a11yTitle="Close Modal" label="Close" onClick={() => setShow(false)} />
                        </Box>
                    </Box>
                </Layer>
            )}
        </>
    )
}

export default NewComponent
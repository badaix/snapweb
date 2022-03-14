import React from "react"
import { useAppSelector } from 'state/snapserverHooks'
import { Select, SelectExtendedProps } from 'grommet'

const NewComponent: React.FC<SelectExtendedProps> = ({ options, margin, placeholder, ...props }) => {
    const streamsById = useAppSelector((state) => Object.values(state.streamsById).map((stream) => {
        const label = `${stream.id}: ${stream.status}`
        return Object.assign({}, stream, {label})
    }))
    return (
        <Select placeholder={placeholder || 'Stream ID'} margin={ margin || 'none'} valueKey={{'key': 'id', 'reduce': true}} labelKey={'label'} options={streamsById} {...props} />
    )
}

export default NewComponent
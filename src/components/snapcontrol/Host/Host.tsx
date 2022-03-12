import React from "react"
import Host from "types/snapcontrol/Host"


const NewComponent: React.FC<Host> = ({children, ...host}) => {

    const instance: Host = React.useMemo(() => {
        return host
    }, [host])
    return (
        <div>
            <ul>
                <li>{instance.name}</li>
                <li>{instance.ip}</li>
                <li>{instance.os}</li>
                <li>{instance.arch}</li>
                <li>{instance.mac}</li>
            </ul>
        </div>
    )
}

export default NewComponent
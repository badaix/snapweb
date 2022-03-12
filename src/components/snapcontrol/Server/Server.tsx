import React from "react"
import Server from "types/snapcontrol/Server"
import Host from "components/snapcontrol/Host"


const NewComponent: React.FC<Server> = ({children, ...server}) => {

    const instance = React.useMemo(() => {
        return server.server
    }, [server.server])

    const host = React.useMemo(() => {
        return instance.host
    }, [instance.host])

    const snapserver = React.useMemo(() => {
        return instance.snapserver
    }, [instance.snapserver])
    return (
        <div>
            <Host {...host} />
        </div>
    )
}

export default NewComponent
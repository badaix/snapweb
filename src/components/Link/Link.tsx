import React from "react"
import PropTypes from "prop-types"
import { Anchor } from "grommet"
import { navigate } from "gatsby"

const Link: React.FC<any> = ({ to, ...rest }) => (
  <Anchor
    href={to}
    onClick={ev => {
      navigate(to)
      ev.preventDefault()
    }}
    {...rest}
  />
)

Link.propTypes = {
  to: PropTypes.string,
}
export default Link
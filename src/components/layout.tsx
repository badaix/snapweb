/**
 * Layout component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.com/docs/use-static-query/
 */

import React from "react"
import PropTypes from "prop-types"

import Header from "components/Header"
import "components/layout.css"
import { Grommet, Box } from "grommet"
import { grommet, ThemeType } from "grommet/themes"
import { Provider } from 'react-redux'
import configureStore from 'state/snapserverStore'
import { PersistGate } from 'redux-persist/integration/react'

import Footer from 'components/Footer'

const { persistor, store } = configureStore()


const newTheme: ThemeType = {
  'global': {
    'colors': {
      'brand': '#607d8b'
    }
  }
}

const theme: ThemeType = Object.assign({}, grommet, newTheme)

const Layout = ({ children }) => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Grommet
          theme={theme}
          full
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Header/>
          <Box as="main" pad="small" flex overflow="auto">
            {children}
          </Box>
          <Footer />
        </Grommet>
      </PersistGate>
    </Provider>
  )
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default Layout

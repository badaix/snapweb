// If you don't want to use TypeScript you can delete this file!
import * as React from "react"
import { PageProps, graphql } from "gatsby"

import Layout from "components/layout"
import Seo from "components/seo"
import Controller from "components/snapcontrol/Controller"

type DataProps = {
  site: {
    buildTime: string
  }
}

const UsingTypescript: React.FC<PageProps<DataProps>> = () => {
  return (
    <Layout>
      <Seo title="Using TypeScript" />
      <Controller />
    </Layout>
  )
  }

export default UsingTypescript

export const query = graphql`
  {
    site {
      buildTime(formatString: "YYYY-MM-DD hh:mm a z")
    }
  }
`

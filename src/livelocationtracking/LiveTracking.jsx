import React, { useEffect } from "react"

import LiveMap from "./LiveMap"
import { initializepubsubsocket } from "../connections/pubsubsocket"

const LiveTracking = () => {

  return(
    <>
      <p>Live Tacking</p>
      <div style={{ width: "100%", height: "100%" }}>
        {/* <LiveMap 
          data={[{
            originLatitude: 13.1148331, 
            originLongitude: 80.1890757, 
            adjusterId: 'adjusterid', 
            lastUpdated: 1708799038643,
            adjusterName: 'arun'
            },
            {
            originLatitude: 13.1147619, 
            originLongitude: 80.1891481, 
            adjusterId: 'adjusterid', 
            lastUpdated: 1708799038643,
            adjusterName: 'pradeep'
            },
            {
            originLatitude: 13.1147619, 
            originLongitude: 80.1891481, 
            adjusterId: 'adjusterid', 
            lastUpdated: 1708799038643,
            adjusterName: 'pradeep'
          }]}
          navFromMenu={false}
        /> */}
      </div>
    </>
  )
}

export default LiveTracking
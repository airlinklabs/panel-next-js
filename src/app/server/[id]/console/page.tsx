"use client"

import React, { use } from 'react'
import { useParams } from 'next/navigation'

export default function Console(){
    return(
        <div>
            server ID: {useParams().id}
        </div>
    )
}
"use client";
import { JitsiMeeting } from '@jitsi/react-sdk';

export default function Test() {
    return (
        <div>
            <JitsiMeeting
                domain = {process.env.NEXT_PUBLIC_JITSI_DOMAIN}
                roomName = "PleaseUseAGoodRoomName"
                configOverwrite = {{
                    startWithAudioMuted: true,
                    disableModeratorIndicator: true,
                    startScreenSharing: true,
                    enableEmailInStats: false
                }}
                interfaceConfigOverwrite = {{
                    DISABLE_JOIN_LEAVE_NOTIFICATIONS: true
                }}
                userInfo = {{
                    displayName: 'YOUR_USERNAME',
                    email: 'YOUR_EMAIL'
                }}
                onApiReady = { (externalApi) => {
                    // here you can attach custom event listeners to the Jitsi Meet External API
                    // you can also store it locally to execute commands
                } }
                getIFrameRef = { (iframeRef) => { iframeRef.style.height = '900px'; } }
            />
        </div>
    )
}
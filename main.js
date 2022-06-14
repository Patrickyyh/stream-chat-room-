let localStream  ;
let remoteStream ;
let peerConnection; 
let APP_ID = 'cc69dcd186d6426da879cdc7dd451cb6';
let token = null;

// create the uid for each user who would like to join the room. 
let uid = String(Math.floor(Math.random() * 10000));



let channel;
let client ; 


 // const configuration = {'iceServers': [{'urls': 'stun:stun.l.google.come:19302'}]};
    // peerConnection = new RTCPeerConnection(configuration);
    // signalingChannel.addEventListener('message', async message =>{
            
    //     if(message.answer){
    //         const remoteDesc = new RTCsessionDescription(message.answer);
    //         await peerConnection.setRemoteDescription(remoteDesc);
    //     }

    //     if(message.offer)
                
    //         peerConnection.setRemoteDescription(new RTCsessionDescription(message.offer));
    //         const answer = await peerConnection.createAnswer();
    //         await peerConnection.setLocalDescription(answer)
    //         signalingChannel.send({'answer':answer})
    //     }

    // })


 
const server =  {
    'iceServers': [
        {
            'urls': ['stun:stun1.l.google.come:19302', 'stun:stun2.l.google.com:19302']
        }
    ]
};


const LocaldeviceRequest = {
    video:true,
    audio:false,
}


let init = async()=>{

     // Create Agor instance 
    client = await AgoraRTM.createInstance(APP_ID);
    await client.login({uid, token});

     //index.html?room = 234234
     // create the channel and join the channel
    channel = client.createChannel('main');
    await channel.join(); 
    
    // adds the listener function to the channel 
    // for the event named (eventName)
    channel.on('MemberJoined',    handleUserJoined);

    // handle the message with another handler by the client 
    client.on('MessageFromPeer' ,handleMessageFromPeer);


    
    
    // sending the request permission to the camera feed 
    // The call to get user media will trigger a permission request 
    // getUserMedia will return a MediaStream 
    localStream =  await navigator.mediaDevices.getUserMedia(LocaldeviceRequest);
    
    // Local playback
    document.getElementById('user-1').srcObject = localStream; 

    

};

let  handleMessageFromPeer =  async (message , MemberUID)=>{
    //console.log("message: ", message.text);
    message = JSON.parse(message.text)
    
    
    console.log("message: ", message);


}

let handleUserJoined = async (MemberUID) =>{
    console.log('A new User joind the channel: fe',MemberUID);
    createOffer(MemberUID); 
    
}

let createOffer =    async (MemberUID) => {
    
   
    peerConnection = new RTCPeerConnection(server);
    remoteStream   = new MediaStream();
    document.getElementById('user-2').srcObject = remoteStream;


    // retrive all the tracks of audio and video by calling getTracks
    // and add the sets of tracks and transmit it to other peer. 
   
    if(!localStream){
        localStream =  await navigator.mediaDevices.getUserMedia(LocaldeviceRequest);
    }


    localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track,localStream);
    });

     // event listner and listen for track comes from another user 
     peerConnection.ontrack =  (event)=>{
         event.streams[0].getTracks().forEach((track) => {
             remoteStream.addTrack()
         })
     }

     
     // Trickle ICE 
     // Gathr ice candidates , listen for local ice candidates 
     peerConnection.addEventListener('icecandidate' ,event => {
         if(event.candidate){
            client.sendMessageToPeer({text: JSON.stringify({'type': 'candidate', 'candidate': event.candidate})},MemberUID);
            document.getElementById('user-1').srcObject = localStream; 
        }
     }); 

     // Listen for remote ICE candidate and add them to the local RTCpeerConnection 

     
     
    // createk offer and send the offer 
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    // sending offer to the peer user. 
    
    client.sendMessageToPeer({text: JSON.stringify({'type': 'offer', 'offer': offer})},MemberUID); 

    k

}

let createAnswer  =  async (MemberUID) => {
    
}

init();

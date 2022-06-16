let localStream  ;
let remoteStream ;
let peerConnection; 
let APP_ID = 'cc69dcd186d6426da879cdc7dd451cb6';
let token = null;

// create the uid for each user who would like to join the room. 
let uid = String(Math.floor(Math.random() * 10000));
let channel;
let client ; 

// get the query params from the URL 
let queryString = window.location.search
let urlParams = new URLSearchParams(queryString)
let roomId = urlParams.get('room');

if(!roomId){
    // redirect the user back to the looby if no roomId query. 
    window.location = 'lobby.html'

}

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
    video:{
        width: {min: 640, iedal:1920, max:1920},
        height : {min: 480, iedal:1080, max:1080}
    },
    audio:false,
}


let init = async()=>{

     // Create Agor instance 
    client = await AgoraRTM.createInstance(APP_ID);
    await client.login({uid, token});

     //index.html?room = 234234
     // create the channel and join the channel
     // get roomId from the query parameter 
    channel = client.createChannel(roomId);
    await channel.join(); 
    
    // adds the listener function to the channel 
    // for the event named (eventName)
    channel.on('MemberJoined',   handleUserJoined);

    // handle the message with another handler by the client 
    client.on('MessageFromPeer' ,handleMessageFromPeer);

    // event listener listens for the the client leaves the channel
    channel.on('MemberLeft', handleUserLeft);

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
    

    // Set up the UDP offer and answer
    if(message.type === 'offer'){
        createAnswer(MemberUID,message.offer); 

    }

    if(message.type === 'answer'){
        addAnswer(message.answer); 
    }

    // set up the ICE candidate
    
    if(message.type === 'candidate'){
            
        if(peerConnection){
          await peerConnection.addIceCandidate(message.candidate);
         }
    }  
 }



let handleUserJoined = async (MemberUID) =>{
    console.log('A new User joind the channel: fe',MemberUID);
    createOffer(MemberUID); 
}


let handleUserLeft = async () => {
    // this action only take effect when the user really leaves the channel. 
    document.getElementById('user-2').style.display = 'none';
    document.getElementById('user-1').classList.remove('smallFrame');
}


let createPeerConnection = async (MemberUID)=> {
    
    
    peerConnection = new RTCPeerConnection(server);
    remoteStream   = new MediaStream();
    document.getElementById('user-2').srcObject = remoteStream;
    // show the second screen when the user-2 joins the room. 
    document.getElementById('user-2').style.display = 'block';
    

    document.getElementById('user-1').classList.add('smallFrame');
    // retrive all the tracks of audio and video by calling getTracks
    // and add the sets of tracks and transmit it to other peer. 
    if(!localStream){
        localStream =  await navigator.mediaDevices.getUserMedia(LocaldeviceRequest);
        document.getElementById('user-1').srcObject = localStream; 
    }

    localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track,localStream);
    });

     // event listner and listen for track comes from another user 
     peerConnection.ontrack =  (event)=>{
         event.streams[0].getTracks().forEach((track) => {
             remoteStream.addTrack(track);
         })
     }

   
     // Trickle ICE 
     // Gathr ice candidates , listen for local ice candidates 
     peerConnection.addEventListener('icecandidate' ,event => {
         if(event.candidate){
            client.sendMessageToPeer({text: JSON.stringify({'type': 'candidate', 'candidate': event.candidate})},MemberUID);
        }
     }); 

}



let createOffer =    async (MemberUID) => {
    
    
     // Listen for remote ICE candidate and add them to the local RTCpeerConnection 
     await createPeerConnection(MemberUID);
    // createk offer and send the offer 
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    // sending offer to the peer user. 
    
    client.sendMessageToPeer({text: JSON.stringify({'type': 'offer', 'offer': offer})},MemberUID); 

}


// create SDP AND ICE answer for the second user. 
let createAnswer  =  async (MemberUID,offer) => {

    await createPeerConnection(MemberUID);
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    client.sendMessageToPeer({text: JSON.stringify({'type': 'answer' , 'answer': answer})}, MemberUID); 


}

let addAnswer = async (answer) => {
    if(!peerConnection.currentRemoteDescription){
        peerConnection.setRemoteDescription(answer); 
    }

}

let toggleCamera = async () => {
    let videoTrack = localStream.getTracks().find(track => track.kind === 'video')

    if(videoTrack.enabled){
        videoTrack.enabled = false
        document.getElementById('camera-btn').style.backgroundColor = 'rgb(255, 80, 80)'
    }else{
        videoTrack.enabled = true
        document.getElementById('camera-btn').style.backgroundColor = 'rgb(179, 102, 249, .9)'
    }

}


let toggleMic= async () => {
    let micTrack = localStream.getTracks().find(track => track.kind === 'audio')

    if(micTrack.enabled){
        micTrack.enabled = false
        document.getElementById('mic-btn').style.backgroundColor = 'rgb(255, 80, 80)'
    }else{
        micTrack.enabled = true
        document.getElementById('mic-btn').style.backgroundColor = 'rgb(179, 102, 249, .9)'
    }

}

let leaveChannel = async () => {
    await channel.leave();
    await client.logout();
}

window.addEventListener('beforeunload', leaveChannel); 
document.getElementById('camera-btn').addEventListener('click', toggleCamera); 
document.getElementById('mic-btn').addEventListener('click', toggleMic); 

init();

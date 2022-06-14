## Why use websockets at all 
1. UDP is not repliable protocol for transferring important data 
2. No build in signaling
3. UDP does not validate data 



# What exactly is sent between the two clients and how is it sent
1. SDP
  - A Session Description Protocol
  - an object containing information about the session connection 
  such as the codec, address, media type and video and so on 

2. ICE Candiate 
- An ICE candiate is public IP address and port that could potientialy
 be an address that receives data.

# How to send the ICE candiate
once the udp has been built, we make a series of request to 
the stun server to generate the ice candidate. 

- We also could trickle the ICE into the SDP without using the signaling 




Local playback
Once a media device has been opened and we have a MediaStream available, we can assign it to a video or audio element to play the stream locally.
`

`

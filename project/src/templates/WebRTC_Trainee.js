import  React from 'react';
import io from 'socket.io-client';
import '../assets/videoChat.css';
import Video from '../components/Videoo/video';
import Videos from '../components/Videoo/videos';

const ENDPOINT = 'http://localhost:8080'
// const ENDPOINT = 'https://intense-waters-57856.herokuapp.com';

class WebRTC_Trainee extends React.Component{
  constructor(porps) {

    super(porps);
    this.state = {
      localStream: null,
      remoteStream: null,

      remoteStreams: [],
      peerConnections: {},
      selectedVideo: null,

      stauts: 'Please wait ...',

      sdpConstraints: {
        'mandatory': {
          'OfferToReceiveAudio': true,
          'OfferToReceiveVideo': true
        }
      }
    }
    // this.localVideoRef = React.createRef();
    // this.remoteVideoRef = React.createRef();
    this.socket = null;
    this.peerConnection = null;
    this.candidates = [];
    this.user = 'trainee';
    this.pc_config = {
      "iceServers": [
        {
          urls: 'stun:stun.l.google.com:19302'
        }
      ] 
    }
  }

  getLocalStream = () => {
    const success = (stream) => {
      window.localStream = stream
      this.setState({
        localStream: stream
      })
      this.whoisOnline()
    }

    const failure = (e) => { 
      console.log('getUserMedia Error:', e)
    }

    const constrains = { video: true };
    navigator.mediaDevices.getUserMedia(constrains)
      .then(success)
      .catch(failure);
  }

  whoisOnline = () => {
    this.sendToPeer('onlinePeers',
      null, 
      {local: this.socket.id, user: this.user})
  }

  //WebSocketサーバーに送信
  sendToPeer = (messageType, payload, socketID) => {
    this.socket.emit(messageType, {
      socketID,
      payload
    })
  }

  createPeerConnection = (socketID,callback) => {
    try {  
      let pc = new RTCPeerConnection(this.pc_config);
      const peerConnections = { ...this.state.peerConnections, [socketID]: pc }
      this.setState({
        peerConnections
      })
      
      pc.onicecandidate = (e) => {
        if(e.candidate){//自分のcandidateを取集後
          this.sendToPeer('candidate',e.candidate,{
            local: this.socket.id,
            remote: socketID
          });
        }
      }
  
      pc.onconnectionstatechange = (e) => {
        console.log(e);
      }
  
      pc.ontrack = (e) => {
        const remoteVideo = {
          id: socketID,
          name: socketID,
          stream: e.streams[0]
        }

        this.setState(prevState => {
          const remoteStream = prevState.remoteStreams.length > 0 ? {} : { remoteStream: e.streams[0] }
          let selectedVideo = prevState.remoteStreams.filter(stream => stream.id === prevState.selectedVideo.id)
          selectedVideo = selectedVideo.length ? {} : { selectedVideo: remoteVideo }


          return {
            ...selectedVideo,
            ...remoteStream,
            remoteStreams: [...prevState.remoteStreams, remoteVideo]
          }
        })
      }

      if(this.state.localStream){
        pc.addStream(this.state.localStream)
      }
      callback(pc)

    } catch(e) {
      callback(null);
      console.log(e);
      console.log("間違え")
    }
  }

  //オファーの作成

  componentDidMount(){
    this.socket = io(ENDPOINT);
    this.socket.emit('join',{id: this.socket.id, user:this.user ,roomName: this.props.match.params.id});
   
    //接続完了
    this.socket.on('connection-success', success => {
      this.getLocalStream();
    })

    this.socket.on('online-peer',socketID => {
      this.createPeerConnection(socketID,pc => {
        if(pc)
          pc.createOffer(this.state.sdpConstraints)
            .then(sdp => {
              pc.setLocalDescription(sdp)
              this.sendToPeer('offer',sdp,{
                local: this.socket.id,
                remote: socketID
              })
            })
      })
    })

    this.socket.on('offer',data => {
      this.createPeerConnection(data.socketID,pc => {
        pc.addStream(this.state.localStream)

        pc.setRemoteDescription(new RTCSessionDescription(data.sdp)).then(() => {
          pc.createAnswer(this.state.sdpConstraints)
            .then(sdp => {
              pc.setLocalDescription(sdp)
              this.sendToPeer('answer', sdp, {
                local: this.socket.id,
                remote: data.socketID,
                user: this.user
              })
            })
        })
      })
    })

    this.socket.on('answer', data => {
      const pc = this.state.peerConnections[data.socketID];
      console.log(data.sdp);
      pc.setRemoteDescription(new RTCSessionDescription(data.sdp)).then(()=>{})
    })


    //SDPを受け取る
    // this.socket.on('offerOrAnswer', (sdp) => {
    //   const pc = this.peerConnection;
    //   this.textref.value = JSON.stringify(sdp);
    //   pc.setRemoteDescription(new RTCSessionDescription(sdp))
    // })

    //経路情報を受け取る
    this.socket.on('candidate', (data) => {
      // this.candidates = [...this.candidates, candidate ];
      const pc = this.state.peerConnections[data.socketID];
      if(pc){
        pc.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    })

    //ーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
  }
  switchVideo = (_video) => {
    console.log(_video)
    this.setState({
      selectedVideo: _video
    })
  }

  render(){
    return(
      <div className="stream">
        <div className="webVideo">
          <Video
            videoStyles={{
              zIndex: 2,
              position: 'absolute',
              right: 0,
              width: 200,
              height: 200,
              backgroundColor: 'black'
            }}
            videoStream={this.state.localStream}
          />
          <Video 
            videoStyles={{
              zIndex:1,
              position: 'fixed',
              marignTop: 65,
              marign: 5,
              bottom: 0,
              minWidth: '100%',
              minHeight: '80%',
              backgroundColor: 'black'

            }}
            videoStream={this.state.selectedVideo && this.state.selectedVideo.stream} 
          />
        </div>
        <Videos
          switchVideo={this.switchVideo}
          remoteStreams={this.state.remoteStreams}
        ></Videos>
        <br />
      </div>
    )
  }
}

export default WebRTC_Trainee;